/* Reading level 1: the crew at home base. Talk, tips, reports, story quests, errands, the dog.
   Facts: js/story-crew.js and js/story-quests.js. See docs/CREW.md and docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[1] = root.ZSR.TEXT[1] || { level: 1 });
  T.crew = T.crew || {};

  // Talk: one story topic or mood line per bubble, after the report and the tip. Each names its speaker.
  T.crew.talk = Object.assign(T.crew.talk || {}, {
    // June: topics
    "june-t1": {
      title: "The Green Ledger",
      text: "June says she was a school gardener for years. That was before the Fall. Now she keeps a green ledger for the crew. She writes one page for each day. It sits by the couch, on the radio shelf. You can read the old pages there.",
    },
    "june-t2": {
      title: "Where We Hide",
      text: "June says the crew hides in the office closet. They go there in a wave. But walkers can get in there. Then someone can get hurt. That costs a medical kit from storage. With no kit, it costs 2 food. So get walkers out of the cabin fast.",
    },
    "june-t3": {
      title: "Counting the Food",
      text: "June counts the food every night. She writes the number in her ledger. Every trip in the van eats 1 food crate. With no food left, the van goes out weak. So bring food home when you can, June says.",
    },
    "june-t4": {
      title: "The Dinner Bell",
      text: "June says Dan Hollis hung the dinner bell. It hangs on the porch. His kids could hear it in the woods. But walkers hear it too. Ring it, and a wave comes. It comes a few seconds later, every time. June misses bells that only meant supper.",
    },
    "june-t5": {
      title: "Tape and a Cloth",
      text: "June keeps tape in her sweater pocket. A clean cloth is there too, just in case. Now, when you are hurt, come to her. She patches you up once between waves. A medical kit still heals you all the way. Your backpack carries 3 of them.",
    },
    "june-t6": {
      title: "Rosa at Greenhouse Row",
      text: "June says her old friend Rosa ran the greenhouses. That was at Greenhouse Row. If anyone still has seeds, it is Rosa. To start a Garden, bring seed packets. Bring a bag of soil too. Then the Garden grows food every day.",
    },
    "june-t7": {
      title: "One Finger Deep",
      text: "June taught her school kids to plant a seed. Put it one finger deep, then wait. Town shelves work the same way, June says. Take something from a shelf or the floor. It is back 3 days later. But a locked room never fills up again.",
    },
    "june-t8": {
      title: "Rosa Never Forgets",
      text: "You tell June about Rosa's planting chart. June smiles at the last line. It is about her beans. June says Rosa never forgets a friend. The notes you bring home stay in your backpack. So you can read them again.",
    },
    "june-t9": {
      title: "A Garden Again",
      text: "June talks about Kate Hollis's note. It asks you to keep the garden going. Now the cabin has a Garden. Each new Garden level grows more food each day. June says the cabin is hard to leave now. She may not leave, even for the River Convoy.",
    },
    "june-t10": {
      title: "Pip's Problem",
      text: "June says {dog} is Pip's problem. Then she slips it the last of her beans. Its supper goes in the ledger with everyone's. June is glad of one thing. Walkers never hurt {dog}. So nobody has to guard it in a wave.",
    },
    // June: moods
    "june-m1": {
      title: "Cold Mornings",
      text: "June's knees ache on cold mornings. She gets up slowly and rubs them. June says her knees tell her it is morning. She says it with a wink.",
    },
    "june-m2": {
      title: "The Most Important Rule",
      text: "June says one rule matters most of all. Say where you are going before you go. Then the crew knows where to look for you.",
    },
    "june-m3": {
      title: "Quiet Days",
      text: "June says quiet days are not wasted. They get you ready for loud days. So fix the fence while it is quiet. Count the food, too.",
    },
    "june-m4": {
      title: "Honest, Not Neat",
      text: "June taps her green ledger. She says a ledger only has to be honest. It does not have to be neat. So she writes down the bad days too.",
    },
    "june-m5": {
      title: "The Sunflower Kids",
      text: "June looks out at the road. She wonders where her old school kids are now. She hopes they remember the sunflowers. They planted them by the school fence.",
    },

    // Tomas: topics
    "tomas-t1": {
      title: "Old but Honest",
      text: "Tomas is 17, and he keeps the van alive. He says the van is old but honest. It is like a good mule. Van damage stays from one trip to the next. Fix it at the office computer. Or fix it at the van before you go.",
    },
    "tomas-t2": {
      title: "Fixing the Fence",
      text: "Tomas fixes fence holes and cracks in the calm. He tells you about it later. Each fix he makes costs the base 1 scrap. Your own fixes cost the same. Holes never close on their own. To fix one yourself, press E at the gap.",
    },
    "tomas-t3": {
      title: "Walkers Listen",
      text: "Tomas listens close to an engine. He says walkers listen to you the same way. Every shot in a calm brings the wave sooner. A bow makes no sound. So walkers do not hear it.",
    },
    "tomas-t4": {
      title: "Every Squeak",
      text: "Tomas knows each cabin door by its squeak. He says walkers smash windows and climb in. But nobody can climb out a broken window. Fixing a door or window costs 2 scrap. Press E at it, or use the office computer.",
    },
    "tomas-t5": {
      title: "Wrenches Under Cars",
      text: "Tomas learned engines from his father. He handed his father wrenches under cars. His father learned from Mr. Ortiz at Ortiz Auto. Tomas hopes Mr. Ortiz is still out there. He says most van upgrades stop at level 2. A Garage lets them go higher.",
    },
    "tomas-t6": {
      title: "A Garage at Last",
      text: "Tomas has a garage at last. It is like the one his father worked in. Now the van gets fixed for free. It comes home fixed after every trip. Build the Garage up a level. Then van upgrades can go one level higher.",
    },
    "tomas-t7": {
      title: "Up the River Road",
      text: "Tomas thinks the van can take the river road. It could go if the River Convoy ever leaves. June is not sure she wants to go. Tomas will not go without her. Armor Plating makes the van tougher, he says. Each upgrade gives it 30 more health.",
    },
    "tomas-t8": {
      title: "Gus's Guitar",
      text: "Tomas sleeps in Gus's room. Tomas says the KEEP OUT sign now means Pip. Gus left a guitar with two broken strings. Tomas wants to fix it someday. Now Tomas fixes broken cabin doors and windows too. He does it when it is quiet.",
    },
    "tomas-t9": {
      title: "Good News from the Water Tower",
      text: "You tell Tomas about Dev's note. Mr. Ortiz is safe with Theo. They are at the Water Tower. Tomas goes quiet, and then he grins. A Garage comes first, he says. Mr. Ortiz would want to see one. A Garage takes engine parts and a tool kit.",
    },
    "tomas-t10": {
      title: "Traps Out First",
      text: "Tomas remembers the hardest night. Walkers hit the fence from every side. Next time, he wants traps out first. Spike traps need the Walls at level 2. Blast traps need level 3. Make them at the workbench, from the office computer. Then set them with T or R.",
    },
    // Tomas: moods
    "tomas-m1": {
      title: "An Old Friend",
      text: "Tomas whistles under the van. He talks to the engine like an old friend. He tells it to hold on one more trip. Tomas says it always listens.",
    },
    "tomas-m2": {
      title: "Tick, Knock, Squeal",
      text: "Tomas taps the van's engine. He says a tick means one thing. A knock means another thing. A squeal means stop right now.",
    },
    "tomas-m3": {
      title: "A Quiet Fix",
      text: "Tomas wipes his hands on the red rag. He keeps it in his back pocket. He says a good fix is a quiet one. It has no rattles and no squeaks.",
    },
    "tomas-m4": {
      title: "Half His Bread",
      text: "At supper, Tomas slips Pip half his bread. Pip eats it fast. June pretends not to see. Tomas says he was not hungry anyway.",
    },
    "tomas-m5": {
      title: "To the Line",
      text: "Tomas says fuel needs room when it gets hot. So he fills a fuel can to the line. He never fills it to the top.",
    },
    "tomas-m6": {
      title: "Shut the Doors",
      text: "Tomas says to shut the doors inside the cabin. Do it when walkers get in. A shut door slows them down. They can force it open, but it takes time.",
    },

    // Pip: topics
    "pip-t1": {
      title: "The Dog Row",
      text: "Pip is 11. Pip wants a dog more than anything. Pip added a row to the Hollis chore chart. It says Pip feeds the dog. But there is no dog yet. The Hollis family left notes on the cabin walls. Walk up close to read one.",
    },
    "pip-t2": {
      title: "Counting the Minutes",
      text: "Pip counts the minutes you are gone. Then Pip writes the number on the wall. A trip only counts once you drive home. If you go down, you lose what you found. You lose it if the van is wrecked, too. You start from your last save.",
    },
    "pip-t3": {
      title: "Every Wave Counted",
      text: "Pip has counted every wave since the first one. Waves come out of the trees. A small wave comes from two sides. A big wave comes from all four sides. The warning says which sides. Sometimes the calm ends with no wave at all.",
    },
    "pip-t4": {
      title: "The Lookout",
      text: "Pip watches the trees for you now. Pip calls out the next wave before it comes. Pip says what is coming and from which sides. June does not love Pip being the lookout. But Pip says somebody has to do it.",
    },
    "pip-t5": {
      title: "The Red R",
      text: "Pip practices Ruby's red R on a board. Pip puts a number next to it. The number tells how many walkers Ruby saw inside. Pip says there are more by now. Each building gets one more walker every three days. It stops at a limit.",
    },
    "pip-t6": {
      title: "The List of Voices",
      text: "Pip lists every voice the crew hears. June is the first name on the list. Jo talks on the radio from a rooftop. The Radio room brings in voices like Jo's. It finds new places for the map, Pip says. It is made from radio parts and wire.",
    },
    "pip-t7": {
      title: "A Radio That Reaches",
      text: "Pip has a radio that reaches town at last. Every new voice goes on Pip's list. A new show plays each day you come home. You can hear every show again. Go to the radio shelf by the couch.",
    },
    "pip-t8": {
      title: "Rule on the Door",
      text: "Pip put the town's rule on the door. Take what you need, and leave the rest. Pip says each stash key hides in another building. A note there says where. A wrong key can jam a stash lock. Or it can snap off in the lock.",
    },
    "pip-t9": {
      title: "Finn's Treehouse",
      text: "Pip loves Finn Hollis's treehouse plan. It has a rope ladder and a lookout. It has a bucket on a pulley, too. Pip wants it built when the fence is strong. The Walls room makes the fence stronger. It gives you and the van more health too.",
    },
    "pip-t10": {
      title: "Teaching It to Sit",
      text: "Pip walks the yard, and {dog} follows. In a wave, it hides with the crew. If it barks, a walker is near the cabin. Pip says to go and check. Pip is teaching it to sit. Biscuit sits like that in Lucy's drawing.",
    },
    // Pip: moods
    "pip-m1": {
      title: "What Town Looked Like",
      text: "Pip asks what the town looks like out there. Pip sits very still and listens to every word. Then Pip asks for more.",
    },
    "pip-m2": {
      title: "A Knot for Luck",
      text: "Pip practices knots on the fence rope. Pip ties a small one just for you. Pip says it is a knot for luck.",
    },
    "pip-m3": {
      title: "People Out There",
      text: "Pip asks where everyone in town went. Pip says some people must still be out there. They must be helping each other. Pip wants to meet them someday.",
    },
    "pip-m4": {
      title: "The Leaning Table",
      text: "Pip says the ping pong table leans left. That is the only reason Tomas wins. Pip wants a rematch after supper.",
    },
    "pip-m5": {
      title: "Read to the End",
      text: "Pip says to read every note to the end. Some notes in town are old or wrong. The end of a note can tell you so.",
    },
  });

  // Tips: live and useful, filled by the game. Each names its speaker.
  T.crew.tips = Object.assign(T.crew.tips || {}, {
    june: Object.assign((T.crew.tips && T.crew.tips.june) || {}, {
      hungry: "June says the pantry is out of food. With no food, the van goes out weak. Bring some home on the next trip.",
      food: "June counts {food} food crates in the pantry. That is enough for {days} more trips. She writes it in her ledger.",
      ready: "June says you can build the {room} room now. You have everything it needs. Use the office computer to build it.",
      build: "June says to build the {room} room next. It still needs {needs}. Find it all in town and bring it home.",
      heal: "June sees that you are hurt. She patches you up with her tape and cloth. You get back {hp} health.",
    }),
    tomas: Object.assign((T.crew.tips && T.crew.tips.tomas) || {}, {
      van: "Tomas says the van has {hp} of {max} health. A full fix costs {cost} scrap. Do it at the office computer or the van.",
      vanFree: "Tomas says the van has {hp} of {max} health. The Garage is built, so a fix is free. Fix it before you go.",
      fence: "Tomas checks the fence. He counts {holes} holes and {cracks} cracked boards. Holes never close on their own. Your fixes cost 1 scrap each.",
      cabin: "Tomas counts the cabin's broken doors and windows: {broken}. Each fix costs 2 scrap. Press E at one, or use the office computer.",
      crowbar: "Tomas says you have no crowbar. One crowbar opens one jammed lock, then breaks. Make one at the workbench, from the office computer.",
      fine: "Tomas checks the van, the fence, and the cabin. All three are in good shape, he says. Nothing needs fixing right now.",
    }),
    pip: Object.assign((T.crew.tips && T.crew.tips.pip) || {}, {
      wave: "Pip watches the trees from the lookout. Pip calls out what comes next: {size}, from {sides}.",
      keys: "Pip says you are holding {keys}. Each key's note says which stash it opens. Your notes are in the backpack. Read them again.",
      walkers: "Pip keeps count of the walkers in town. In {days} days, each building gets one more walker. It stops at a limit.",
      radio: "Pip says the radio plays a new show. One comes each day you come home. The radio shelf by the couch plays them again.",
      full: "Pip says the town's buildings are full of walkers. No building will get any more. Each place stays as dangerous as it is today.",
    }),
  });

  // Reports: what a crew member did since you last talked, told first in the bubble.
  T.crew.reports = Object.assign(T.crew.reports || {}, {
    fence: "Tomas fixed {fixed} fence boards since you last talked. It took {scrap} scrap from the base.",
    fenceFree: "Tomas fixed {fixed} fence boards since you last talked. It cost no scrap at all.",
    cabin: "Tomas fixed broken doors and windows in the cabin. He fixed {fixed} in all. It took {scrap} scrap from the base.",
    cabinFree: "Tomas fixed broken doors and windows in the cabin. He fixed {fixed} in all. It cost no scrap at all.",
    hurt: "Walkers got into the office closet in a wave. {who} got hurt. It cost the base {cost}. Everyone is all right now.",
    late: "Time ran out on the favor: {item}. It is off the list now. So you lost a little trust.",
  });

  // The dog: Pip's card asks for a name, then thanks you; a pat gets its own bubble.
  T.crew.dog = Object.assign(T.crew.dog || {}, {
    ask: "Pip asks you to give the dog a name. Pip has three ideas. But you found the dog, so you choose.",
    named: "Pip says {dog} is a good name. Pip writes {dog} on the list of voices. Pip says a bark is a voice too.",
    pet: "{dog} leans on your legs and thumps its tail. Pip says {dog} likes you best, after Pip.",
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
