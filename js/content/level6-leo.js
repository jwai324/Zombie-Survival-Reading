/* Reading level 6: the Captain Leo (Mira-8) crossover universe. June's ledger lines and the radio (T.universe.leo), and the
   crew's words for this universe's topics and quests (merged into T.crew). Facts: js/story-leo.js.
   Design: docs/UNIVERSES.md; rules for the words: docs/TEXT_GUIDE.md. Shown only while Settings: Universe is on.
   Level 6: sentences of 26 words or fewer, sophisticated vocabulary, voice and subtext. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[6] = root.ZSR.TEXT[6] || { level: 6 });
  T.universe = T.universe || {};
  T.crew = T.crew || {};

  T.universe.leo = {
    /* June's ledger: a few lines under the day's page, June writing */
    journal: [
      {
        title: "The Second Moon",
        text: "Mira-9 rose over the trees tonight, huge and pale, its white clouds turning so slowly you could mistake them for standing still. Everyone on Mira-8 grows up under it, which is exactly why most of us stopped noticing. Pip has not. “June, does anyone still live up there?” Yes, I said: the Mirans, the cloud-people. But that is a story for another night, and it deserves a full candle.",
      },
      {
        title: "Founders' Day",
        text: "The calendar on my wall insists that today would have been Founders' Day. Every year the whole town ate cake and told the story of Captain Leo and Co-captain Camila. They were the first kids to reach Mira-9, about two hundred years ago, and the town never tired of saying so. Nobody baked a cake this year. “June, the story never needed the cake,” Pip said, and told it anyway, with sound effects.",
      },
      {
        title: "Why Only Kids",
        text: "Tomas asked me tonight, “June, why did everyone who came to Mira-8 come as a kid?” So I told him about the Skip Drive, which folds space like a sheet of paper and pokes a hole straight through the fold. It only works on bodies that are still growing, so only kids can ride it. I rode it when I was ten years old, with one bag and one photo. I was terrified, and I would do it again.",
      },
      {
        title: "The Gray",
        text: "“June, what does the town call it?” Tomas asked, meaning the sickness across the river. The Gray, I told him, and wrote it here so the name would sit still. Long ago, Mira-8 had a forest in the sky, like the one on Mira-9. It withered before the first kids ever came. The miners across the river dug deep and brought up what was left of it. The Mirans had warned the town not to dig there. Some warnings only make sense afterward.",
      },
      {
        title: "The Jar on the Sill",
        text: "This morning I turned the jar on the windowsill toward the light, as I have nearly every morning of my life. It holds a cloud-tree seed from Mira-9, given to my grandmother when she was a girl. It has never sprouted, because nobody knows the right air for it. I water it anyway. “June, that is completely illogical,” Pip observed. Quite right, I said. So is most of what keeps people going.",
      },
      {
        title: "The Come Back Knock",
        text: "I remember the old radios in town picking up three soft notes from Mira-9. It sounded like a knock on a door, so the town called it the Come Back Knock. Before the Mirans ever knocked, they spent many years sending numbers: one, two, three, up to ten, patient as a metronome. Pip asked, “June, what if nobody had ever answered?” Then they would still be counting, I said. That thought kept me awake.",
      },
      {
        title: "Koen's Dog",
        text: "Tomas rebuilt the porch step today and lectured the whole time about Koen, the builder on Captain Leo's crew. Koen built Bolt, a robot dog made of bolts and wire, and Bolt went everywhere he went. Every school on Mira-8 kept a Bolt-model robot dog to sniff the air pipes for leaks. The step no longer complains when I stand on it. Tomas says Koen would have approved, though he would have used fewer nails.",
      },
      {
        title: "Three Misty Fingers",
        text: "Tonight I read Pip the last page of the mission report that Captain Leo and Co-captain Camila wrote together. At the end, Sool, the Miran, waved goodbye with three misty fingers. Mirans live a very long time, so Sool may still be up there, two centuries later, watching the same sky from the other side. “June, really?” Pip asked. Then Pip went to the window and waved at the sky, just in case.",
      },
    ],
    /* The radio: the knock, Jo and a Miran voice (Sool). Each names its speaker. */
    radio: [
      {
        title: "Jo and the Knock",
        text: "Before Jo's show tonight, three soft notes slipped through the static, unhurried and unmistakable: knock, knock, knock. Then Jo came on, sounding more awake than anyone has a right to at that hour.\n\n“Did you catch that? The old folks call it the Come Back Knock, and it comes from Mira-9, all the way across the sky. It came every few days before the Fall too, regular as the tide. So here is the one thing I want you to keep. If you hear it, you are not alone. Jo out.”",
      },
      {
        title: "A Voice Called Sool",
        text: "After the knock, a different voice came on, soft as wind combing through tall grass. It was not Jo, and it did not sound like anyone born on Mira-8.\n\n“Hello. I am Sool. We hear you.”\n\nThe words arrived slowly, each one set down with care, like stones placed across a stream. Sool said the Mirans are watching Mira-8 from their clouds. Then Sool added one more thing, gently, the way you warn a child away from a hot stove.\n\n“Do not dig. Stay together.”\n\nAfter that, only static, and a cabin full of people forgetting to breathe.",
      },
      {
        title: "Jo Reads a School Book",
        text: "This is Jo on 88.1. Tonight I am reading from an old school book about the first mission. Half of you had this exact copy in class, with somebody else's doodles in the margins.\n\nCaptain Leo and five other kids flew the ship Skip-One to Mira-9, and there they met the Mirans. The Mirans breathe methane, and their trees float in the clouds like anchored islands. Now, here is the part I always skipped ahead to. The Mirans counted on the radio for years before anyone came. Nobody answered, and they counted anyway. Make of that what you will. Jo out.",
      },
      {
        title: "Sool on the Gray",
        text: "The knock came first, and then Sool's slow, soft voice, like breath fogging a cold window.\n\nSool said Mira-8 once had a sky-forest too, like the one on Mira-9. It went gray and quiet long before the first kids came. Then the voice paused for so long that the static itself seemed to be holding its breath, waiting to hear the rest.\n\n“What is gray, leave sleeping.”\n\nSool offered nothing more. The radio hissed on until morning, and nobody at the cabin slept much, either.",
      },
      {
        title: "Jo: A Dog on the Road",
        text: "Jo here, with an odd one tonight. Somebody spotted a robot dog on the river road. It was limping badly, and one blue eye kept blinking on and off, like a porch light with a loose bulb and a stubborn owner. From the description, it looked like an old Bolt-model, the kind every school kept.\n\nSo here is my request. If you know how to fix one of those, keep your toolbox handy and your eyes open. A dog like that should not be wandering out there on its own. Jo out.",
      },
      {
        title: "Sool Asks About Us",
        text: "After the knock, Sool spoke again, slowly, as if each word had been chosen from a long shelf of words and dusted off first.\n\n“Are you eating? Are you warm?”\n\nSool was asking about the kids of Mira-8. Then Sool told a story the Mirans have kept for two centuries. Long ago, Captain Leo promised them he would come back. And he did, not once but many times, which is how the Mirans learned what a promise from a kid is worth. Sool ended with words that sounded less like advice than like law.\n\n“Kids first. Kids are bravest.”",
      },
      {
        title: "Jo Knocks Back",
        text: "Tonight Jo tried something nobody on the dial had dared. Jo played the knock back on the air: three notes, slow and deliberate, like a neighbor at the door after a storm. Then the station went silent, and everyone listening, all over town, held still and waited.\n\nNo answer came that night. Jo did not sound discouraged, though, only thoughtful.\n\n“The Mirans are patient,” Jo said. “They counted for many years before anyone answered them. I think we can manage a few nights. Jo out.”",
      },
      {
        title: "Sool's Song",
        text: "Sool hardly spoke tonight. Instead, Sool hummed the cloud-tree song, slow, with long notes that rose and fell like a chest breathing in deep sleep. Nobody at the cabin moved to turn it down. Pip set down the whittling knife, and even the stove seemed to crackle more quietly. Then Sool spoke, very softly.\n\n“We wait. We are friends.”\n\nAfter that, the knock came again, three soft notes, and the radio went quiet, the way a house goes quiet once the last guest has left.",
      },
    ],
  };

  T.crew.talk = Object.assign(T.crew.talk || {}, {
    "june-leo-t1": {
      title: "A Garden Nobody Planted",
      text: "June came to Mira-8 on the Skip Drive when she was ten years old. She brought one bag and one photo of her mother's garden, and she held the photo so tightly that its corner is still bent. She planted her first seeds on Mira-8 the week she landed, in soil nobody had ever turned. “A new world is just a garden nobody has planted yet,” June says, as though it were the simplest thing imaginable. Then she turns practical, as she always does. The Garden room grows 1 food a day at its first level, and more as it grows.",
    },
    "june-leo-t2": {
      title: "A Seed in a Jar",
      text: "June keeps a cloud-tree seed from Mira-9 in a jar on the windowsill. Long ago, a Miran named Sool gave seeds like it to Captain Leo's crew, and a few of them found their way into ordinary kitchens. On Mira-9 the cloud-trees float in the sky. They breathe in carbon dioxide and breathe out methane, the reverse of every tree June has ever pruned. “The seed is waiting for the right air,” June says, “and so am I.” Then she offers something more useful than wistfulness. The Lab room, once it is built, makes medical kits as the days go by.",
    },
    "tomas-leo-t1": {
      title: "Koen, the Builder",
      text: "Tomas says Koen, the builder on Captain Leo's crew, is the reason he learned to fix things. Koen built Bolt, a robot dog of bolts and wire. Once, Koen fixed a ship's lights with Bolt holding the other wire, which Tomas considers the bravest repair ever attempted, and also the least sensible. Tomas's father kept a picture of Koen over his workbench, so Tomas grew up under that steady, slightly smug gaze. “Here is a builder's tip,” Tomas says, unable to resist. “The Garage room lets me fix the van for free.”",
    },
    "tomas-leo-t2": {
      title: "Every School's Dog",
      text: "Tomas says every school on Mira-8 had a Bolt-model robot dog to sniff the air pipes for leaks. Most of them shut down in the Fall, he says, but their parts are still out there. They lie scattered across town like pieces of a puzzle nobody has the box for. A Bolt-model's nose is really a tiny chemistry kit, and Tomas admits that impresses him more than most engines. Then he adds a scavenger's tip, because he despises a wasted trip. The things you take from a shelf in town come back after 3 days.",
    },
    "pip-leo-t1": {
      title: "Named After PIP",
      text: "Pip was named after PIP, the helper voice on the ship Skip-One. PIP talked Captain Leo's crew all the way to Mira-9 and home again, across a gulf of space nobody had crossed before. Pip likes that PIP always had an answer and never panicked, not even once, according to every book. “That is the standard,” Pip says, “even if I fall short of it most days.” Then Pip supplies an answer of their own, the kind PIP might have given. The Radio room finds new places for the map.",
    },
    "pip-leo-t2": {
      title: "Knocking Back",
      text: "Pip wants to knock back one day: three notes, sent all the way to Mira-9. The first Mirans counted on the radio for years, hoping someone would answer, and Pip cannot stop thinking about all those unanswered numbers. “A knock with no answer is the loneliest sound there is,” Pip says, with the seriousness of someone who has thought it through. So Pip practices the rhythm on the cabin wall with two knuckles, to the mild despair of everyone else. Once the Radio room is built, Pip adds, the knock comes on the radio every few days.",
    },
  });

  T.crew.quests = Object.assign(T.crew.quests || {}, {
    "tomas-leo-1": {
      title: "Box of leg motors",
      brief: "Tomas found a shut-down Bolt-model robot dog by the back fence, and he wants to wake it up. It is dented, caked with dust and missing most of its dignity, but Tomas swears the frame is sound. First it needs new leg motors, because the old ones have rusted into something closer to rock than machinery.\n\nReyes Hardware is northeast of the cabin. A box of leg motors sits on the floor beside the riding mower. It is a cardboard box with a red label, easy to overlook if you are hurrying. Mr. Reyes always stocked odd things, Tomas says, on the theory that somebody would need them eventually. Somebody does. Tomas will give you 25 scrap and 1 spool of wire.",
      tag: "A cardboard box of four small leg motors, each one wrapped in paper as carefully as a birthday present. The red label says: for school robot dogs, Bolt-model. They rattle softly when you lift the box.",
      journal: "You brought Tomas a box of leg motors from Reyes Hardware. The robot dog by the van can stand now, though it wobbles like a newborn calf on a frozen pond. Pip cheered anyway, loudly enough to count as a wave warning.",
      done: "Tomas fits the leg motors into the robot dog one leg at a time. He hums under his breath, which he only does when a job is going well. When the last screw is tight, he steps back and waits. The robot dog stands up, wobbles, considers its options, and sits down again with a click. Tomas laughs and pats its metal head. “That is a start,” he says. “Everything worth building starts out wobbly. So did I.” The robot dog tilts its head at him, as if it is not entirely sure that was a compliment.",
      after: "Tomas says Bolt-model dogs were built to copy Koen's first robot dog, Bolt. Bolt went everywhere Koen went, even to Mira-9, where it trotted along the soft roads as though it had paid for them. Tomas studies the robot dog by the van for a long moment, the way he studies an engine before he takes it apart. He wants this one to go everywhere you go, through every door and down every road. “Out there,” Tomas says, “you could use a friend who does not get tired.”",
    },
    "tomas-leo-2": {
      title: "Jar with a nose sensor",
      brief: "Tomas says the robot dog needs a nose, which is really a tiny chemistry sensor that tells what something is made of. Greenhouse Row used one to test the soil, back when the greenhouses fed half the town and the gardeners argued about compost like it was politics. Sensors look so boring that nobody bothers to steal them, Tomas says, which makes them the great survivors of the Fall.\n\nGreenhouse Row is west of the cabin. The sensor is sealed in a glass jar with a red lid. Look on the floor by the beehives, and move slowly there, because the bees have opinions. Tomas will give you 30 scrap and 1 box of engine parts.",
      tag: "A glass jar with a red lid. Inside is a small silver sensor on a wire, coiled like a sleeping snail. The paper label says: soil tester, do not open in the rain. Somebody underlined the rain part twice.",
      journal: "You brought Tomas the nose sensor from Greenhouse Row. He spent the evening teaching the robot dog to sniff the van's fuel line. The van passed its inspection, narrowly, and has been sulking in the yard ever since.",
      done: "Tomas clicks the sensor into the robot dog's nose and holds his breath. The robot dog lifts its head and sniffs the air, slow and deliberate, like a chef tasting a sauce that might be ruined. Then it beeps twice, crisp and bright. Tomas grins from ear to ear and explains that two beeps mean yes, the same as Bolt's did. Pip immediately wants to know what it said yes to. “Everything, I hope,” Tomas says, and polishes the new nose with his sleeve until it gleams.",
      after: "Tomas says Bolt's nose was a chemistry tester too. On Mira-9, Bolt sniffed the soft roads and found out they were grown, like coral, when everyone else had assumed somebody built them. It was the first real discovery anyone made there, and it came from a dog. Tomas taps the robot dog's new nose with one finger, almost tenderly. “A good nose is worth more than a good gun,” he says. “A gun only helps once trouble has already arrived. A nose tells you it is on the way.”",
    },
    "tomas-leo-3": {
      title: "Tin with a battery cell",
      brief: "Tomas says the robot dog's battery is nearly drained, and only a Bolt-model cell fits it. He has tried three other batteries, and none of them clicked in, despite some fairly creative persuasion. It wakes for a minute, then slumps, and Tomas has stubbed his toe on it twice.\n\nSignal Electronics is north of the cabin. A red tin with a white paper band lies on the floor beside the robot. The battery cell is inside it, and the tin is heavier than it looks, so carry it with both hands. Electronics shops are full of things that fall and clatter, Tomas adds, so mind your elbows. Tomas will give you 35 scrap and 1 box of radio parts.",
      tag: "A red tin with a white paper band. Inside, a heavy battery cell hums softly, like a cat purring two rooms away. Someone wrote on the band in careful capitals: fully charged, keep dry.",
      journal: "You brought Tomas a battery cell from Signal Electronics. The robot dog's eyes glowed blue for the first time, then went dark again. Tomas insists this is perfectly normal. I have decided, for the sake of my sleep, to believe him.",
      done: "Tomas snaps the battery cell into the robot dog's chest. For a long moment nothing happens, and the yard is so quiet you can hear the stove ticking inside the cabin. Then its eyes glow blue, and its metal tail wags once against the floor. Pip gasps out loud. The light fades again, slowly, like a lamp turned down for the night, but Tomas is smiling. “It knows it is awake now,” he says. “It simply has not decided what to do about it yet.”",
      after: "Tomas says the robot dog still has no memory. It does not know who its friends are, or even its own name, which strikes Tomas as the saddest kind of broken. A school's old Bolt-model dog would have a memory, he says, tucked safely behind its gold star badge. Every school dog wore one, like a small, serious sheriff, and the kids saluted it in the halls. Tomas taps the empty spot on the robot dog's collar. “Find me a badge,” he says, “and it will finally know us.”",
    },
    "tomas-leo-4": {
      title: "Gold star badge",
      brief: "Tomas says every school's robot dog wore a gold star badge with its memory chip behind it. Without one, the robot dog cannot learn our faces, so it greets everyone with the same polite suspicion. Kids used to pat the badge for luck before big tests, Tomas says, so it is probably worn smooth. Worn is fine. Worn means loved. School halls echo terribly, though, so keep your steps soft and your eyes on the corners.\n\nLincoln Middle School is northeast of the cabin. The badge lies by the basketball hoop, on a black leather fold. It is a gold shield with a star. Tomas will give you 45 scrap and 1 tool kit.",
      tag: "A gold shield badge with a star, on a black leather fold rubbed soft by years of small hands. On the back: Lincoln Lions robot dog, sniffs the air pipes every Monday.",
      journal: "You brought Tomas the school robot dog's gold star badge. Tomas and Pip stayed up late teaching the robot dog all our names. It beeps twice whenever it hears mine, which Pip claims is a laugh. I am choosing not to take that personally.",
      done: "Tomas moves the memory chip from behind the badge into the robot dog, working with the slow precision of a watchmaker. He closes the panel and waits. The robot dog turns its head and looks at each of you, one face at a time, as if committing every detail to memory. Then it beeps, once, softly, the way someone says hello across a crowded room. Tomas lets out a long breath he did not know he was holding. “It remembers being a school dog,” he says. “Now it can remember us too.”",
      after: "Tomas says the robot dog knows our faces now. It follows him from the van to the porch and back again like a devoted shadow, and it waits outside the door whenever he goes in. But it still needs eyes that see in the dark, and a voice to beep at us. Out there, the dark is where trouble prefers to wait, and two bright eyes beside you are worth more than a lantern. Once it has both, Tomas says, it can go out with you, and you will not be alone.",
    },
    "tomas-leo-5": {
      title: "Toolbox of robot-dog parts",
      brief: "Tomas says the toy store at Northgate Mall sold spare parts for robot dogs, such as eye lights and voice chips. Its customers were kids who took their robot dogs very seriously, and Tomas respects that.\n\nNorthgate Mall is northeast of the cabin. A red steel toolbox of those parts lies by the green dino. With them the robot dog can see in the dark, zap walkers and come with you. This is the last piece, Tomas says, and he has saved the hardest trip for the end, which he admits is poor planning. The mall is cavernous and full of echoes, so every footstep there sounds twice and carries far. Go carefully, keep your ears open, and come home. Tomas will give you 60 scrap.",
      tag: "A red steel toolbox with one dented corner. Inside are two blue eye lights and a small voice chip, nested in foam like eggs. A sticker on the lid says: Toy Town, robot dog repairs.",
      journal: "You brought Tomas the last parts for the robot dog, and Tomas named it Rivet. Rivet followed you around the yard all evening, beeping like a contented kettle. Nobody complained about the noise, not even me, and I complain about most noises.",
      done: "Tomas fits the eye lights and the voice chip, and the robot dog wakes up for good. Tomas names it Rivet, because it is held together with them. Rivet follows you in the yard and inside buildings, and it rides along in the van. It zaps walkers near it, which slows them, but it is no gun, so you will still do most of the fighting yourself. If walkers bite it too much, it shuts down, sparking and going dark. Tomas fixes it at home for 20 scrap.",
      after: "Tomas says Koen would be proud of Rivet. Tomas has read about Koen in old school books more times than he can count, until the pages went soft as cloth. Koen once wrote that a robot is only as good as the friend who fixes it. Tomas pats Rivet's dented head, right where a real dog would like it. He says he will always fix Rivet, no matter how many times it breaks, because that is the whole job. Rivet beeps twice, which means yes.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
