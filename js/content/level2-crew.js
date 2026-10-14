/* Reading level 2: the crew at home base. Talk, tips, reports and the dog.
   The story quests and errands are in level2-quests.js.
   Facts: js/story-crew.js and js/story-quests.js. See docs/CREW.md and docs/TEXT_GUIDE.md.
   Level 2: sentences of 10 words or fewer, simple words, simple past is fine, whole sentences.
   Talk 30 to 62 words; tips, reports and the dog 14 to 30. Every talk text and tip names its speaker.
   June is "she", Tomas "he", Pip "they", the dog "it". */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[2] = root.ZSR.TEXT[2] || { level: 2 });
  T.crew = T.crew || {};

  /* ---------- Talk: one story topic or mood line in every bubble ---------- */
  T.crew.talk = Object.assign(T.crew.talk || {}, {
    /* June: dry, warm, in her sixties, a retired school gardener */
    "june-t1": {
      title: "June's Green Ledger",
      text: "June was a school gardener for years before the Fall. She taught kids how to grow things. Now she keeps the crew's days in a green ledger. There is one page for each day. The ledger sits on the radio shelf by the couch. You can read the old pages there. June says a ledger remembers what people forget.",
    },
    "june-t2": {
      title: "Hiding in the Closet",
      text: "June says the crew hides in the office closet. They go there when a wave comes. But walkers that get into the closet can hurt someone. That costs a medical kit from storage. If there is no kit, it costs 2 food. So clear the cabin fast, June says. She trusts you to be quick.",
    },
    "june-t3": {
      title: "Counting the Food",
      text: "June counts the food every night. She writes the number in her ledger. Every trip in the van eats 1 food crate. With no food left, the van goes out weak. So June says to bring food home whenever you can. She says one can of peaches is worth the stop.",
    },
    "june-t4": {
      title: "The Dinner Bell",
      text: "June tells you about the dinner bell. Dan Hollis hung it on the porch. He wanted his kids to hear it in the woods. Now walkers come to it too. Ring it, and a wave comes a few seconds later. It happens every time. So ring it only when you are ready to fight. June misses bells that only meant supper.",
    },
    "june-t5": {
      title: "Tape and a Clean Cloth",
      text: "June's cardigan pocket holds tape and a clean cloth. She says it is just in case. If you come to her hurt, she patches you up. She can do it once between waves. A medical kit still heals you all the way. Your backpack carries 3 of them. June says to fill it before every trip.",
    },
    "june-t6": {
      title: "Rosa's Greenhouses",
      text: "June's old friend Rosa ran the greenhouses at Greenhouse Row. They have been friends for a long time. If anyone still has seeds, June says, it is Rosa. Seed packets and a bag of soil start a Garden. A Garden grows food every day. June says that beats any can on a shelf.",
    },
    "june-t7": {
      title: "One Finger Deep",
      text: "June taught her school kids to plant a seed. Each seed went one finger deep. Then they had to wait. She says the town's shelves work the same way. Take something from a shelf or the floor. It is back 3 days later. What you take from a locked room never comes back. June says waiting is the hardest part.",
    },
    "june-t8": {
      title: "Rosa's Planting Chart",
      text: "You tell June about Rosa's planting chart. The last line is about June's beans. June smiles when she hears it. She says Rosa never forgets a friend. Notes you bring home stay in your backpack. So you can read them again any time. June asks you to read that one to her twice.",
    },
    "june-t9": {
      title: "Keeping the Garden Going",
      text: "June says Kate Hollis left a note on the fridge. The note was for whoever found the cabin. It asked them to keep the garden going. Now there is a garden again. Each new Garden level grows more food each day. June says a garden makes a cabin hard to leave. That is true even for the River Convoy.",
    },
    "june-t10": {
      title: "Pip's Problem",
      text: "June says {dog} is Pip's problem. Then she slips it the last of her beans. She writes its supper in the ledger, like everyone else's. June is glad of one thing. Walkers never hurt {dog}. So nobody has to guard it in a wave.",
    },
    "june-m1": {
      title: "Cold Morning Knees",
      text: "June rubs her knees and makes a face. Her knees ache on cold mornings. She says that is how she knows it is morning. June says she has no need for a clock. She has knees. Then she pulls her green cardigan tight.",
    },
    "june-m2": {
      title: "The Most Important Rule",
      text: "June says the most important rule is a simple one. Say where you are going before you go. Then someone knows where to look for you. June says the rule is not about being bossy. It is about everyone coming home. She says it to Tomas twice a day.",
    },
    "june-m3": {
      title: "Quiet Days",
      text: "June says quiet days are not wasted. They are how you get ready for loud ones. So fix the fence while it is quiet. Count the food while it is quiet, too. June says a calm is a gift. Just use it before the next wave comes.",
    },
    "june-m4": {
      title: "An Honest Ledger",
      text: "June holds up her green ledger. Some pages have smudges. Some have crossed-out words. She says a ledger only has to be honest. It does not have to be neat. She writes down the bad days too. She says the bad days teach the most. The good days just feel better.",
    },
    "june-m5": {
      title: "Her Old School Kids",
      text: "June goes quiet for a while. She wonders where her old school kids are now. They planted sunflowers by the school fence every spring. Some grew taller than the kids. June hopes they remember the sunflowers. She says a kid who grows flowers can grow anything.",
    },

    /* Tomas: seventeen, engines, stubborn, earnest */
    "tomas-t1": {
      title: "Old but Honest",
      text: "Tomas is seventeen, and he keeps the van alive. He says the van is old but honest. It is like a good mule. Van damage stays from one trip to the next. So Tomas says to fix it before you go. Fix it at the office computer. Or fix it at the van itself.",
    },
    "tomas-t2": {
      title: "Fixing the Fence",
      text: "When it is quiet, Tomas fixes fence holes and cracks. He tells you about it later. Each of his fixes costs the base 1 scrap. That is the same as yours. Holes never close on their own. To fix one yourself, press E at the gap. Tomas says one weak board can let a walker in.",
    },
    "tomas-t3": {
      title: "Walkers Listen",
      text: "Tomas says walkers listen like he listens to an engine. They hear every little sound. Every shot in the quiet brings the next wave sooner. A bow makes no sound. So walkers do not hear it. Tomas says the quiet is worth keeping. Keep it as long as you can.",
    },
    "tomas-t4": {
      title: "Every Hinge by Its Squeak",
      text: "Tomas knows every hinge in the cabin by its squeak. He says walkers smash windows and climb in. Nobody can climb out through a broken one. A broken door or window costs 2 scrap to fix. Press E at it to fix it. Or use the office computer. Tomas likes the cabin best when nothing squeaks.",
    },
    "tomas-t5": {
      title: "His Father's Teacher",
      text: "Tomas learned engines from his father. He handed his father wrenches under cars. His father learned from Mr. Ortiz at Ortiz Auto. Tomas hopes Mr. Ortiz is still out there somewhere. Then he gets back to work. He says most van upgrades stop at level 2. A Garage lets them go higher.",
    },
    "tomas-t6": {
      title: "A Garage at Last",
      text: "Tomas finally has a garage. It is like the one his father worked in. He walks around it twice, smiling. Now the van comes home fixed after every trip. The Garage does it for free. Each Garage level lets van upgrades go one level higher. Tomas says it smells right, like oil and old tires.",
    },
    "tomas-t7": {
      title: "Up the River Road",
      text: "Tomas thinks the van could handle the river road. But only if the River Convoy ever leaves. June is not sure she wants to go. And Tomas will not go without her. He says the van should be ready either way. Each Armor Plating upgrade gives the van 30 more health.",
    },
    "tomas-t8": {
      title: "Gus's Room",
      text: "Tomas sleeps in Gus's room. Tomas says the KEEP OUT sign means Pip now. Gus left a guitar with two broken strings. Tomas wants to fix it someday. Now Tomas also fixes the cabin's broken doors and windows. He does it himself, when it is quiet. Then he tells you about it.",
    },
    "tomas-t9": {
      title: "Mr. Ortiz Is Safe",
      text: "You tell Tomas about Dev's note. Mr. Ortiz is safe at the Water Tower with Theo. Tomas goes quiet for a long time. Then he grins. He says Mr. Ortiz would look for a Garage first. You build it from engine parts and a tool kit. Tomas wants it ready for that day.",
    },
    "tomas-t10": {
      title: "Traps Out First",
      text: "Tomas remembers one bad night. Walkers hit the fence from every side. Next time, he wants traps out first. Spike traps need the Walls at level 2. Blast traps need level 3. Make them at the workbench, from the office computer. Then set one in the yard with T or R.",
    },
    "tomas-m1": {
      title: "Talking to the Engine",
      text: "Tomas likes to whistle under the van. He talks to the engine like an old friend. He asks it how it slept. He tells it to be brave today. Tomas says engines work harder when someone believes in them. June says that is not how engines work. Tomas keeps talking anyway.",
    },
    "tomas-m2": {
      title: "Ticks, Knocks and Squeals",
      text: "Tomas says engines talk, if you listen. A tick means one thing. A knock means another. A squeal means stop right now. Tomas says you never drive on a squeal. If the van ever squeals, tell him right away. A fix at home beats a fix on the road.",
    },
    "tomas-m3": {
      title: "A Quiet Fix",
      text: "Tomas wipes his hands on his red rag. He keeps it in his back pocket. The rag is more grease than rag now. He says a good fix is a quiet one. It has no rattles and no squeaks. A fix you can hear is not done yet.",
    },
    "tomas-m4": {
      title: "Half His Bread",
      text: "At supper, Tomas slips Pip half his bread. He does it under the table. June pretends not to see. Tomas says he is not that hungry. That is not true, and everyone knows it. Pip always says thank you with a full mouth.",
    },
    "tomas-m5": {
      title: "Room in the Can",
      text: "Tomas says fuel needs room in the heat. So he fills a can to the line. He never fills it to the top. Fuel grows when it gets hot, he says. A full can could leak. Tomas likes rules that keep the cabin safe.",
    },
    "tomas-m6": {
      title: "Shut the Doors",
      text: "Tomas says walkers sometimes get into the cabin. When they do, shut the doors inside. A shut door slows them down. They can still force it open, though. But it gives you time to turn and aim. Tomas says every second counts in a wave.",
    },

    /* Pip: eleven, curious, asks big questions; "they" at every level */
    "pip-t1": {
      title: "The Dog We Do Not Have",
      text: "Pip is eleven and wants a dog more than anything. Pip added a row to the Hollis chore chart. It says Pip feeds the dog. The crew does not have a dog yet. The Hollis family left notes on the walls, Pip says. There are notes all over the cabin. Walk up close to read one.",
    },
    "pip-t2": {
      title: "Counting the Minutes",
      text: "Pip counts the minutes you are gone. Then Pip writes the number on the wall. Pip says a trip only counts once you drive home. If you go down, you lose everything from that trip. If the van is wrecked, you lose it all too. Then you start from your last save. So come home, Pip says.",
    },
    "pip-t3": {
      title: "Counting the Waves",
      text: "Pip has counted every wave since the first walkers came. They came to the fence at dusk. A small wave comes from the trees on two sides. A big wave comes on all four. The warning says which sides. Sometimes the quiet ends with no wave at all. Pip writes that down too.",
    },
    "pip-t4": {
      title: "Pip on Lookout",
      text: "Pip watches the trees for you now. Pip calls out what is coming before the quiet ends. Pip also calls out which sides it comes from. June does not love Pip being the lookout. But Pip says somebody has to do it. Pip has the sharpest eyes in the cabin.",
    },
    "pip-t5": {
      title: "Ruby's Red R",
      text: "Pip practiced painting Ruby's red R on a board. Pip put a number next to it. It is how many walkers Ruby saw inside a building. But Pip says there are more by now. Each building gets one more walker every three days. That goes on up to a limit.",
    },
    "pip-t6": {
      title: "The List of Voices",
      text: "Pip keeps a list of every voice the crew hears. The first name on it is June. Jo talks on the radio from a rooftop. Pip says the Radio room brings in voices like Jo's. It finds new places for the map, too. It is made from radio parts and wire.",
    },
    "pip-t7": {
      title: "A Radio That Reaches Town",
      text: "Pip finally has a radio that reaches town. Every new voice goes on Pip's list. The radio plays one broadcast each day you come home. You can hear every broadcast again. Just go to the radio shelf by the couch. Pip says radio voices know things nobody else knows.",
    },
    "pip-t8": {
      title: "Take What You Need",
      text: "Pip got the town's own rule onto the door. The rule says: take what you need, leave the rest. Pip says each stash key hides in another building. A note there says where it is. Pip wants you to be careful. A wrong key can jam a stash lock. It can snap off in the lock, too.",
    },
    "pip-t9": {
      title: "Finn's Treehouse Plan",
      text: "Pip loves Finn Hollis's treehouse plan. It has a rope ladder and a lookout. It even has a bucket on a pulley. Pip wants to build it someday. First, the fence has to be strong. Pip says the Walls room makes the fence stronger. It also gives you and the van more health.",
    },
    "pip-t10": {
      title: "Teaching the Dog to Sit",
      text: "Now {dog} follows Pip around the yard. In a wave, it hides with the crew. They all wait in the office closet. Pip says to listen for a bark in a wave. A bark means a walker is near the cabin. So go and check. Pip is teaching it to sit. Biscuit sits like that in Lucy's drawing.",
    },
    "pip-m1": {
      title: "What Town Looked Like",
      text: "Pip asks what the town looks like out there. Every street and every shop matters to Pip. So do the birds. Pip listens to every word and never gets bored. The best parts go in Pip's notebook. Someday Pip wants to see it all.",
    },
    "pip-m2": {
      title: "A Knot for Luck",
      text: "Pip practices knots on the fence rope. There is a square knot and a loop knot. Pip has a name for every one. Today Pip ties one for you, for luck. A good knot holds when everything else lets go. Keep it in your pocket.",
    },
    "pip-m3": {
      title: "Where Everyone Went",
      text: "Pip asks where everyone in town went. There were so many houses and so many people. Pip says some people must still be out there. They must be helping each other. Pip wants to meet them someday. Pip says the world is too big to be empty.",
    },
    "pip-m4": {
      title: "The Leaning Table",
      text: "Pip says the ping pong table leans to the left. That is the only reason Tomas wins. Pip says it every single time. Tomas just grins and serves again. Pip wants a rematch every night. Pip says a flat table would change everything.",
    },
    "pip-m5": {
      title: "Read to the End",
      text: "Pip says to read every note to the end. Some notes in town are old. Some notes are just wrong. The end of a note can change everything. Pip says a note is like a mystery story. The best part is often last.",
    },
  });

  /* ---------- Tips: one piece of live, useful news in every talk ---------- */
  T.crew.tips = Object.assign(T.crew.tips || {}, {
    june: Object.assign((T.crew.tips && T.crew.tips.june) || {}, {
      hungry: "June says the pantry is out of food. The van goes out weak with no food. So bring some home on the next trip.",
      food: "June counts {food} food crates in the pantry. That is enough for {days} more trips. She writes the number in her ledger.",
      ready: "June says the {room} room is ready to build. You have all you need for it. Build it at the office computer. June sounds pleased.",
      build: "June says the next build is the {room} room. It still needs {needs}. Keep an eye out on your next trip, June says.",
      heal: "June sees you are hurt and patches you up. You get back {hp} health. June tells you to sit still and stop squirming.",
    }),
    tomas: Object.assign((T.crew.tips && T.crew.tips.tomas) || {}, {
      van: "Tomas says the van has {hp} of {max} health. A full fix costs {cost} scrap. Do it at the office computer or at the van.",
      vanFree: "Tomas says the van has {hp} of {max} health. With the Garage built, a fix costs nothing. Tomas likes it that way.",
      fence: "Tomas checked the fence. He counts {holes} holes and {cracks} cracked boards. Holes never close on their own. Each fix you make costs 1 scrap.",
      cabin: "Tomas counts the cabin's broken doors and windows: {broken}. Each fix costs 2 scrap. Press E at one, or use the office computer.",
      crowbar: "Tomas says you have no crowbar. A crowbar pries open one jammed lock. Then it is used up. Build one at the workbench, from the office computer.",
      fine: "Tomas says the van is in good shape. So are the fence and the cabin. Nothing needs fixing right now. Tomas sounds almost sad about it.",
    }),
    pip: Object.assign((T.crew.tips && T.crew.tips.pip) || {}, {
      wave: "Pip has been watching the trees from the lookout. Pip calls what comes next: {size}, from {sides}.",
      keys: "Pip says you are holding {keys}. Each key's note says which stash it opens. Your notes are in the backpack, so read them again.",
      walkers: "Pip keeps count of the walkers in town. In {days} days, each building gets one more walker. That goes on up to a limit, Pip says.",
      radio: "Pip says the radio has news for you. A new broadcast plays each day you come home. Hear old ones at the radio shelf by the couch.",
      full: "Pip says the buildings in town are full of walkers. No building will get any more. Each place stays as dangerous as it is now.",
    }),
  });

  /* ---------- Reports: what a crew member did for you since you last talked ---------- */
  T.crew.reports = Object.assign(T.crew.reports || {}, {
    fence: "Tomas fixed {fixed} fence boards since you last talked. It took {scrap} scrap from the base. The fence is a little stronger now.",
    fenceFree: "Tomas fixed {fixed} fence boards since you last talked. It cost no scrap at all. Tomas is proud of that.",
    cabin: "Tomas fixed the cabin's broken doors and windows. He fixed {fixed} in all. It took {scrap} scrap from the base. He did it in the calm.",
    cabinFree: "Tomas fixed the cabin's broken doors and windows. He fixed {fixed} in all. It cost no scrap at all. He did it in the calm.",
    hurt: "Walkers got into the closet during a wave. {who} got hurt. It cost the base {cost}. Everyone is all right now. Clear the cabin faster next time.",
    late: "Time ran out on the errand: {item}. It is off the list now. Trust dropped a little. The backpack shows the days left on an errand.",
  });

  /* ---------- The dog: Pip's card asks for a name, then the dog's own bubble ---------- */
  T.crew.dog = Object.assign(T.crew.dog || {}, {
    ask: "Pip asks you to give the dog a name. Pip has three ideas. But you found the dog, so you choose.",
    named: "Pip says {dog} is a good name. Pip writes {dog} on the list of voices. A bark is a voice too, Pip says.",
    pet: "{dog} leans on your legs and thumps its long tail. Pip says {dog} likes you best, after Pip, of course.",
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
