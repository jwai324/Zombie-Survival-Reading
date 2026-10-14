/* Reading level 5: the crew at home base. Talk, tips, reports, story quests, errands, the dog.
   Facts: js/story-crew.js and js/story-quests.js. See docs/CREW.md and docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[5] = root.ZSR.TEXT[5] || { level: 5 });
  T.crew = T.crew || {};

  /* ---------- Talk: every topic and mood (CREW_TALK) ---------- */
  T.crew.talk = Object.assign(T.crew.talk || {}, {
    // June: dry, warm, in her sixties, a retired school gardener
    "june-t1": {
      title: "The Green Ledger",
      text: "June pats the green ledger under her arm like an old friend. “Before the Fall, I was a school gardener for years,” she says. “Seeds, kids and muddy boots. I miss all three.” Now June keeps the crew's days in this ledger, one page for each day, so nothing important slips away. When she is not carrying it, she says, the ledger sits on the radio shelf by the couch. You can read the old pages there whenever you like. “Memory is a leaky bucket,” June says. “Paper holds water better.”",
    },
    "june-t2": {
      title: "When a Wave Comes",
      text: "June lowers her voice, the way she once did for fire drills at her school. When a wave comes, she says, the crew hides in the office closet and shuts the door. It is small and dark, but it is theirs. Still, walkers can break into the cabin, and walkers that get into the closet can hurt someone. June says that costs a medical kit from storage, or 2 food if there is no kit. So when walkers slip inside, clear the cabin fast. “A quick broom,” June says, “saves a long mop.”",
    },
    "june-t3": {
      title: "Counting the Food",
      text: "June licks the tip of her pencil and taps a column of numbers. “Every night I count the food and write the number in this ledger,” she says. “Numbers do not lie, even when I wish they would.” Every trip in the van eats 1 food crate, because nobody drives well on an empty stomach. With no food left, June says, the van goes out weak, and a weak van is easier to wreck. It is a circle that can spin the wrong way fast. “So bring food home whenever you can,” June says.",
    },
    "june-t4": {
      title: "The Dinner Bell",
      text: "June says Dan Hollis hung the dinner bell on the porch so his kids could hear it from deep in the woods. One ring, and three hungry Hollis kids came running home for supper. “Walkers come to it too,” June says. “Ring that bell, and a wave comes a few seconds later, every time.” It works like a dinner call for the wrong guests, so leave that bell alone unless you are truly ready to fight. June sighs and looks toward the porch. She misses the bells that only meant supper.",
    },
    "june-t5": {
      title: "Tape and a Clean Cloth",
      text: "June pats the pocket of her green cardigan. Inside are a roll of tape and a clean cloth, folded small, just in case. “Years of kids and garden tools teach you to carry both,” she says. Now that she trusts you, June makes an offer. If you come to her hurt, she will patch you up once between waves. “I am a gardener, not a doctor,” she warns. A medical kit still heals you all the way, and the backpack carries 3 of them. “Pack the kits,” June says. “My tape is a backup, not a plan.”",
    },
    "june-t6": {
      title: "Rosa's Greenhouses",
      text: "June smiles whenever she talks about her old friend Rosa. Rosa ran the greenhouses at Greenhouse Row, and June swears she could coax tomatoes out of a teacup. “If anyone in this town still has seeds, it is Rosa,” June says. “She saves seeds the way squirrels save acorns, and she shares them, too.” Then June gets practical. Seed packets and a bag of soil start a Garden in the yard. A Garden grows food every day, so the pantry gets a little help even when the road is stingy. “Find seeds,” June says, “and I will do the rest.”",
    },
    "june-t7": {
      title: "One Finger Deep",
      text: "June holds up one finger, still dusty from the dirt. “I taught my school kids to plant a seed one finger deep, then wait,” she says. “Waiting was the hard part. Nobody believes the roots are busy.” June says the town's shelves work the same way. Whatever you take from a shelf or the floor is back 3 days later, as if the town quietly replants itself. A locked room is different. What you take from a locked room never comes back, so take only what you need there. “Some gardens,” June says, “you only harvest once.”",
    },
    "june-t8": {
      title: "A Line About Beans",
      text: "You tell June about Rosa's planting chart at Greenhouse Row. June listens with her hands folded, the way she listens to rain on the roof. When you reach the last line, the one about her beans, she smiles, then laughs out loud and wipes her glasses. “Rosa never forgets a friend,” June says. “Or a bean.” Then she taps your backpack. Notes you bring home stay in there, she reminds you, so you can read them again whenever you like. “Keep that one,” June says. “Some notes are worth a second look.”",
    },
    "june-t9": {
      title: "A Garden Worth Staying For",
      text: "June brushes soil off her gloves and looks proud. She says Kate Hollis's note on the fridge asked whoever found the cabin to keep the garden going. “Well, Kate, now there is one,” June says, to nobody in particular. Each new level of the Garden grows more food each day. Every bed you add is a supper you never have to drive for. Then June goes quiet, the way she does when a thought is heavy. “A cabin with a garden is hard to leave,” she says, “even for the River Convoy.”",
    },
    "june-t10": {
      title: "Not My Dog",
      text: "June crosses her arms and frowns at {dog}. “That dog is Pip's problem, not mine,” June says firmly. Then, when she thinks nobody is looking, June slips it the last of her beans. You saw it. Now she writes its supper in the ledger, right beside everyone else's, in the same neat hand. June admits she is glad of one thing. Walkers never hurt the dog, so nobody has to guard it in a wave. “It can hide in the closet with us,” June says. “I only ask that it snore more quietly than Tomas.”",
    },
    "june-m1": {
      title: "Cold Morning Knees",
      text: "June rubs her knees and winces, then laughs at herself. Her knees ache on cold mornings, and they creak like old porch steps. “Some people own an alarm clock,” June says. “I own knees. That is how I know it is morning.” She says the cold sneaks into her joints like a cat into a warm bed, and it stays until lunch. Then she shoos you along with a wave of her ledger. “Go on,” June says. “My knees and I have work to do. We just do it slowly.”",
    },
    "june-m2": {
      title: "Rule Number One",
      text: "June holds up one finger, the way she used to quiet a noisy class. “Of all my rules, this one matters most,” she says. “Say where you are going before you go.” It sounds small, June admits, but small rules hold big things together, like one good nail in a gate. If someone knows where you went, someone knows where to look for you. June says she would rather nag than worry. “So tell me where you are headed,” she says, “and then come back the same way.”",
    },
    "june-m3": {
      title: "Quiet Days Count",
      text: "June stretches her back and enjoys the quiet for a moment. “People think quiet days are wasted days,” she says. “They are wrong. Quiet days are how you get ready for loud ones.” She ticks the chores off on her fingers. Fix the fence and count the food while it is quiet, June says. Nobody counts beans well with walkers at the gate. She calls the calm a loan, not a gift. “Spend it on the fence,” June says. “The loud days always come back to collect.”",
    },
    "june-m4": {
      title: "Honest, Not Neat",
      text: "June flips open the green ledger and shows you a page full of crossed-out words and a thumbprint of garden dirt. “Do not judge,” she says. “A ledger only has to be honest, not neat.” June writes down the bad days too, not only the good ones. A ledger with only good days would be a storybook, she says. A storybook cannot teach you a thing about the fence. “The bad pages are the ones I read twice,” June says. “That is where the lessons hide, like worms under a rock.”",
    },
    "june-m5": {
      title: "The Sunflower Kids",
      text: "June goes quiet, turning her pencil over and over in her gloved fingers. She is wondering about her old school kids again, the ones who planted sunflowers along the playground fence. Some of them would be grown by now, taller than those sunflowers ever got. June wonders where they are now, and whether they are safe. “I hope they remember the sunflowers,” she says softly. “How they waited, and watered, and the flowers came anyway.” Then she clears her throat and straightens her glasses. “Enough of that,” June says. “Back to work.”",
    },

    // Tomas: seventeen, engines, stubborn, earnest
    "tomas-t1": {
      title: "Old but Honest",
      text: "Tomas wipes a wrench on his red rag and grins. He is seventeen, and keeping the van alive is his job, or maybe his hobby. “The van is old but honest, like a good mule,” Tomas says. “It is slow and stubborn, but it never lies about what is wrong.” Then his grin fades. Damage to the van stays from one trip to the next, so every dent you bring home rides out with you again. Fix it at the office computer, Tomas says, or at the van before you go. “Treat it right, and it brings you home.”",
    },
    "tomas-t2": {
      title: "Holes in the Fence",
      text: "Tomas taps his wrench against his palm while he talks. When it is quiet, he says, he fixes fence holes and cracks himself, then tells you about it later. “I am not a magician, though,” Tomas says. “Each of my fixes costs the base 1 scrap, the same as yours.” Holes never close on their own, no matter how long you glare at them. If you spot a gap and he is busy, fix it yourself: walk up and press E at the gap. “A hole is an open invitation,” Tomas says, “and walkers never skip a party.”",
    },
    "tomas-t3": {
      title: "Walkers Listen",
      text: "Tomas cups a hand behind his ear. “Walkers listen the way I listen to an engine,” he says. “Every little sound tells them something.” He says every shot you fire in the quiet brings the next wave sooner. It is like ringing a doorbell, then acting surprised when someone answers. Noise is a map, and walkers follow it straight to the fence. A bow is different, Tomas says. A bow makes no sound, so walkers do not hear it at all. “If you find a bow, use it in the calm,” he says. “Save the loud stuff for later.”",
    },
    "tomas-t4": {
      title: "Every Hinge by Its Squeak",
      text: "Tomas knows every hinge in the cabin by its squeak, the way some people know birds by their songs. The pantry door whines, and the front door groans like an old man getting out of a chair. Then he gets serious. Walkers smash windows and climb in, Tomas says, and nobody can climb out through a broken one. A broken window is a door that only swings one way, the wrong way. A broken door or window costs 2 scrap to fix. Press E at it, or use the office computer. “Cheap,” Tomas says, “compared to a walker in the kitchen.”",
    },
    "tomas-t5": {
      title: "Wrenches Under Cars",
      text: "Tomas turns a wrench over in his hands, slowly. He learned engines from his father, lying on a cold floor and handing him wrenches under cars. His father learned the trade from Mr. Ortiz at Ortiz Auto, so in a way, Tomas learned from both of them. “Mr. Ortiz yelled at bolts like they owed him money,” Tomas says, smiling. He hopes Mr. Ortiz is still out there somewhere. Then he shakes it off and talks shop. Most van upgrades stop at level 2 until you build a Garage. “A van needs a home,” Tomas says, “same as us.”",
    },
    "tomas-t6": {
      title: "A Garage at Last",
      text: "Tomas cannot stop grinning. He finally has a garage, like the one his father worked in. He talks about it like a kid on his birthday. “It even smells right,” he says. “Oil and dust and old rags.” Then comes the good news. With the Garage built, the van comes home fixed after every trip, for free, so no more scrap goes to dents. Each Garage level also lets the van's upgrades go one level higher. “Build it up,” Tomas says, “and I will make that engine sing.”",
    },
    "tomas-t7": {
      title: "Up the River Road",
      text: "Tomas traces a line in the air with one greasy finger, as if he could see the way north. He thinks the van could make it up the river road if the River Convoy ever leaves. His eyes shine when he says it, like headlights on a dark road. Then his face changes. June is not sure she wants to go, and Tomas will not go without her. “So we wait, and we get ready,” he says. Each Armor Plating upgrade gives the van 30 more health. “If we ever go,” Tomas says, “we go in something close to a tank.”",
    },
    "tomas-t8": {
      title: "Keep Out Means Pip",
      text: "Tomas sleeps in Gus's room, under the sign that says KEEP OUT. “Gus wrote that for his little brother,” Tomas says. “Now it means Pip.” Gus also left a guitar with two broken strings, and Tomas wants to fix it someday. He cannot even play a note. “I just hate seeing anything broken,” Tomas admits. That is good news for the cabin. Now Tomas also fixes the cabin's broken doors and windows himself when it is quiet. He will tell you about it the next time you talk.",
    },
    "tomas-t9": {
      title: "Good News About Mr. Ortiz",
      text: "You tell Tomas what Dev's note says: Mr. Ortiz is safe at the Water Tower with Theo. For a long moment, Tomas goes quiet, holding his wrench like he forgot it was there. Then he grins, a big, crooked grin that takes over his whole face. “That stubborn old grump,” he says. “Of course he made it.” Tomas says a Garage, built from engine parts and a tool kit, is the first thing Mr. Ortiz would want to see. “If he ever visits,” Tomas says, “I want a real shop to show him.”",
    },
    "tomas-t10": {
      title: "Traps Out First",
      text: "Tomas still remembers the night walkers hit the fence from every side at once. He rubs the back of his neck when he talks about it. “Next time, the traps go out first,” he says. “Before the wave, not during.” Spike traps need the Walls at level 2, and blast traps need level 3. Make them at the workbench, from the office computer. Then, in the yard, press T to set a spike trap or R to set a blast trap. “A trap is a fence that fights back,” Tomas says, “and it never gets tired.”",
    },
    "tomas-m1": {
      title: "Talking to the Engine",
      text: "Tomas whistles an old tune, the one his father used to hum in the shop. When he works under the van, he talks to the engine like an old friend. “Come on, old girl, you know you want to start,” he tells it. It sounds silly, until you notice that the van usually listens. Tomas swears engines can tell when you are kind to them. “Machines are like people,” he says. “Yell at them, and they sulk. Be patient, and they show you what is wrong.” Then Tomas goes back to whistling.",
    },
    "tomas-m2": {
      title: "Tick, Knock, Squeal",
      text: "Tomas holds up three greasy fingers, one at a time. “An engine talks in three words,” he says. A tick means one thing, usually something small, like a loose bolt clearing its throat. A knock means another, and that one makes Tomas frown. A squeal means stop right now, no arguments, no matter how far from home you are. “Learn those three, and the van will never surprise you,” Tomas says. “Ignore them, and you will be walking home.” He says it with a smile, but he means every word.",
    },
    "tomas-m3": {
      title: "A Good Fix Is Quiet",
      text: "Tomas wipes his hands on the red rag in his back pocket, which mostly moves the grease around. “Here is the secret nobody tells you,” he says. “A good fix is a quiet one. No rattles, no squeaks.” A rattle means something is loose, and loose things only get looser. A squeak means metal is rubbing metal, slowly chewing itself away. Tomas says walkers love noise almost as much as he hates it. “If you can hear my fix,” Tomas says, “I did it wrong. Tell me, and I will do it again.”",
    },
    "tomas-m4": {
      title: "Half His Bread",
      text: "Tomas has a habit he thinks is a secret. At supper, Tomas slips Pip half his bread under the table, quick as a card trick. June pretends not to see, though June sees everything. “Pip is still growing,” Tomas says with a shrug. “I am done growing, mostly.” He says it like it is nothing, but bread is not nothing these days. It is one more reason the crew works. “Do not tell June I told you,” Tomas adds. “She thinks her pretending is very convincing.”",
    },
    "tomas-m5": {
      title: "To the Line",
      text: "Tomas draws a line in the air with his wrench. “Fuel needs room in the heat,” he says. “It swells up like bread dough on a warm stove.” So he fills a can to the line, never to the top, and he makes everyone else do the same. A can filled to the brim can leak or split when the sun bakes it, and then the fuel is gone. Tomas says a careful habit is cheaper than a lost can. “To the line,” he repeats, tapping the air twice. “Never to the top.”",
    },
    "tomas-m6": {
      title: "Shut the Doors",
      text: "Tomas has a rule about doors, and he says it like a coach before a big game. When walkers get into the cabin, shut the doors inside. A shut door slows them down, even though they can force it open. “They have to pound and pound,” Tomas says. “Every second they spend on a door is a second you get to aim.” An open door, he says, is just a hallway with hinges, and walkers stroll right through. “Shut it, every time,” Tomas says. “Doors are cheap. Time is not.”",
    },

    // Pip: eleven, curious, asks big questions, they/them
    "pip-t1": {
      title: "A Row for the Dog",
      text: "Pip is eleven, and Pip wants a dog more than anything in the whole world. So Pip added a row to the Hollis chore chart in the dining room. It says: Pip feeds the dog we do not have yet. “It is called planning ahead,” Pip says, very seriously. Then Pip leans in to share a secret. The Hollis family left notes on walls all over the cabin, like a treasure hunt nobody finished. Walk up close to one to read it. “Some are funny, and some are sad,” Pip says. “Every one is worth the walk.”",
    },
    "pip-t2": {
      title: "Minutes on the Wall",
      text: "Pip counts the minutes you are gone and writes the number on the wall in pencil. The numbers march across the plaster like a line of ants. “I want them to get smaller,” Pip says. Then Pip turns serious and tucks the pencil back behind one ear. A trip only counts once you drive home, Pip says. If you go down out there, or the van is wrecked, you lose everything from that trip. You start again from your last save, as if the trip never happened. “So come home,” Pip says. “Every time. That is the rule.”",
    },
    "pip-t3": {
      title: "Counting Every Wave",
      text: "Pip has counted every wave since the first walkers came to the fence. Pip explains the pattern like a weather report, very official. A small wave comes out of the trees on two sides. A big one comes on all four, which is when you want the fence at its best. The warning before a wave says which sides to watch. And sometimes, Pip says, the quiet ends with no wave at all. “Those are my favorite,” Pip says. “It feels like the walkers forgot about us. They never forget for long, though.”",
    },
    "pip-t4": {
      title: "Lookout Duty",
      text: "Pip taps the walkie-talkie clipped to their orange hoodie. “I watch the trees for you now,” Pip says proudly. Before the quiet runs out, Pip calls out what is coming next and from which sides. That gives you time to get ready. “Listen for me,” Pip says. “I will not cry wolf. Only walkers.” June does not love Pip being the lookout, not one bit. But Pip says somebody has to do it, and Pip has the sharpest eyes at the cabin. “Also the best walkie-talkie,” Pip adds. “It is the only one, but still.”",
    },
    "pip-t5": {
      title: "Ruby's Red R",
      text: "Pip practiced painting Ruby's red R on a board, over and over, with a number next to it each time. The first ones looked like pretzels, Pip admits, but the last one was perfect. The number is how many walkers Ruby saw inside a building. “But that number gets old,” Pip warns. There are more walkers by now, because each building gets one more walker every three days, up to a limit. “So when you see a red R,” Pip says, “add a few. Walkers do not wait for the paint to dry.”",
    },
    "pip-t6": {
      title: "The List of Voices",
      text: "Pip pulls a folded paper from their hoodie pocket. It is a list of every voice the crew hears. The first name on it is June, with a crown drawn over it. People say someone named Jo talks on the radio from a rooftop, reading the news to anyone listening. Pip says a voice is just noise until someone writes it down. The Radio room, made of radio parts and wire, brings in voices like Jo's through the static. “And it finds new places for the map,” Pip says. “Voices know where things are.”",
    },
    "pip-t7": {
      title: "A Radio That Reaches",
      text: "Pip is practically bouncing. Pip finally has a radio that reaches town, and every new voice goes straight onto the list in Pip's best handwriting. “Well, my second best,” Pip admits. “My best is too slow for the radio.” The radio plays one broadcast each day you come home, so every trip ends with news. If you miss one, or want to hear it again, you can hear every broadcast at the radio shelf by the couch. “Voices from all over town,” Pip says, “and they are all talking to us. Well, to everyone. But also us.”",
    },
    "pip-t8": {
      title: "Take What You Need",
      text: "Pip got the town's own rule onto the door: take what you need, leave the rest. Pip wrote it big enough to read from the yard, because the whole key ring is built on that rule. Each stash key hides in another building, Pip explains, and a note there says where to find it. But be careful at the lock. A wrong key can jam a stash lock or snap off in it. A snapped key is gone for good. “So read the note twice,” Pip says. “Keys are not for guessing.”",
    },
    "pip-t9": {
      title: "Finn's Treehouse Plan",
      text: "Pip loves Finn Hollis's treehouse plan, the one pinned up in Finn's room. It has a rope ladder, a lookout, and a bucket on a pulley for hauling up snacks. “Finn thought of everything,” Pip says. “Except a dog door. I would add a dog door.” Pip wants to build it someday, once the fence is strong enough that nobody has to watch it every minute. That is where the Walls room comes in. Pip says the Walls room makes the fence stronger and gives you and the van more health. “So first Walls,” Pip says, “then treehouse.”",
    },
    "pip-t10": {
      title: "Teaching It to Sit",
      text: "Already, {dog} follows Pip all around the yard like a sandy shadow. In a wave, it hides in the closet with the crew, ears up and tail tucked. “Listen for barking,” Pip says. If it barks in a wave, a walker is near the cabin, so go and check before trouble gets inside. Pip is teaching {dog} to sit, just like Biscuit in Lucy's drawing. “It sits about half the time,” Pip reports. “The other half, it sits on me. I am counting that as progress.”",
    },
    "pip-m1": {
      title: "Tell Me About Town",
      text: "Pip looks up at you, eyes wide, ready for a story. “What does the town look like out there?” Pip asks. “Tell me everything. Even the boring parts.” Pip listens to every word, like each one is a coin worth saving. Pip wants to know the color of the sky downtown, which stores still have glass, and whether the birds are back. Then come the follow-up questions, one after another, until you run out of answers. “Okay,” Pip finally says. “Next time, look closer. I want details.”",
    },
    "pip-m2": {
      title: "A Knot for Luck",
      text: "Pip has been practicing knots on the fence rope, tying and untying them until the rope looks tired. There is a square knot, a bowline, and one Pip invented that nobody can undo. Pip ties one for you, for luck, and presses it into your hand. “It is a figure eight,” Pip explains. “It never slips, even when you pull hard. That is the luck part.” Pip says sailors tie this knot at the end of a rope, so the rope can never slip away from them. “So you cannot slip away either,” Pip says. “Bring it back.”",
    },
    "pip-m3": {
      title: "Where Everyone Went",
      text: "Pip stares toward town for a long time, then asks the big question again. “Where did everyone go?” Nobody at the cabin has a perfect answer, and Pip knows it. But Pip has thought it through. Some people must still be out there helping each other, Pip says, the way the crew helps each other here. Somebody is sharing water, and somebody is fixing a roof for a stranger. “I want to meet them,” Pip says. “All of them. I bet they have good stories.” Pip says it like a promise, not a wish.",
    },
    "pip-m4": {
      title: "The Leaning Table",
      text: "Pip is still upset about the last ping pong game. “The table leans to the left,” Pip says, arms crossed. “That is the only reason Tomas wins. It is science.” Pip once tested it with a marble, which rolled off the left side every single time. Tomas says Pip and the marble are both sore losers. Pip wants a rematch on a fair table, which the cabin does not have. Until then, Pip keeps a score of their own, with a star next to every loss. “The star means the table cheated,” Pip explains.",
    },
    "pip-m5": {
      title: "Read to the End",
      text: "Pip holds up a finger, the way June does when she has a rule to share. “Read every note to the end,” Pip says. “Every single word.” Some notes in town are old, and some are just plain wrong. A note might say a room is full when somebody emptied it last week. Pip says the truth often hides in the last lines, like the prize at the bottom of a cereal box. Skim a note, and it can trick you. “Skimmers get fooled,” Pip says. “Readers get the good stuff.”",
    },
  });

  /* ---------- Tips: one live, useful thing per talk (CREW_TIPS); the game fills the {placeholders} ---------- */
  T.crew.tips = Object.assign(T.crew.tips || {}, {
    june: Object.assign((T.crew.tips && T.crew.tips.june) || {}, {
      hungry: "June runs her pencil down the ledger and frowns. The pantry is out of food, she says, without a single crate left. The van goes out weak with no food, so bring some home on your very next trip.",
      food: "June counts {food} food crates in the pantry and writes the number in her ledger. That is enough for {days} more trips, she says. Every trip eats food, so keep one eye on that number.",
      ready: "June checks her ledger twice and smiles. You have everything you need to build the {room} room now, she says. Use the office computer to build it, before the scrap gets spent on something else.",
      build: "June says the next build is the {room} room, and she has the list ready in her ledger. It still needs {needs}. Bring those home, and June will clear a spot for it.",
      heal: "June sees you are hurt and sits you down before you can argue. Out come the tape and the clean cloth from her cardigan pocket. She patches you up, and you get back {hp} health.",
    }),
    tomas: Object.assign((T.crew.tips && T.crew.tips.tomas) || {}, {
      van: "Tomas says the van has {hp} of {max} health, and every dent stays until somebody fixes it. A full fix costs {cost} scrap, at the office computer or at the van before you go.",
      vanFree: "Tomas says the van has {hp} of {max} health right now. With the Garage built, a fix costs nothing at all, so there is no good reason to drive out with dents.",
      fence: "Tomas counts {holes} holes and {cracks} cracked boards in the fence. Holes never close on their own, he warns, and each fix you make costs 1 scrap. He would rather fix things before the next wave than after it.",
      cabin: "Tomas counts the cabin's broken doors and windows: {broken}. Each fix costs 2 scrap. Press E at a broken one, or use the office computer, before a walker uses a broken window as a door.",
      crowbar: "Tomas says you have no crowbar, and that makes him nervous. A crowbar pries open one jammed lock and is used up doing it. Build one at the workbench, from the office computer.",
      fine: "Tomas says the van, the fence and the cabin are all in good shape. Nothing needs fixing right now, which almost never happens. He twirls his wrench, looking a little lost without a job.",
    }),
    pip: Object.assign((T.crew.tips && T.crew.tips.pip) || {}, {
      wave: "Pip has been watching the trees from the lookout, walkie-talkie in hand. Here is Pip's call for what comes next: {size}, from {sides}. Pip says to get set before the quiet runs out.",
      keys: "Pip says you are holding {keys}, and Pip is very curious about that. Each key's note says which stash it opens, and your notes are all in the backpack. Read them again before you try a lock.",
      walkers: "Pip keeps count on the wall: in {days} days, the buildings in town each get one more walker, up to a limit. So the sooner you go, Pip says, the fewer walkers wait for you inside.",
      radio: "Pip says the radio plays a new broadcast each day you come home, so every trip ends with news. If you missed one, you can hear them all again at the radio shelf by the couch.",
      full: "Pip draws a line under the tally marks on the wall, like closing a finished column. Every building in town is as full of walkers as it will get, Pip says. From now on, a place is only as dangerous as it is today, and Pip finds that oddly comforting.",
    }),
  });

  /* ---------- Reports: what they did since you last talked (CREW_REPORTS) ---------- */
  T.crew.reports = Object.assign(T.crew.reports || {}, {
    fence: "Tomas fixed {fixed} fence boards since you last talked, and he checked his work twice. It took {scrap} scrap from the base. Tomas says a strong fence is the cheapest friend you will ever have.",
    fenceFree: "Tomas fixed {fixed} fence boards since you last talked. It cost no scrap at all, and Tomas is very proud of that. He says a free fix holds just as well as a paid one.",
    cabin: "Tomas fixed broken doors and windows in the cabin while you were busy: {fixed} in all. It took {scrap} scrap from the base. He says the hinges sound happier already.",
    cabinFree: "Tomas fixed broken doors and windows in the cabin: {fixed} in all. It cost no scrap at all. Every hinge swings quietly again, just the way Tomas likes it.",
    hurt: "Walkers got into the office closet in a wave, and {who} got hurt. Added up over every wave since you last talked, it cost the base {cost}. Everyone is all right now, {who} says, but clear the cabin faster next time, so no walker reaches the closet.",
    late: "Time ran out on the errand: {item}. It is off the list now, and trust dropped a little. Next time, bring the things home before the days run out, and the favor earns trust instead.",
  });

  /* ---------- The dog (DOG.facts in js/story-quests.js) ---------- */
  T.crew.dog = Object.assign(T.crew.dog || {}, {
    ask: "Pip kneels beside the dog, grinning from ear to ear. Pip asks you to give the dog a name. Pip has three ideas, but you found the dog, so you get to choose. Pick one of Pip's, or type your own.",
    named: "Pip says {dog} is a good name, a strong one, a name you could shout across a yard. Then Pip writes {dog} on the list of voices, in big careful letters, because a bark is a voice too.",
    pet: "With a happy huff, {dog} leans against your legs and thumps its tail like a drum. Pip says {dog} likes you best, after Pip, of course. In this yard, that is the highest honor there is.",
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
