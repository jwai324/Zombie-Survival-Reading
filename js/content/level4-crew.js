/* Reading level 4: the crew at home base. Talk, tips, reports and the dog.
   Facts: js/story-crew.js and js/story-quests.js. See docs/CREW.md and docs/TEXT_GUIDE.md.
   This file holds talk, tips, reports and the dog; the story quests and errands are in level4-quests.js.
   Level 4: sentences of 18 words or fewer, richer vocabulary, a little humor and voice.
   Talk 55 to 100 words; tips, reports and the dog 22 to 44. Every text names its speaker. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[4] = root.ZSR.TEXT[4] || { level: 4 });
  T.crew = T.crew || {};

  /* ---------- Talk: one story topic or mood line in every bubble ---------- */
  T.crew.talk = Object.assign(T.crew.talk || {}, {
    /* June: dry, warm, in her sixties, a retired school gardener */
    "june-t1": {
      title: "June's Green Ledger",
      text: "June was a school gardener for years before the Fall. She taught kids which end of a seed goes down. Now she keeps the crew's days in a green ledger, one page for each day. She writes down the weather, the food count, and anything worth remembering. The ledger sits on the radio shelf in the dining room, and you can read the old pages there. “Somebody ought to keep a record,” June says. “Days slip away if nobody writes them down.”",
    },
    "june-t2": {
      title: "Into the Closet",
      text: "June says the crew hides in the office closet during a wave. They squeeze in beside the big battery, shut the door, and keep very still. Even so, walkers that get into the closet can hurt someone. Patching that person up costs a medical kit from storage. If there is none, it costs 2 food instead. So when walkers break into the cabin, clear it fast. “We will be quiet as mice,” June says. “You be quick as a cat.”",
    },
    "june-t3": {
      title: "Counting the Food",
      text: "June counts the food every night and writes the number in her ledger. It is her least favorite page, she admits, because numbers do not care how hard anyone worked. Every trip in the van eats 1 food crate, good trip or bad. With no food left, the van goes out weak. So June says to bring food home whenever you can. “A can of beans is never a wasted stop,” she says.",
    },
    "june-t4": {
      title: "The Dinner Bell",
      text: "June says Dan Hollis hung the dinner bell on the porch. He wanted his kids to hear it in the woods. She guesses Gus, Finn, and Lucy came running every evening. Now walkers come to it too. Ring it, and a wave comes a few seconds later, every time. So only ring it when you are ready to fight. June misses bells that only meant supper. She touches the rope sometimes on her way past, but she never pulls it.",
    },
    "june-t5": {
      title: "Tape and a Clean Cloth",
      text: "June keeps tape and a clean cloth in her cardigan pocket, just in case. Years of schoolyards taught her that scrapes happen. Now, if you come to her hurt, she patches you up once between waves. Just walk up and talk to her. A medical kit still heals you all the way, though. The backpack carries 3 of them, so keep it full before every trip. “My tape is good,” June says. “A kit is better.”",
    },
    "june-t6": {
      title: "Rosa's Greenhouses",
      text: "June's old friend Rosa ran the greenhouses at Greenhouse Row. Rosa once grew a pumpkin so big it needed its own wheelbarrow, June says. If anyone still has seeds, it is Rosa. Seed packets and a bag of soil start a Garden, and a Garden grows food every day. That means a fuller pantry and fewer hungry trips. June has already picked the spot where the beans will go. She picked it on the very first morning.",
    },
    "june-t7": {
      title: "One Finger Deep",
      text: "June taught her school kids to plant a seed one finger deep, then wait. Waiting was always the hardest lesson, she says. She says the town's shelves work the same way. What you take from a shelf or the floor is back 3 days later. So a good store is worth a second trip. But what you take from a locked room never comes back. “Plant, wait, and pick again,” June says. “Just not from the locked rooms.”",
    },
    "june-t8": {
      title: "Rosa's Planting Chart",
      text: "You tell June about Rosa's planting chart, the one you found at Greenhouse Row. June asks what the last line says. It is about her beans. June smiles at that, slowly, and takes off her glasses for a moment. She says Rosa never forgets a friend. Then she taps your backpack. Notes you bring home stay in your backpack, so you can read them again. June would like to hear that one twice.",
    },
    "june-t9": {
      title: "Keeping the Garden Going",
      text: "June says Kate Hollis's note on the fridge asked whoever found the cabin to keep the garden going. Now there is one, and June tends it every morning before breakfast. Each new level of the Garden grows more food each day. June calls it the only bank in town that still pays. She also says a cabin with a garden is hard to leave, even for the River Convoy. She does not say more. She just brushes the dirt off her gloves.",
    },
    "june-t10": {
      title: "Pip's Problem",
      text: "June says {dog} is Pip's problem, not hers. Then she slips it the last of her beans when she thinks nobody is looking. She writes its supper in the ledger like everyone else's, on a line of its own. June is glad of one thing. Walkers never hurt {dog}, so nobody has to guard it in a wave. “Still Pip's problem,” June says, but she is smiling.",
    },
    "june-m1": {
      title: "Cold Mornings",
      text: "June rubs her knees and winces a little. Her knees ache on cold mornings. She says that is how she knows it is morning, so she never needs an alarm clock. “Mine come with a creak built in,” she says. A mug of hot water and a slow walk loosen them up, mostly. Her knees may complain, June says, but they still get her where she is going.",
    },
    "june-m2": {
      title: "The First Rule",
      text: "June holds up one finger, the way she once did for a garden full of schoolkids. She says the most important rule is to say where you are going before you go. That way, if something goes wrong, the crew knows where to start looking. It works for a trip across town and for a walk to the porch. “Tell me, tell Tomas, or tell Pip,” June says. “Just tell somebody.”",
    },
    "june-m3": {
      title: "Quiet Days",
      text: "June taps the green ledger tucked under her arm. She says quiet days are not wasted. They are how you get ready for loud ones. So fix the fence and count the food while it is quiet. Then rest for a minute, she adds, because resting is part of getting ready too. “Walkers never wait for anyone,” June says. “So we get ready early.”",
    },
    "june-m4": {
      title: "Honest, Not Neat",
      text: "June shows you a ledger page with an ink blot shaped like a rabbit. She says a ledger only has to be honest, not neat. She writes down the bad days too, not only the good ones. Someday, she says, somebody will want to know how things really went. “If I only wrote the good days, it would be a fairy tale,” June says. “This is a record.”",
    },
    "june-m5": {
      title: "The School Sunflowers",
      text: "June goes quiet and looks far away for a moment. She wonders where her old school kids are now. Every spring, they planted sunflowers along the school fence. By summer, the flowers stood taller than the teachers, and the kids were proud for weeks. She hopes they are safe, wherever they went. She hopes they remember the sunflowers. Then June blinks, smiles, and goes back to work.",
    },

    /* Tomas: seventeen, engines, stubborn, earnest */
    "tomas-t1": {
      title: "Old but Honest",
      text: "Tomas is seventeen, and he keeps the van alive with wire, tape, and stubbornness. He pats its hood the way some people pat a horse. He says the van is old but honest, like a good mule. It does not heal on its own, though. Damage to the van stays from one trip to the next. Fix it at the office computer, or at the van before you go. “Take care of her,” Tomas says, “and she brings you home.”",
    },
    "tomas-t2": {
      title: "Fixing the Fence",
      text: "Tomas fixes fence holes and cracks himself when it is quiet. He tells you about it the next time you talk. Each of his fixes costs the base 1 scrap, the same as yours. Boards do not grow on trees, after all. Well, they do, he admits, but not fast enough. Holes never close on their own. To fix one yourself, stand at the gap and press E. “A fence is only as strong as its worst board,” Tomas says.",
    },
    "tomas-t3": {
      title: "Walkers Are Listening",
      text: "Tomas says walkers listen the way he listens to an engine, with their whole bodies. They catch every bang and every clatter. Every shot you fire in the quiet brings the next wave sooner. So save your shooting for the wave itself, when the walkers are already here. A bow makes no sound, so walkers do not hear it. “If you have to shoot in the quiet,” Tomas says, “shoot quietly.”",
    },
    "tomas-t4": {
      title: "Every Hinge by Its Squeak",
      text: "Tomas knows every hinge in the cabin by its squeak. Some doors honk like geese, he says, and some whine like a cat at dinnertime. He says walkers smash windows and climb in. Nobody can climb out through a broken one, so never plan an escape that way. A broken door or window costs 2 scrap to fix. Press E at it, or use the office computer to fix them all.",
    },
    "tomas-t5": {
      title: "Wrenches Under Cars",
      text: "Tomas learned engines from his father, lying on a cold floor and handing him wrenches under cars. His father learned the trade from Mr. Ortiz at Ortiz Auto. So in a way, Tomas learned from Mr. Ortiz too. Tomas hopes Mr. Ortiz is still out there somewhere. Then he gets practical again. He says most van upgrades stop at level 2 until you build a Garage. “A real shop changes everything,” Tomas says.",
    },
    "tomas-t6": {
      title: "A Garage at Last",
      text: "Tomas finally has a garage, like the one his father worked in. He has already hung his tools on the wall, each one inside its own painted outline. With the Garage built, the van comes home fixed after every trip, for free. Each Garage level also lets the van's upgrades go one level higher. Tomas cannot stop smiling about it. “Now we are talking,” he says, to nobody in particular.",
    },
    "tomas-t7": {
      title: "Up the River Road",
      text: "Tomas thinks the van could make it up the river road if the River Convoy ever leaves. He has checked the tires, the belts, and the brakes twice. June is not sure she wants to go. Tomas will not go without her, and he says so firmly. So for now, he keeps the van ready either way. He says each Armor Plating upgrade gives the van 30 more health. “A tough van is a calm van,” Tomas says.",
    },
    "tomas-t8": {
      title: "Gus's Room",
      text: "Tomas sleeps in Gus's room, under a sign that says KEEP OUT. Tomas says the sign now means Pip, mostly. Gus left a guitar there with two broken strings. Tomas wants to fix it someday, once he finds strings that fit. For now he can play one sad song on the four that are left. Tomas also fixes the cabin's broken doors and windows himself now, when it is quiet. He tells you about it the next time you talk.",
    },
    "tomas-t9": {
      title: "Good News from the Tower",
      text: "You tell Tomas what Dev's note says: Mr. Ortiz is safe at the Water Tower with Theo. Tomas goes quiet for a long moment. Then he grins, wider than you have ever seen. He says a Garage is the first thing Mr. Ortiz would want to see. It is built from engine parts and a tool kit. “He would check every bolt,” Tomas says. “Then he would find the one I missed.”",
    },
    "tomas-t10": {
      title: "Traps Out First",
      text: "Tomas remembers the night walkers hit the fence from every side at once. He still hears the boards cracking sometimes. Next time, he wants traps out first. Spike traps need the Walls at level 2, and blast traps need level 3. Make them at the workbench, from the office computer. Then, in the yard, press T for a spike trap or R for a blast trap. “Let the traps say hello first,” Tomas says.",
    },
    "tomas-m1": {
      title: "Talking to the Engine",
      text: "Tomas has a smudge of grease on his nose again. He whistles under the van and talks to the engine like an old friend. He tells it the road is short today and the hills are gentle. Neither is true, but he says engines like good news. “Come on, old girl,” Tomas murmurs. “One more trip, and I will find you a new belt.”",
    },
    "tomas-m2": {
      title: "Ticks, Knocks, and Squeals",
      text: "Tomas taps his wrench against his palm, like a teacher with a pointer. He says a tick means one thing, a knock means another, and a squeal means stop right now. A tick is usually small and easy to fix. A knock is never good news. A squeal means you stop, with no arguing and no finishing the trip. “Engines tell you everything,” he says, “if you stay quiet and listen.”",
    },
    "tomas-m3": {
      title: "A Quiet Fix",
      text: "Tomas wipes his hands on the red rag in his back pocket. That rag has seen a hundred engines, he says proudly. He says a good fix is a quiet one: no rattles, no squeaks. If something still rattles, he is not finished yet. He would rather spend an extra hour than leave one loose bolt. “Quiet means done,” Tomas says, looking very pleased with himself.",
    },
    "tomas-m4": {
      title: "Half His Bread",
      text: "At supper, Tomas slips Pip half his bread under the table, as smooth as a card trick. June pretends not to see. Everyone knows she sees everything. Tomas says Pip is still growing, and he is not. Pip says thank you with crumbs on their chin. “Same rations for everyone,” June says, without looking up. Tomas just grins at his plate.",
    },
    "tomas-m5": {
      title: "Room to Breathe",
      text: "Tomas has a rule about fuel cans, and he shares it whether you ask or not. He says fuel needs room in the heat. So he fills a can to the line, never to the top. Warm fuel swells, and a can filled to the brim can leak or burst. He keeps the cans far from the stove, too. “Fuel is a good worker,” Tomas says, “and a terrible roommate.”",
    },
    "tomas-m6": {
      title: "Shut the Doors",
      text: "Tomas spins his wrench in one hand while he talks. He says to shut the doors inside the cabin when walkers get in. A shut door slows them down, even though they can force it open. Every second they spend pounding is a second for you to aim. An open door just waves them through. “Make them work for it,” Tomas says.",
    },

    /* Pip: eleven, curious, asks big questions; they / them */
    "pip-t1": {
      title: "A Row on the Chart",
      text: "Pip is eleven and wants a dog more than anything. Pip added a row to the Hollis chore chart in the dining room, in pencil. It says: Pip feeds the dog we do not have yet. Pip says it is good to be ready. The Hollis family left notes on walls all over the cabin, too. Walk up close to one, and you can read it. Pip has read every one twice and has questions about all of them.",
    },
    "pip-t2": {
      title: "Counting the Minutes",
      text: "Pip counts the minutes you are gone and writes the number on the wall in pencil. Pip wants the number smaller every time. Pip says a trip only counts once you drive home. If you go down or the van is wrecked, you lose everything from that trip. You start again from your last save at the cabin. “So come home,” Pip says. “That is the whole trick.”",
    },
    "pip-t3": {
      title: "Every Wave Counted",
      text: "Pip has counted every wave since the first walkers came to the fence. Pip keeps the tally in pencil, one mark for each wave. A small wave comes out of the trees on two sides, Pip says. A big one comes out on all four. The warning says which sides, so you know where to stand. Sometimes the quiet ends with no wave at all. Pip still writes those down, with a smiley face.",
    },
    "pip-t4": {
      title: "The Lookout",
      text: "Pip watches the trees for you now, from the back fence, with the walkie-talkie clipped on. Before the quiet runs out, Pip calls out what is coming next and from which sides. That gives you time to get in place. June does not love Pip being the lookout. But Pip says somebody has to, and Pip has the sharpest eyes in the cabin. Pip also has the loudest voice.",
    },
    "pip-t5": {
      title: "Ruby's Red R",
      text: "Pip practiced painting Ruby's red R on a scrap board, with a number next to it. The number is how many walkers Ruby saw inside a building. Pip thinks it is the best idea anyone ever had. But Pip says there are more walkers by now. Each building gets one more walker every three days, up to a limit. So treat Ruby's number as the smallest it could be.",
    },
    "pip-t6": {
      title: "The List of Voices",
      text: "Pip keeps a list of every voice the crew hears, and the first name on it is June. Tomas is second, which he finds unfair. People say someone named Jo talks on the radio from a rooftop. Pip says a voice like that is exactly what the list is for. The Radio room, made of radio parts and wire, brings in voices like Jo's, Pip says. It also finds new places for the map.",
    },
    "pip-t7": {
      title: "A Radio That Reaches",
      text: "Pip finally has a radio that reaches town, and every new voice goes on the list. Pip has practically moved into the radio plot. It plays one broadcast each day you come home, full of news and tips. Pip moved the radio to the dining room. Tune in there for each day's news, and hear the old broadcasts again. Pip says some of them are worth hearing twice, because the best tips hide in plain words.",
    },
    "pip-t8": {
      title: "Take What You Need",
      text: "Pip got the town's own rule onto the door: take what you need, leave the rest. Pip calls it the best rule on the door, after June's first one. Pip says each stash key hides in another building, and a note there says where. So read every note to the end. Then think before you try a key. A wrong key can jam a stash lock or snap off in it.",
    },
    "pip-t9": {
      title: "Finn's Treehouse Plan",
      text: "Pip loves Finn Hollis's treehouse plan, with a rope ladder, a lookout, and a bucket on a pulley. Pip has studied it so often that the paper has gone soft. Pip wants to build it someday, once the fence is strong. Pip says the Walls room makes the fence stronger. It also gives you and the van more health. So in a way, building Walls is building the treehouse.",
    },
    "pip-t10": {
      title: "Pip's Shadow",
      text: "Already {dog} follows Pip around the yard like a sandy shadow. In a wave, it hides in the closet with the crew. If it barks in a wave, Pip says a walker is near the cabin, so go and check. Pip is teaching it to sit, like Biscuit in Lucy's drawing. So far it sits about half the time. Pip says that counts.",
    },
    "pip-m1": {
      title: "Tell It Slowly",
      text: "Pip looks up the moment you walk over, eyes wide and ready. Pip asks what the town looks like out there and listens to every word. Pip wants to know if the streets are empty and if any windows have lights. Pip likes the small details best, like the color of a door. “Tell it slowly,” Pip says. “I want to see it in my head.”",
    },
    "pip-m2": {
      title: "A Knot for Luck",
      text: "Pip practices knots on the fence rope: square knots, slip knots, and a few nameless ones. Then Pip ties one for you, for luck, and presses it into your hand. It is a little lumpy. Pip says lumpy knots hold the most luck, because the luck gets stuck in the bumps. Keep it in your pocket, Pip says, and bring it home again.",
    },
    "pip-m3": {
      title: "Where Everyone Went",
      text: "Pip asks where everyone in town went. Nobody has a full answer, so Pip has made up a few. Some people left, Pip thinks, and some are hiding. But Pip says some people must still be out there helping each other. Pip wants to meet them, every single one. Pip wants to hear their stories and learn how they kept going.",
    },
    "pip-m4": {
      title: "The Leaning Table",
      text: "Pip says the ping pong table leans to the left, and that is the only reason Tomas wins. Pip has tested it with a marble. The marble rolled, so the case is closed. Tomas says the table is perfectly level and Pip just needs practice. Pip demands a rematch every evening anyway. The real score is a secret Pip guards closely.",
    },
    "pip-m5": {
      title: "Read to the End",
      text: "Pip taps your backpack with the pencil from behind their ear. Pip says to read every note to the end, because some notes in town are old or wrong. A code can change. A room can get emptied. The real answer often hides in the last few lines. Pip reads every note twice, once fast and once slow. “Skimmers pay,” Pip says, sounding exactly like June.",
    },
  });

  /* ---------- Tips: one piece of live, useful information in every talk ---------- */
  T.crew.tips = Object.assign(T.crew.tips || {}, {
    june: Object.assign((T.crew.tips && T.crew.tips.june) || {}, {
      hungry: "June says the pantry is out of food, down to the last crumb. With no food, the van goes out weak. So bring some home on the next trip, June says, even a single can.",
      food: "June counts {food} food crates in the pantry and writes the number in her ledger. That is enough for {days} more trips. Food is never wasted, June says, so grab some whenever you see it.",
      ready: "June says you have everything you need to build the {room} room now. Use the office computer to build it, before something else needs those supplies. June is already planning where to stand and admire it.",
      build: "June says the next build is the {room} room. It still needs {needs}. June has put the list at the top of today's ledger page. Keep an eye out in town.",
      heal: "June sees you are hurt and pulls the tape and clean cloth from her cardigan pocket. She patches you up right where you stand, quick and careful. You get back {hp} health.",
    }),
    tomas: Object.assign((T.crew.tips && T.crew.tips.tomas) || {}, {
      van: "Tomas says the van has {hp} of {max} health. A full fix costs {cost} scrap, at the office computer or at the van. Tomas says a fixed van is a van that comes home.",
      vanFree: "Tomas says the van has {hp} of {max} health. With the Garage built, a fix costs nothing. So there is no excuse, Tomas says, for driving out with dents.",
      fence: "Tomas counts {holes} holes and {cracks} cracked boards in the fence. Holes never close on their own, and each fix you make costs 1 scrap. Tomas works on the fence when it is quiet, but he could use a hand.",
      cabin: "Tomas counts the cabin's broken doors and windows: {broken}. Each fix costs 2 scrap. Press E at the damage, or let the office computer do the fixing.",
      crowbar: "Tomas says you have no crowbar, and that makes him nervous. A crowbar pries open one jammed lock and is used up. Build one at the workbench, from the office computer, before your next trip.",
      fine: "Tomas says the van, the fence, and the cabin are all in good shape. Nothing needs fixing right now. Tomas looks almost disappointed and goes to polish a wrench that is already clean.",
    }),
    pip: Object.assign((T.crew.tips && T.crew.tips.pip) || {}, {
      wave: "Pip has been watching the trees from the lookout, walkie-talkie in hand. Pip calls what comes next: {size}, from {sides}. Get ready there before the quiet runs out.",
      keys: "Pip says you are holding {keys}. Each key's note says which stash it opens. Your notes are all in the backpack, so read them again before you try a lock.",
      walkers: "Pip keeps count with tally marks. In {days} days, the buildings in town get one more walker each, up to a limit. Pip says an early trip is a quieter trip.",
      radio: "Pip says a new broadcast waits at the radio in the dining room each day you come home. Pip never misses one. Tune in there, and you can hear the old ones again too, any time.",
      full: "Pip taps the last tally mark on the wall. Every building in town is as full of walkers as it will get, Pip says. From now on, a place is only as dangerous as it is today.",
    }),
  });

  /* ---------- Reports: what they did for you since you last talked ---------- */
  T.crew.reports = Object.assign(T.crew.reports || {}, {
    fence: "Tomas fixed {fixed} fence boards since you last talked. It took {scrap} scrap from the base. Tomas gives the fence a hard shake to show you how solid it is. Nothing wobbles.",
    fenceFree: "Tomas fixed {fixed} fence boards since you last talked. It cost no scrap at all, thanks to the steel brackets you brought home. Tomas says free fixes are the best kind.",
    cabin: "Tomas fixed broken doors and windows in the cabin: {fixed} in all. It took {scrap} scrap from the base. Tomas says every hinge is quiet again, and walkers will have to work harder now.",
    cabinFree: "Tomas fixed broken doors and windows in the cabin: {fixed} in all. It cost no scrap at all. Tomas whistles as he hangs up his hammer, pleased with the work.",
    hurt: "Walkers got into the closet in a wave, and {who} got hurt. Counting every wave since you last talked, it cost the base {cost}. Everyone is all right now, but the crew needs you inside faster.",
    late: "Time ran out on the errand: {item}. It is off the list now, and trust dropped a little. There will be other errands, so bring things home before the days run out.",
  });

  /* ---------- The dog: Pip's card asks for a name; then a line when you pet it ---------- */
  T.crew.dog = Object.assign(T.crew.dog || {}, {
    ask: "Pip asks you to give the dog a name. Pip has three ideas, written on the back of an old scrap of paper. But you found the dog, so you get to choose.",
    named: "Pip says {dog} is a good name, maybe the best one ever. Pip writes {dog} on the list of voices in big letters. A bark is a voice too, Pip explains.",
    pet: "{dog} leans against your legs, and its long tail thumps happily. Its floppy ear flops even more. Pip says {dog} likes you best, after Pip, which is a big honor.",
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
