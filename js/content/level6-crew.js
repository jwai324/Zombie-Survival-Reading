/* Reading level 6: the crew at home base. Talk, tips, reports, story quests, errands, the dog.
   Facts: js/story-crew.js and js/story-quests.js. See docs/CREW.md and docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[6] = root.ZSR.TEXT[6] || { level: 6 });
  T.crew = T.crew || {};

  /* ---------- Talk: every topic and mood (CREW_TALK) ---------- */
  T.crew.talk = Object.assign(T.crew.talk || {}, {
    // June: dry, warm, in her sixties, a retired school gardener
    "june-t1": {
      title: "A Ledger for the Days",
      text: "June taps the green ledger tucked under her arm. “Before the Fall, I was a school gardener for years,” she says. “Decades of children, and not one of them ever coiled the hose.” These days June keeps the crew's days in this ledger instead, one page for each day: the good, the dull and the frightening alike. She says it lives on the radio shelf by the couch, and you are welcome to read the old pages there whenever you like. “Memory is generous to itself,” June says dryly. “Paper is stricter. When we argue about what happened last week, the ledger wins.”",
    },
    "june-t2": {
      title: "The Closet in a Wave",
      text: "June nods toward the office closet, where the big battery hums among the boxes. “When a wave comes, that is where the three of us go,” she says. “We squeeze in, shut the door, and Pip counts under their breath.” It is not a fortress, though. Walkers that break into the cabin can find the closet too, and walkers that get in there can hurt someone. June says that costs a medical kit from storage, or 2 food if there is no kit to spare. “So when walkers get inside, do not linger in the yard admiring your aim,” June says. “Clear the cabin fast. We will be listening for you.”",
    },
    "june-t3": {
      title: "Counting the Food",
      text: "Every night, June counts the food in the pantry, lips moving, and writes the number in her ledger in a small, stubborn hand. “Some people count sheep,” she says. “I count crates, and I sleep worse.” Every trip in the van eats 1 food crate, because nobody scavenges well on an empty stomach. With no food left, June says, the van goes out weak, and a weak van is a poor companion on a road full of walkers. She calls hunger the kind of arithmetic that only runs downhill. “So bring food home whenever you can,” June says. “Even one crate changes the sum.”",
    },
    "june-t4": {
      title: "The Dinner Bell",
      text: "June glances toward the porch, where the iron dinner bell hangs. She says Dan Hollis hung it there so his kids could hear it in the woods, wherever their games had carried them. One clang, and three Hollis children came crashing home for supper. “Walkers hear it too, and they come to it,” June says. “Ring it, and a wave arrives a few seconds later. Every time, without fail.” So the bell is a decision now, not a convenience: ring it only when you are ready to fight. June is quiet for a moment. She misses bells that only meant supper.",
    },
    "june-t5": {
      title: "Tape and a Clean Cloth",
      text: "June pats the pocket of her green cardigan, where a roll of tape and a clean, folded cloth always ride along, just in case. “Decades of children and garden shears teach you to carry both,” she says. Now that she trusts you, June makes an offer. If you come to her hurt, she will patch you up once between waves. “I am a gardener, not a nurse, so do not get ambitious,” she warns. A medical kit still heals you all the way, and the backpack carries 3 of them, so June would rather you leaned on those. “My tape is a courtesy,” she says. “The kits are the plan.”",
    },
    "june-t6": {
      title: "Rosa of Greenhouse Row",
      text: "June's old friend Rosa ran the greenhouses at Greenhouse Row, and June speaks of her the way some people speak of weather they miss. “Rosa could coax tomatoes out of a parking lot,” she says. “We traded seeds every spring for years.” If anyone in this town still has seeds, June says, it is Rosa, who never threw a single one away. Then June turns practical. Seed packets and a bag of soil are enough to start a Garden, and a Garden grows food every day. “Think of it as a pantry that refills itself,” June says, “provided somebody brings home the dirt.”",
    },
    "june-t7": {
      title: "One Finger Deep",
      text: "June holds up one gloved finger. “One finger deep, then wait,” she says. “I taught that to every class I ever had, and the impatient ones dug their seeds up to check.” She says the town's shelves work the same way. Whatever you take from a shelf or the floor is back 3 days later, as if the buildings quietly restock themselves while nobody is watching. A locked room is different: what you take from a locked room never comes back. June treats those finds like heirloom seed, precious and spent only on purpose. “Patience is a resource too,” she says. “Shelves reward it. Locks do not.”",
    },
    "june-t8": {
      title: "Rosa's Planting Chart",
      text: "You tell June about Rosa's planting chart from Greenhouse Row: beans by the gate, tomatoes at the back, squash where the sun hits. June listens with her eyes half closed, as if she can see the rows. When you reach the last line, the one about her beans, she smiles slowly and says nothing for a moment. “Rosa never forgets a friend,” June says at last. “Not a friend, and not a favor.” Then she asks you to read the chart to her once more. You can, because notes you bring home stay in your backpack, ready to be read again whenever you want them.",
    },
    "june-t9": {
      title: "Keeping the Garden Going",
      text: "June talks about the Garden the way a general talks about a battle that went well. She reminds you of Kate Hollis's note on the fridge, the one that asked whoever found the cabin to keep the garden going. “Well, Kate,” June says to nobody in particular, “now there is one.” Each new level of the Garden grows more food each day, so every level you add pays you back at supper. Then June lowers her voice. Everyone is talking about the River Convoy and the road north. “A cabin with a garden is hard to leave,” she says. “Even for that.”",
    },
    "june-t10": {
      title: "Pip's Problem",
      text: "“That dog,” June announces, “is Pip's problem, not mine.” Then, when she thinks nobody is looking, she slips {dog} the last of her beans from her own plate. June writes its supper in the ledger like everyone else's, one neat line under the crew's, because a ledger has to be honest about every mouth. She admits she is glad of one thing. Walkers never hurt the dog, so nobody has to guard it in a wave. Nobody has to choose between the closet door and a frightened animal. “It simply comes with us and sits,” June says. “Which is more than I can say for Tomas.”",
    },
    "june-m1": {
      title: "Cold Mornings",
      text: "June straightens up with a theatrical groan and presses a hand to one knee. Her knees ache on cold mornings, and she reports it the way other people report the weather. “That is how I know it is morning,” she says. “The sun is unreliable. My knees never are.” She flexes one leg, winces, and waves off your sympathy before you can offer any. Decades of kneeling in wet school gardens, June explains, and the dirt kept a little of her knees as a souvenir. She would do every one of those years again, though she might bring a cushion. “Go on,” June says. “Somebody here ought to have working knees.”",
    },
    "june-m2": {
      title: "The Most Important Rule",
      text: "June says the most important rule, the one that outranks all the others, is to say where you are going before you go. It sounds too obvious to bother with, she admits, and that is exactly the trouble. Obvious rules are the first ones people forget when they are frightened or in a hurry, and in this town everyone is usually both. If nobody knows where you went, nobody knows where to look, or when to start worrying. “I am going to worry regardless,” June says. “I would simply like to worry in the right direction.”",
    },
    "june-m3": {
      title: "Quiet Days",
      text: "June does not trust a quiet afternoon, but she refuses to waste one. “Quiet days are not wasted,” she says. “They are how you get ready for the loud ones.” In her view the calm is a loan, and the next wave always comes to collect. So she keeps a list and recites it like a hymn: fix the fence, count the food, mend what is fraying, sleep if there is time. There is never time left over. “Do the dull work while it is quiet,” June says. “The loud days will not wait while you look for a hammer.”",
    },
    "june-m4": {
      title: "Honest, Not Neat",
      text: "June turns the green ledger so you can see a page crowded with crossed-out words, smudges and one suspicious ring from a mug. “A ledger only has to be honest,” she says. “Nobody said anything about neat.” She writes down the bad days too: trips that come home empty, nights nobody sleeps, arguments over the last can of peaches. Skipping them would make the book prettier and completely useless. A record that only remembers good news, June says, is not a record. It is a brochure. “If someone reads this one day,” she says, “I want them to know what it cost.”",
    },
    "june-m5": {
      title: "Remember the Sunflowers",
      text: "Some evenings June goes quiet and stares at nothing in particular. When you ask, she says she wonders where her old school kids are now. She means the bean-teepee builders, the ones who named every worm, and the boy who sulked for a week over pumpkins lost to frost. She hopes they are somewhere safe and warm, arguing about whose turn it is. Mostly, she hopes they remember the sunflowers. Every spring her students planted a row along the school fence, and by August it stood taller than the principal. “A sunflower turns to follow the light,” June says. “I hope they are doing the same.”",
    },

    // Tomas: seventeen, engines, stubborn, earnest
    "tomas-t1": {
      title: "An Old but Honest Van",
      text: "Tomas is seventeen, and as far as he is concerned, his whole job is keeping the van alive. He pats its dented fender while he talks. “It is old but honest, like a good mule,” he says. “It will never win a race, but it will never lie to you about what it can carry.” Then he gets serious. Damage to the van stays from one trip to the next, and nothing heals overnight. Fix it at the office computer, or at the van before you go, and do not count on luck to cover the difference. “Drive out hurt, come home worse,” Tomas says. “That is not a saying. It is a forecast.”",
    },
    "tomas-t2": {
      title: "Walking the Fence Line",
      text: "Tomas jerks a thumb at the fence line. When it is quiet, he says, he walks it himself and fixes the holes and cracks he finds. Then he tells you about it the next time you talk. “Consider it a service,” he says, “not a charity.” Each of his fixes costs the base 1 scrap, the same as yours, because a board is a board no matter whose hands hold it. He wants one thing understood: holes never close on their own. If you spot one before he does, stand at the gap and press E to fix it yourself. “Walkers find gaps faster than I do,” Tomas admits. “They are very motivated.”",
    },
    "tomas-t3": {
      title: "Walkers Listen",
      text: "Tomas tilts his head, as if he can hear something you cannot. “Walkers listen the way I listen to an engine,” he says. “Not to the words. To the trouble underneath.” Every shot you fire in the quiet tells them where the cabin is, and it brings the next wave sooner. He has watched it happen from under the van, wincing at every shot. A bow is different, Tomas says: it makes no sound, so walkers do not hear it at all. If you have to thin the herd during the calm, that is the tool for it. “Noise is a bill,” he says. “Sooner or later, somebody comes to collect.”",
    },
    "tomas-t4": {
      title: "Every Hinge by Its Squeak",
      text: "Tomas claims he knows every hinge in the cabin by its squeak. To prove it, Tomas closes his eyes while Pip opens doors at random, and he names each one. “Pantry. Foyer. Gus's room, obviously,” he says. Then his grin fades, because walkers are less polite than hinges. They smash windows and climb in, and nobody can climb out through a broken one. A shattered window is a door that only swings one way. A broken door or window costs 2 scrap to fix. Press E at it, or use the office computer, which can fix them all at once. “Cheap,” Tomas says. “Cheaper than the alternative, anyway.”",
    },
    "tomas-t5": {
      title: "Handing Over Wrenches",
      text: "Tomas learned engines from his father, mostly by lying on cold concrete and handing him wrenches under cars. “Nine-sixteenths,” he says, in his father's deeper voice. “No, the other nine-sixteenths.” His father learned the trade from Mr. Ortiz at Ortiz Auto, who taught half the mechanics in town and never once let them skip a step. Tomas hopes Mr. Ortiz is still out there somewhere, inspecting somebody's work. Then he turns back to business. Most van upgrades stop at level 2 until you build a Garage, because some jobs need a proper roof over them. “Build the Garage,” Tomas says, “and I will build you a better van.”",
    },
    "tomas-t6": {
      title: "A Garage at Last",
      text: "Tomas cannot stop smiling about the Garage. He finally has one, like the garage his father worked in, with a place for every tool and a smell of oil better than bread. “I keep walking in just to stand there,” he admits. The Garage earns its keep, too. With it built, the van comes home fixed after every trip, for free, so you never set out carrying yesterday's dents. And each Garage level lets the van's upgrades go one level higher. “Every level you build is another level I can bolt on,” Tomas says. “I have a list. It is a long list.”",
    },
    "tomas-t7": {
      title: "Up the River Road",
      text: "Tomas has been studying the river road on a map, tracing it north with one greasy finger. If the River Convoy ever leaves, he thinks the van could make it up the river road, given decent tires and a little faith. Then his finger stops moving. June is not sure she wants to go, and Tomas will not go without her. He says it plainly, like a fact about torque. “So I am getting the van ready for a trip we might never take,” he says. “That is still worth doing.” Each Armor Plating upgrade gives the van 30 more health, Tomas says, and he wants every one.",
    },
    "tomas-t8": {
      title: "The KEEP OUT Sign",
      text: "Tomas sleeps in Gus's room, under a sign that orders everyone to KEEP OUT. He says the sign now means Pip, and he enforces it about as well as Gus probably did. Gus left a guitar behind, too, with two broken strings. Tomas tunes the four good ones some nights and wants to fix the rest someday, once he finds strings. “It deserves to be played,” he says. Meanwhile, there is news. Now that he trusts you, Tomas also fixes the cabin's broken doors and windows himself when it is quiet. He will tell you what he did, and what it cost, the next time you talk.",
    },
    "tomas-t9": {
      title: "News of Mr. Ortiz",
      text: "You tell Tomas what Dev's note says: Mr. Ortiz is safe at the Water Tower with Theo, helping to keep the pumps running. Tomas goes very quiet. He sets his wrench down carefully, as if it might break, and stares at it for a long moment. Then he grins, wide and helpless, the way a person grins when a weight they forgot they were carrying suddenly lifts. “That stubborn old man,” Tomas says. “Of course he is fine.” The plans start pouring out at once. A Garage, built from engine parts and a tool kit, is the first thing Mr. Ortiz would want to see, Tomas says.",
    },
    "tomas-t10": {
      title: "Traps Out First",
      text: "Tomas does not like to talk about the hardest night, the one when walkers hit the fence from every side at once. He talks about it anyway, because he has drawn a lesson from it. Next time, he wants traps out first, before the first board even creaks. Spike traps need the Walls at level 2, and blast traps need level 3. Make them at the workbench, which you reach from the office computer, then press T or R in the yard to set them down. “A fence holds them,” Tomas says. “A trap thins them out. I want both, every time.”",
    },
    "tomas-m1": {
      title: "Talking to the Engine",
      text: "Tomas spends hours under the van, only his boots showing, whistling tunes nobody else knows and talking to the engine like an old friend. “Come on,” he murmurs. “You have done harder things than this.” When it coughs, he apologizes to it. When it starts, he thanks it. Pip says this is strange. Tomas says it is simply good manners, and that an engine treated with respect will carry you home on fumes and stubbornness. He seems to believe it completely. “Everything runs better when somebody believes in it,” Tomas says. “Engines especially. People too, now that I think about it.”",
    },
    "tomas-m2": {
      title: "Tick, Knock, Squeal",
      text: "Tomas gives you a lesson whether you asked for one or not. An engine, he says, is always talking; the trick is learning its language. A tick means one thing, usually something small and patient that can wait until morning. A knock means another, something deeper that will not wait forever. And a squeal means stop right now: no arguments, no heroics, no one more mile. “People are the same,” Tomas adds. “June ticks. Pip knocks. I squeal, apparently, according to June.” Tomas considers this with a frown. “She may have a point.”",
    },
    "tomas-m3": {
      title: "A Good Fix",
      text: "Tomas wipes his hands on the red rag in his back pocket, which has long since stopped making anything cleaner. “A good fix is a quiet one,” he says. “No rattles, no squeaks, nothing that announces itself.” A repair that makes noise, he believes, is only a promise to break later, at the worst possible moment. Out here a rattle is also an invitation, since walkers follow sound. So Tomas tightens, shims and oils until a thing goes silent. “You should not notice my work,” he says, tucking the rag away. “That is how you know it is done.”",
    },
    "tomas-m4": {
      title: "Half His Bread",
      text: "At supper, Tomas has a habit he believes is a secret. When Pip's plate looks thin, Tomas tears his bread in two under the table and slips half of it to Pip. June pretends not to see. She has pretended not to see it every single night, with great dedication. “I am done growing,” Tomas mutters, as if that settles it. “Some of us are not.” Tomas shrugs, a little embarrassed at being caught. “Besides,” he adds, “somebody in this cabin has to grow tall enough to reach the top shelf. It is clearly not going to be June.”",
    },
    "tomas-m5": {
      title: "Fill to the Line",
      text: "Tomas is strict about fuel cans in a way he is strict about almost nothing else. He fills a can to the line, never to the top, and he will make you pour some back if you get greedy. Fuel needs room in the heat, he explains. It swells as it warms, and a brimming can on a hot day strains at its seams like a held breath. “The line is there for a reason,” Tomas says. “Somebody learned that reason the hard way, so that you would not have to.” He taps the can twice. “Respect the line.”",
    },
    "tomas-m6": {
      title: "Shut the Doors",
      text: "Tomas has a rule for the bad nights. When walkers get into the cabin, shut the doors inside it behind you as you go: the office, the kitchen, the bedrooms, every one you pass. A shut door slows them down, even though they can force it open. “It is not about stopping them,” he says. “It is about buying seconds.” Seconds, Tomas insists, are the cheapest thing in the world until you need one, and then they are priceless. A door you closed buys you time to reload, to turn, to think. “Close it behind you,” he says. “Every time. Especially when you are in a hurry.”",
    },

    // Pip: eleven, curious, asks big questions (they / them)
    "pip-t1": {
      title: "A Row for the Dog",
      text: "Pip is eleven and wants a dog more than anything, which they will tell you within a minute of meeting you, and again a minute later. Pip has already made it official. On the Hollis chore chart, under the gold stars, Pip added a row in pencil: Pip feeds the dog we do not have yet. “It is called planning ahead,” Pip says. Then Pip leans in with a tip. The Hollis family left notes on walls all over the cabin, little pieces of who they were. Walk up close to read one. “They are like voices,” Pip says, “just slower.”",
    },
    "pip-t2": {
      title: "Counting the Minutes",
      text: "Pip counts the minutes you are gone and writes the number on the wall by the stove, in big uneven figures. “So we know what normal is,” Pip explains, as if it is obvious. Then Pip turns serious, which on an eleven-year-old face looks almost grown. A trip only counts once you drive home, they say. Everything you find out there is borrowed until the van rolls back into the yard. If you go down or the van is wrecked, you lose everything from that trip and start again from your last save. “So come home,” Pip says. “The number on the wall likes being small.”",
    },
    "pip-t3": {
      title: "Counting the Waves",
      text: "Pip has counted every wave since the first walkers came to the fence, and keeps the tally in pencil on a flattened cereal box. Counting, Pip says, is how you stop being scared of a thing and start understanding it. Here is what the numbers say. A small wave comes out of the trees on two sides, and a big one comes on all four. The warning tells you which sides, so you know where to stand before they arrive. And sometimes the quiet simply ends with no wave at all. “I count those too,” Pip says. “Zero is a number. It is my favorite one.”",
    },
    "pip-t4": {
      title: "Eyes on the Trees",
      text: "Pip watches the trees for you now, walkie-talkie clipped on and a pencil behind one ear. Before the quiet runs out, Pip calls out what is coming next and from which sides, so you have time to get into position. “I see them before they see us,” Pip says, with some pride. June does not love Pip being the lookout. She says eleven is too young to be anybody's early warning system. Pip says somebody has to, and that nobody else has eyes this sharp or this patient. “Besides,” Pip adds, “June watches me watching. So we are safe twice.”",
    },
    "pip-t5": {
      title: "Ruby's Red R",
      text: "Pip has been practicing Ruby's red R on a spare board, with a number painted next to it, the way Ruby marks buildings around town. Pip explains the system with great seriousness. The number is how many walkers Ruby saw inside a building when she passed through. “But it is old news the moment the paint dries,” Pip says. There are more by now, because each building gets one more walker every three days, up to a limit. So Pip treats Ruby's number as a floor, not a ceiling, and thinks you should too. “Ruby counts,” Pip says. “Time adds.”",
    },
    "pip-t6": {
      title: "The List of Voices",
      text: "Pip keeps a list of every voice the crew hears, written in a notebook that is starting to come apart at the spine. The first name on it is June, underlined twice. Lately there is a rumor at the bottom of the page. People say someone named Jo talks on the radio from a rooftop, reading out news and warnings to anybody listening. Pip wants that voice on the list more than almost anything. The Radio room, made of radio parts and wire, would find new places for the map, Pip says, and maybe Jo too. “Imagine,” Pip says. “A voice that knows things we do not.”",
    },
    "pip-t7": {
      title: "A Radio That Reaches",
      text: "Pip finally has a radio that reaches town, and has barely slept since. Every new voice goes on the list, with the date and a note about how it sounded: tired, kind, bossy, brave. The radio plays one broadcast each day you come home, so Pip waits beside it the way kids once waited for the ice cream truck. And nothing is lost. You can hear every broadcast again at the radio shelf by the couch, which Pip says is the best part. “A voice you can replay is a voice you can check,” Pip says. “Some of them leave clues.”",
    },
    "pip-t8": {
      title: "The Town's Own Rule",
      text: "Pip got the town's own rule onto the door, in bright letters beneath June's: take what you need, leave the rest. Pip thinks it is the best rule anyone ever made, because it assumes people are decent and dares them to prove it. The stash keys work in the same spirit, Pip says. Each stash key hides in another building, and a note there says where, so only people who read carefully ever find one. Read too fast, and you pay for it. A wrong key can jam a stash lock or snap off in it. “The key ring trusts readers,” Pip says. “Be one.”",
    },
    "pip-t9": {
      title: "Finn's Treehouse",
      text: "Pip loves Finn Hollis's treehouse plan, drawn in careful marker with arrows everywhere: a rope ladder, a lookout and a bucket on a pulley. Pip has studied it so often that they could draw it from memory. Pip wants to build it someday, once the fence is strong enough that a treehouse is a treat and not a target. That makes the Walls room Pip's favorite project. It makes the fence stronger and gives you and the van more health, Pip says, which is everything a treehouse needs underneath it. “Strong walls first,” Pip says. “Then the bucket on a pulley.”",
    },
    "pip-t10": {
      title: "Teaching It to Sit",
      text: "These days {dog} follows Pip around the yard like a sandy shadow. In a wave it hides in the closet with the crew, pressed against Pip's knees. Pip wants you to know about the barking. If it barks in a wave, a walker is near the cabin, Pip says, so go and check before trouble gets any further inside. Pip is also teaching it to sit, like Biscuit in Lucy's drawing. Progress is uneven. “It sits beautifully,” Pip reports, “for exactly one second, and then it sits on me.” Pip has decided that still counts, and writes it down as a success.",
    },
    "pip-m1": {
      title: "What the Town Looked Like",
      text: "Pip pounces the moment you are within reach. “What did the town look like today?” Pip asks, and then listens to every word as if you were reading aloud from a great novel. Pip wants all of it: which streets were empty, what the signs said, whether anything at all is growing in the cracks. If you leave something out, Pip notices. “You skipped the part between the van and the door,” Pip says. “That is usually the best part.” Some nights Pip writes your answers down, word for word, in the back of a notebook.",
    },
    "pip-m2": {
      title: "A Knot for Luck",
      text: "Pip is practicing knots on the fence rope, tongue between teeth, fingers flying. There is a bowline, a clove hitch, and something Pip invented and insists on calling the Pip. Each one gets tied, inspected and untied again. Then Pip ties one more, carefully, and presses it into your hand. “For luck,” Pip says. Pip knows luck may not be real. A knot is, though, and it holds whatever you trust it with, which Pip says is close enough. “Bring it back,” Pip adds. “I want to know whether it worked.”",
    },
    "pip-m3": {
      title: "Where Everyone Went",
      text: "Pip asks a question nobody at the cabin can answer: where did everyone in town go? Not the walkers, Pip clarifies. The people. The ones who ran the shops and drove the buses and waved at kids on bikes. June changes the subject. Tomas suddenly needs to look for a wrench. Pip keeps thinking out loud anyway. Some people must still be out there helping each other, Pip decides, because people always do that when things get bad. Pip wants to meet them. “Not to take anything,” Pip says. “Just to tell them we are here too.”",
    },
    "pip-m4": {
      title: "The Leaning Table",
      text: "Pip has a theory about the ping pong table and will share it whether or not you ask. The table leans to the left. Not much, Pip admits, but enough: enough that a ball struck with ordinary, honest skill drifts away from the paddle and off the edge. That is the only reason Tomas wins, Pip says firmly. Tomas, who has won the last several games, suggests Pip try holding the paddle the right way around. Pip is preparing a scientific study involving a marble and a notebook. “Results soon,” Pip says darkly. “Very soon.”",
    },
    "pip-m5": {
      title: "Read to the End",
      text: "Pip has one piece of advice and repeats it at every opportunity, sometimes with a raised pencil for emphasis. Read every note to the end. Not the first line, not the middle: the end. Some notes in town are old or wrong, and the last lines are often where the writer admits it. Pip learned this from books, where the twist always waits near the final page. “Notes are like people,” Pip says. “They tell you the important part right when you are about to leave.” Then Pip taps your backpack, very meaningfully.",
    },
  });

  /* ---------- Tips: live useful information (CREW_TIPS), placeholders exactly as the facts carry them ---------- */
  T.crew.tips = Object.assign(T.crew.tips || {}, {
    june: Object.assign((T.crew.tips && T.crew.tips.june) || {}, {
      hungry: "June says the pantry is out of food, every shelf bare to the wood, and for once she does not make a joke of it. The van goes out weak with no food, she warns. So whatever else you chase on the next trip, bring some food home.",
      food: "June has counted the pantry again, ledger open on her knee: {food} food crates on the shelves. That is enough for {days} more trips in the van, she says, provided nobody gets creative with the peaches.",
      ready: "June has checked the storage twice, and the news is good: you have everything you need to build the {room} room now. Use the office computer to build it, she says, and do it while the yard is quiet, because in a wave the computer has to wait.",
      build: "June runs a finger down a column in her ledger. The next build is the {room} room, she says, and it still needs {needs}. She would like you to keep an eye out for whatever is missing on your next trip.",
      heal: "June sees you are hurt, takes the tape and the clean cloth from her cardigan pocket, and says, “Hold still.” She patches you up without further discussion. You get back {hp} health, plus a short lecture on being careful.",
    }),
    tomas: Object.assign((T.crew.tips && T.crew.tips.tomas) || {}, {
      van: "Tomas has been listening to the van with a frown. It has {hp} of {max} health, he says, and he does not like that rattle. A full fix costs {cost} scrap, at the office computer or at the van, and he would do it before the next trip.",
      vanFree: "Tomas pats the van's hood. It has {hp} of {max} health, he says, and normally that would worry him. With the Garage built, though, a fix costs nothing, so there is no excuse to drive out with a single dent.",
      fence: "Tomas has walked the fence line and counted {holes} holes and {cracks} cracked boards. Holes never close on their own, he reminds you, and each fix you make costs 1 scrap. He will get to what he can in the calm, but walkers rarely wait for him.",
      cabin: "Tomas has made his rounds and counted the cabin's broken doors and windows: {broken}. Each fix costs 2 scrap, he says. Press E at a broken one to fix it by hand, or let the office computer handle the whole job at once.",
      crowbar: "Tomas says you have no crowbar, and he does not like it. A crowbar pries open one jammed lock and is used up doing it, he explains. Build one at the workbench, from the office computer, before a bad guess at some lock leaves you stuck.",
      fine: "Tomas wipes his hands on his red rag with real satisfaction. The van, the fence and the cabin are all in good shape, he says. Nothing needs fixing right now, which almost never happens, so he intends to enjoy it.",
    }),
    pip: Object.assign((T.crew.tips && T.crew.tips.pip) || {}, {
      wave: "Pip has been watching the trees from the lookout, pencil tapping against the walkie-talkie, and now makes the call: {size}, from {sides}. Pip says to spend whatever quiet is left wisely, and to trust the count.",
      keys: "Pip has noticed the jingle in your pocket: you are holding {keys}. Each key's note says which stash it opens, Pip reminds you, and your notes are all in the backpack. “Read it again before you try a lock,” Pip says.",
      walkers: "Pip keeps count, and the numbers are not good news: in {days} days, the buildings in town each get one more walker, up to a limit. Pip says the places you keep putting off will only get busier.",
      radio: "Pip says the radio plays a new broadcast each day you come home, and Pip has not missed one yet. If you have, no harm done: you can hear them all again at the radio shelf by the couch.",
    }),
  });

  /* ---------- Reports: what a crew member did since you last talked (CREW_REPORTS) ---------- */
  T.crew.reports = Object.assign(T.crew.reports || {}, {
    fence: "Tomas reports, a little proudly, that he fixed {fixed} fence boards since you last talked. It took {scrap} scrap from the base, the same price you would have paid, and every board is one the next wave cannot walk through.",
    fenceFree: "Tomas reports, a little proudly, that he fixed {fixed} fence boards since you last talked. It cost no scrap at all, which Tomas considers the finest kind of repair there is.",
    cabin: "Tomas went through the cabin while it was quiet and fixed broken doors and windows: {fixed} in all. It took {scrap} scrap from the base. Everything swings and latches properly again, he says, and he tested each one twice.",
    cabinFree: "Tomas went through the cabin while it was quiet and fixed broken doors and windows: {fixed} in all. It cost no scrap at all, and Tomas is still faintly smug about it.",
    hurt: "Walkers forced their way into the closet during the wave, and {who} got hurt. It cost the base {cost} to set things right. Everyone is all right now, {who} says, but the closet felt very small for a while.",
    late: "Time ran out on the errand: {item}. It is off the list now, crossed through in pencil, and trust dropped a little. Nobody is angry, exactly, but a promise that runs late leaves a mark.",
    heal: "June patched you up, with tape and a clean cloth and no fuss, and gave you back {hp} health. She says that next time you might try staying in one piece, but she says it kindly.",
  });

  /* ---------- The dog (DOG.facts) ---------- */
  T.crew.dog = Object.assign(T.crew.dog || {}, {
    ask: "Pip is practically vibrating. The dog needs a name, and Pip asks you to give it one. Pip has three ideas ready, written in pencil and underlined, but you found the dog, so you choose. “No pressure,” Pip says. “It is only forever.”",
    named: "Pip tries it out loud a few times and decides that {dog} is a good name, a very good name. Then Pip opens the notebook and writes {dog} on the list of voices, because a bark is a voice too, and this one counts.",
    pet: "{dog} leans against your legs with a contented sigh and thumps its tail. Pip watches, pretending not to be jealous. Pip says {dog} likes you best, then quickly corrects that: second best, after Pip.",
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
