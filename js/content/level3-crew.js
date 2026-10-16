/* Reading level 3: the crew at home base. Talk, tips, reports, story quests, errands, the dog.
   Facts: js/story-crew.js and js/story-quests.js. See docs/CREW.md and docs/TEXT_GUIDE.md.
   This file holds talk, tips, reports and the dog; the story quests and errands are in level3-quests.js.
   Level 3: sentences of 14 words or fewer, a few compound sentences, concrete words.
   Talk 40 to 82 words; tips, reports and the dog 18 to 36. Every text names its speaker. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[3] = root.ZSR.TEXT[3] || { level: 3 });
  T.crew = T.crew || {};

  /* ---------- Talk: one story topic or mood line in every bubble ---------- */
  T.crew.talk = Object.assign(T.crew.talk || {}, {
    /* June: dry, warm, in her sixties, a retired school gardener */
    "june-t1": {
      title: "June's Green Ledger",
      text: "June was a school gardener for years before the Fall. She taught kids to grow beans and to wait for them. Now she keeps the crew's days in a green ledger, one page a day. The ledger sits on the radio shelf in the dining room. You can read the old pages there whenever you like. June says a day is not over until it is written down.",
    },
    "june-t2": {
      title: "When a Wave Comes",
      text: "June says the crew hides in the office closet during a wave. They shut the door and keep very still. But walkers that get into the closet can hurt someone. That costs a medical kit from storage. If there is no kit, it costs 2 food instead. So clear the cabin fast, June says. “We will be in the closet,” she says. “You be quick.”",
    },
    "june-t3": {
      title: "Counting the Food",
      text: "June counts the food every night. Then she writes the number in her ledger, so nobody has to guess. Every trip in the van eats 1 food crate. With no food left, the van goes out weak. So June says to bring food home whenever you can. “A can of beans is never a wasted trip,” June says.",
    },
    "june-t4": {
      title: "The Dinner Bell",
      text: "June says Dan Hollis hung the dinner bell on the porch. He hung it there so his kids could hear it in the woods. Now walkers come to it too. Ring it, and a wave comes a few seconds later, every time. So ring it only when you are ready to fight. June misses bells that only meant supper. She touches the rope sometimes, but she never pulls it.",
    },
    "june-t5": {
      title: "Tape and a Clean Cloth",
      text: "June keeps tape and a clean cloth in her cardigan pocket, just in case. Now she trusts you enough to use them on you. If you come to June hurt, she patches you up once between waves. A medical kit still heals you all the way. The backpack carries 3 of them, so keep it full. June says her tape is good, but a kit is better.",
    },
    "june-t6": {
      title: "Rosa and the Seeds",
      text: "June's old friend Rosa ran the greenhouses at Greenhouse Row. June says Rosa could grow a tomato on a rock. So if anyone still has seeds, it is Rosa. Seed packets and a bag of soil start a Garden. A Garden grows food every day, and every crate counts. June already knows where the beans will go. She has known for weeks.",
    },
    "june-t7": {
      title: "One Finger Deep",
      text: "June taught her school kids to plant a seed one finger deep, then wait. June says the town's shelves work the same way. What you take from a shelf or the floor is back 3 days later. So a good store is worth a second trip. But what you take from a locked room never comes back. “Plant, wait, and pick again,” June says. “Just not from the locked rooms.”",
    },
    "june-t8": {
      title: "Rosa's Planting Chart",
      text: "You tell June about Rosa's planting chart at Greenhouse Row. June asks what the last line says. It is about her beans. June smiles a slow, wide smile, and her eyes get shiny. She says Rosa never forgets a friend. Then she taps your backpack. Notes you bring home stay in your backpack, so you can read them again. June wants to hear that one again tomorrow.",
    },
    "june-t9": {
      title: "Keeping the Garden Going",
      text: "June says Kate Hollis left a note on the fridge. It asked whoever found the cabin to keep the garden going. Now the yard has a Garden, and June tends it every morning. Each new level of the Garden grows more food each day. June says a cabin with a garden is hard to leave. She might stay, even if the River Convoy goes. She does not say more, but she looks at the beans.",
    },
    "june-t10": {
      title: "Pip's Problem",
      text: "June says {dog} is Pip's problem, not hers. Then she slips it the last of her beans when she thinks nobody sees. She writes its supper in the ledger, like everyone else's. June is glad of one thing. Walkers never hurt {dog}, so nobody has to guard it in a wave. “It eats better than Tomas does,” June says. “Do not tell him.”",
    },
    "june-m1": {
      title: "Cold Mornings",
      text: "June rubs her knees and makes a face. June's knees ache on cold mornings. She says that is how she knows it is morning. “Who needs a clock?” she says. “I have two of them, and they both creak.” Then she pulls her green cardigan tight and gets back to work.",
    },
    "june-m2": {
      title: "The First Rule",
      text: "June holds up one finger, like a teacher. June says the most important rule is a simple one. Say where you are going before you go. That way, the crew always knows where to look for you. “Even if it is only the porch,” June says. “Tell me, tell Tomas, or tell Pip. Just tell someone.”",
    },
    "june-m3": {
      title: "Quiet Days",
      text: "June tucks her green ledger under her arm. June says quiet days are not wasted. They are how you get ready for loud ones. So fix the fence while it is quiet, and count the food. Then sit down for a minute, she says. Resting is part of getting ready, too.",
    },
    "june-m4": {
      title: "Honest, Not Neat",
      text: "June shows you a ledger page with a big ink blot on it. June says a ledger only has to be honest, not neat. She writes down the bad days too, not just the good ones. “If I only wrote the good days, it would be a story,” she says. “A ledger tells the truth.”",
    },
    "june-m5": {
      title: "The School Sunflowers",
      text: "June looks past the fence for a long time. June wonders where her old school kids are now. One spring they planted sunflowers along the school fence. The flowers grew taller than everyone. She hopes the kids are safe, wherever they went. She hopes they remember the sunflowers. Then June smiles and says she remembers every one of their faces.",
    },

    /* Tomas: seventeen, engines, stubborn, earnest */
    "tomas-t1": {
      title: "The Old Mule",
      text: "Tomas is seventeen, and he keeps the van alive. He pats the hood like it is a horse. Tomas says the van is old but honest, like a good mule. But it does not heal on its own. Damage to the van stays from one trip to the next. Fix it at the office computer, or at the van before you go. “Treat it right,” Tomas says, “and it gets you home.”",
    },
    "tomas-t2": {
      title: "Holes in the Fence",
      text: "Tomas fixes fence holes and cracks himself when it is quiet. Then he tells you about it the next time you talk. Each of his fixes costs the base 1 scrap, the same as yours. Holes never close on their own. To fix one yourself, walk to the gap and press E. Tomas says two people fixing a fence beats one.",
    },
    "tomas-t3": {
      title: "Walkers Listen",
      text: "Tomas says walkers listen the way he listens to an engine. They hear every little sound, and they follow it. Every shot you fire in the quiet brings the next wave sooner. So wait for the wave before you shoot. A bow makes no sound, so walkers do not hear it. Tomas says a quiet yard is a safe yard.",
    },
    "tomas-t4": {
      title: "Every Hinge by Its Squeak",
      text: "Tomas knows every hinge in the cabin by its squeak. He can tell the front door from the back door with his eyes shut. Tomas says walkers smash windows and climb in. Nobody can climb out through a broken one, not even you. A broken door or window costs 2 scrap to fix. Press E at it, or use the office computer.",
    },
    "tomas-t5": {
      title: "Under the Cars",
      text: "Tomas learned engines from his father, handing him wrenches under cars. His father learned the trade from Mr. Ortiz at Ortiz Auto. Tomas hopes Mr. Ortiz is still out there somewhere. He is quiet for a moment. Then he clears his throat and talks about the van. Without a Garage, most van upgrades stop at level 2, Tomas says.",
    },
    "tomas-t6": {
      title: "A Real Garage",
      text: "Tomas finally has a garage, like the one his father worked in. He hung his tools on the wall in a neat row. With the Garage built, the van comes home fixed after every trip, for free. Each Garage level lets the van's upgrades go one level higher. Tomas says it smells like oil and home.",
    },
    "tomas-t7": {
      title: "Up the River Road",
      text: "Tomas thinks the van could make it up the river road. It would follow the River Convoy, if the convoy ever leaves. He already has a list of parts for the trip. But June is not sure she wants to go. Tomas will not go without her, and that is that. For now, he works on the van. Each Armor Plating upgrade gives the van 30 more health, Tomas says.",
    },
    "tomas-t8": {
      title: "Gus's Room",
      text: "Tomas sleeps in Gus's room. Tomas says the KEEP OUT sign on the door now means Pip. Gus left a guitar with two broken strings. Tomas wants to fix it someday, once he finds new strings. Tomas trusts you more now, too. He also fixes the cabin's broken doors and windows himself when it is quiet. He tells you about it later.",
    },
    "tomas-t9": {
      title: "Mr. Ortiz Is Safe",
      text: "You tell Tomas what Dev's note says. Mr. Ortiz is safe at the Water Tower with Theo. Tomas goes quiet for a long time, and then he grins. He grins so wide that his ears move. Tomas says a Garage is the first thing Mr. Ortiz would want to see. You build a Garage from engine parts and a tool kit.",
    },
    "tomas-t10": {
      title: "Traps Out First",
      text: "Tomas remembers the night when walkers hit the fence from every side. Next time, he wants traps out first. Spike traps need the Walls at level 2. Blast traps need the Walls at level 3. Make them at the workbench, from the office computer. Then press T or R in the yard to set one down. Tomas says a trap never gets tired.",
    },
    "tomas-m1": {
      title: "Talking to the Engine",
      text: "Tomas whistles under the van, and only his boots stick out. He talks to the engine like an old friend. “Come on,” he says. “One more trip, and I will find you a new belt.” Tomas says the engine runs better when he is nice to it. Pip says that is not how engines work.",
    },
    "tomas-m2": {
      title: "Tick, Knock, Squeal",
      text: "Tomas holds up three greasy fingers. Tomas says a tick means one thing. A knock means another. And a squeal means stop right now, no matter where you are. He makes each sound for you, one after the other. The squeal is very loud. June calls from the porch to ask if the van is all right.",
    },
    "tomas-m3": {
      title: "A Quiet Fix",
      text: "Tomas wipes his hands on the red rag in his back pocket. The rag is more black than red by now. He says a good fix is a quiet one. No rattles, no squeaks, no surprises. If a fix makes noise, it is not done yet. Tomas says that goes for doors, vans, and fences.",
    },
    "tomas-m4": {
      title: "Half His Bread",
      text: "At supper, Tomas slips Pip half his bread under the table. June pretends not to see. Tomas says he is not hungry, but his stomach growls. Pip says thank you with a big smile. Tomas says growing kids need bread more than he does. He is seventeen, so he is still growing too.",
    },
    "tomas-m5": {
      title: "To the Line",
      text: "Tomas taps the side of a red fuel can. Tomas says fuel needs room in the heat. It swells when it gets warm. So he fills a can to the line, never to the top. A full can in the sun can leak. Tomas says it is a small rule that keeps the whole yard safe.",
    },
    "tomas-m6": {
      title: "Shut the Doors",
      text: "Tomas knocks on a door inside the cabin. Tomas says to shut the doors inside the cabin when walkers get in. A shut door slows them down. They can still force it open, but it takes them time. That time is yours to use. Tomas says even a thin door is better than no door.",
    },

    /* Pip: eleven, curious, asks big questions; "they" at every level */
    "pip-t1": {
      title: "The Dog We Do Not Have",
      text: "Pip is eleven and wants a dog more than anything. Pip added a row to the Hollis chore chart. It says: Pip feeds the dog we do not have yet. Pip says the Hollis family left notes on walls all over the cabin. Walk up close to one to read it. Pip has read every one of them twice.",
    },
    "pip-t2": {
      title: "Counting the Minutes",
      text: "Pip counts the minutes you are gone. Then Pip writes the number on the wall in pencil. Pip says a trip only counts once you drive home. Go down, or wreck the van, and you lose everything from that trip. You start again from your last save. So Pip wants you to come home, every single time.",
    },
    "pip-t3": {
      title: "Counting the Waves",
      text: "Pip has counted every wave since the first walkers came to the fence. Pip keeps the count on the back of a cereal box. A small wave comes out of the trees on two sides. A big one comes on all four. The warning says which sides. Sometimes the quiet ends with no wave at all. Pip counts those, too.",
    },
    "pip-t4": {
      title: "The Lookout",
      text: "Pip watches the trees for you now, from the back fence. Before the quiet runs out, Pip calls what comes next and from which sides. June does not love Pip being the lookout. But Pip says somebody has to do it. Pip also says the smallest one in the crew has the sharpest eyes.",
    },
    "pip-t5": {
      title: "Ruby's Red R",
      text: "Pip practiced painting Ruby's red R on a board, with a number beside it. The number is how many walkers Ruby saw inside a building. But Pip says there are more by now. Each building gets one more walker every three days, up to a limit. So Pip says to plan for more than the number.",
    },
    "pip-t6": {
      title: "The List of Voices",
      text: "Pip keeps a list of every voice the crew hears. The first name on it is June, in big letters. Jo talks on the radio from a rooftop. Pip says the Radio room brings in voices like Jo's. It finds new places for the map, too. The Radio room is made from radio parts and wire.",
    },
    "pip-t7": {
      title: "A Radio That Reaches Town",
      text: "Pip finally has a radio that reaches town. Every new voice goes on the list, spelled the best Pip can. The radio plays one broadcast each day you come home. Pip moved the radio to the dining room. Tune in there for each day's news, and hear old broadcasts again. Pip says nobody should miss a voice, not even a crackly one.",
    },
    "pip-t8": {
      title: "Take What You Need",
      text: "Pip got the town's own rule onto the door. Take what you need, leave the rest. Pip wrote it in big, loopy letters. Pip says each stash key hides in another building. A note there says where it is. So be careful with keys, Pip says. A wrong key can jam a stash lock or snap off in it.",
    },
    "pip-t9": {
      title: "Finn's Treehouse Plan",
      text: "Pip loves Finn Hollis's treehouse plan. It has a rope ladder, a lookout, and a bucket on a pulley. Pip wants to build it someday, once the fence is strong. That is where the Walls room comes in, Pip says. The Walls room makes the fence stronger. It also gives you and the van more health.",
    },
    "pip-t10": {
      title: "A Bark Means Look",
      text: "Now {dog} follows Pip around the yard. In a wave, it hides in the closet with the crew. If it barks in a wave, Pip says a walker is near the cabin. So go and check. Pip is teaching it to sit, like Biscuit in Lucy's drawing. So far, it mostly sits on Pip.",
    },
    "pip-m1": {
      title: "Tell Pip Everything",
      text: "Pip takes the pencil from behind one ear. Pip asks what the town looks like out there. Pip wants to hear about the streets, the stores, and the signs. Pip listens to every word and writes some of them down. Pip says one day they will see the town too. For now, your words will do.",
    },
    "pip-m2": {
      title: "A Knot for Luck",
      text: "Pip practices knots on the fence rope, tongue sticking out. There is a square knot, a slip knot, and one with no name. Pip ties one for you, for luck. It goes on your backpack strap. Pip says it is a lucky knot. Nobody can untie it, not even Pip.",
    },
    "pip-m3": {
      title: "Where Everyone Went",
      text: "Pip asks where everyone in town went. It is a big question, and nobody has the whole answer. Pip says some people must still be out there, helping each other. Pip is sure of it. Pip wants to meet them someday and shake their hands. Pip already has a list of things to ask them.",
    },
    "pip-m4": {
      title: "The Leaning Table",
      text: "Pip says the ping pong table leans to the left. That is the only reason Tomas wins. Pip has checked it with a marble, twice. Tomas says the table is fine, and Pip just needs practice. Pip says practice is for people with fair tables. Then Pip asks Tomas for a rematch anyway.",
    },
    "pip-m5": {
      title: "Read to the End",
      text: "Pip says to read every note to the end. Some notes in town are old, and some are just wrong. The last line can change everything. Pip learned that from June's ledger. The best part is often at the bottom. So read slowly, Pip says, and read it all.",
    },
  });

  /* ---------- Tips: one piece of live, useful news in every bubble ---------- */
  T.crew.tips = Object.assign(T.crew.tips || {}, {
    june: Object.assign((T.crew.tips && T.crew.tips.june) || {}, {
      hungry: "June says the pantry is out of food. She does not like that one bit. The van goes out weak with no food. Bring some home on the next trip.",
      food: "June counts {food} food crates in the pantry. That is enough for {days} more trips. June says to bring more home whenever you see some.",
      ready: "June says you have everything you need to build the {room} now. Go to the office computer and build it. June is already smiling about it.",
      build: "June says the next build is the {room}. It still needs {needs}. June wrote it at the top of her list, so keep an eye out.",
      heal: "June sees you are hurt and sits you down. She patches you up with her tape and a clean cloth. You get back {hp} health.",
    }),
    tomas: Object.assign((T.crew.tips && T.crew.tips.tomas) || {}, {
      van: "Tomas says the van has {hp} of {max} health. A full fix costs {cost} scrap. Fix it at the office computer, or at the van before you go.",
      vanFree: "Tomas says the van has {hp} of {max} health. With the Garage built, a fix costs nothing. Tomas grins and says free is his favorite price.",
      fence: "Tomas counts {holes} holes and {cracks} cracked boards in the fence. Holes never close on their own. Each fix you make costs 1 scrap.",
      cabin: "Tomas counts the cabin's broken doors and windows: {broken}. Each fix costs 2 scrap. Press E at each one, or use the office computer.",
      crowbar: "Tomas says you have no crowbar. A crowbar pries open one jammed lock, and then it is used up. Build one at the workbench, from the office computer.",
      fine: "Tomas says the van, the fence and the cabin are all in good shape. Nothing needs fixing right now. Tomas looks a little sad about that.",
    }),
    pip: Object.assign((T.crew.tips && T.crew.tips.pip) || {}, {
      wave: "Pip has been watching the trees from the lookout all through the quiet. Here is Pip's call for what comes next: {size}, from {sides}.",
      keys: "Pip says you are holding {keys}. Each key's note says which stash it opens. Your notes are in the backpack, so read them again.",
      walkers: "Pip keeps count on the wall. In {days} days, each building in town gets one more walker. That keeps happening, up to a limit. Pip says the sooner you go, the fewer walkers you meet.",
      radio: "Pip says a new broadcast waits each day you come home. It waits at the radio in the dining room. Tune in there, and hear the old ones again too.",
      full: "Pip says every building in town is as full of walkers as it gets. From now on, a place is only as dangerous as it is today.",
    }),
  });

  /* ---------- Reports: what they did for you since you last talked ---------- */
  T.crew.reports = Object.assign(T.crew.reports || {}, {
    fence: "Tomas fixed {fixed} fence boards since you last talked. It took {scrap} scrap from the base. Tomas says every board he fixed is solid.",
    fenceFree: "Tomas fixed {fixed} fence boards since you last talked. It cost no scrap at all. Tomas says free fixes are the best kind.",
    cabin: "Tomas fixed broken doors and windows in the cabin: {fixed} in all. It took {scrap} scrap from the base. Tomas says walkers will have to work harder to get in now.",
    cabinFree: "Tomas fixed broken doors and windows in the cabin: {fixed} in all. It cost no scrap at all. Tomas whistles while he puts his tools away.",
    hurt: "Walkers got into the closet during a wave, and {who} got hurt. It cost the base {cost}. Everyone is all right now. Next time, clear the cabin fast.",
    late: "Time ran out on the errand: {item}. It is off the list now, and trust dropped a little. There will be other errands.",
  });

  /* ---------- The dog: Pip's card asks for a name; then a line when you pet it ---------- */
  T.crew.dog = Object.assign(T.crew.dog || {}, {
    ask: "Pip asks you to give the dog a name. Pip has three ideas, written on a scrap of paper. But you found the dog, so you get to choose.",
    named: "Pip says {dog} is a good name, maybe the best one ever. Pip writes {dog} on the list of voices. A bark is a voice too, Pip says.",
    pet: "{dog} leans on your legs and thumps its tail on the ground. Pip says {dog} likes you best, after Pip, of course.",
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
