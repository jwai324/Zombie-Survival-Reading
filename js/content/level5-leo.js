/* Reading level 5: the Captain Leo (Mira-8) crossover universe. June's ledger lines and the radio (T.universe.leo), and the
   crew's words for this universe's topics and quests (merged into T.crew). Facts: js/story-leo.js.
   Design: docs/UNIVERSES.md; rules for the words: docs/TEXT_GUIDE.md. Shown only while Settings: Universe is on.
   Level 5: sentences of 22 words or fewer, figurative language, cause and effect. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[5] = root.ZSR.TEXT[5] || { level: 5 });
  T.universe = T.universe || {};
  T.crew = T.crew || {};

  T.universe.leo = {
    /* June's ledger: a few lines under the day's page, June writing */
    journal: [
      {
        title: "The Second Moon",
        text: "Mira-9 rose over the trees tonight, huge and pale, its white clouds turning as slowly as cream stirred into coffee. Everyone on Mira-8 grows up under it, so most of us stopped looking years ago. Pip has not stopped. “June, does anyone still live up there?” Yes, I said: the Mirans, the cloud-people. But that is a story for another night, and a longer candle.",
      },
      {
        title: "Founders' Day",
        text: "The calendar on my wall says today would have been Founders' Day. Every year the town ate cake and told the story of Captain Leo and Co-captain Camila. They were the first kids to reach Mira-9, about two hundred years ago. Nobody baked a cake this year, because there was no flour and no oven worth the name. “June, the story does not need cake,” Pip said, and told it anyway, every word.",
      },
      {
        title: "Why Only Kids",
        text: "Tomas asked me tonight, “June, why did everyone who came to Mira-8 come as a kid?” So I told him about the Skip Drive, which folds space like a sheet of paper. It only works on bodies that are still growing, so only kids can ride it. I rode it when I was ten years old, with one bag and one photo. The bag is long gone. The photo is not.",
      },
      {
        title: "The Gray",
        text: "“June, what does the town call it?” Tomas asked, meaning the sickness across the river. The Gray, I said, and wrote the word down so it would stop rattling around in my head. Long ago Mira-8 had a forest in the sky, like the one on Mira-9. It died before the first kids ever came. The miners across the river dug deep and brought up what was left of it. The Mirans had warned the town not to dig there.",
      },
      {
        title: "The Jar on the Sill",
        text: "This morning I turned the jar on the windowsill toward the light, the way you turn a sleeping child toward the sun. It holds a cloud-tree seed from Mira-9, given to my grandmother when she was a girl. It has never sprouted, because nobody knows the right air for it. I water it anyway. “June, why bother?” Pip asked. Because hope needs chores, I said.",
      },
      {
        title: "The Come Back Knock",
        text: "I remember the old radios in town picking up three soft notes from Mira-9. It sounded like a knock on a door, so the town called it the Come Back Knock. Before the Mirans ever knocked, they spent many years sending numbers: one, two, three, up to ten, over and over. Pip asked me, “June, how long is many years?” Longer than most people would wait, I said, which was the point.",
      },
      {
        title: "Koen's Dog",
        text: "Tomas fixed the porch step today and talked the whole time about Koen, the builder on Captain Leo's crew. Koen built Bolt, a robot dog made of bolts and wire, and Bolt went everywhere he went. Every school on Mira-8 kept a Bolt-model robot dog to sniff the air pipes for leaks. The step is as solid as a promise now. Tomas says Koen would have approved of the nails.",
      },
      {
        title: "Three Misty Fingers",
        text: "Tonight I read Pip the last page of the mission report written by Captain Leo and Co-captain Camila. At the end, Sool, the Miran, waved goodbye with three misty fingers. Mirans live a very long time, so Sool may still be up there, two hundred years older and still waving. “June, really?” Pip asked. Then Pip went to the window and waved at the sky, just in case.",
      },
    ],
    /* The radio: the knock, Jo and a Miran voice (Sool). Each names its speaker. */
    radio: [
      {
        title: "Jo and the Knock",
        text: "Before Jo's show tonight, three soft notes slipped through the static like someone tapping on glass: knock, knock, knock. Then Jo came on, sounding wide awake.\n\n“Did you catch that? The old folks call it the Come Back Knock, and it comes from Mira-9, all the way across the sky. It came every few days before the Fall too, as regular as rain. So here is what I want you to hold on to. If you hear it, you are not alone. Jo out.”",
      },
      {
        title: "A Voice Called Sool",
        text: "After the knock, a different voice came on, soft as wind moving through tall grass. It was not Jo, and it was not anyone from town.\n\n“Hello. I am Sool. We hear you.”\n\nThe words came slowly, as if each one had been carried a long way. Sool said the Mirans are watching Mira-8 from their clouds. Then Sool said one more thing, carefully, the way you hand someone a full cup.\n\n“Do not dig. Stay together.”\n\nAfter that, only static.",
      },
      {
        title: "Jo Reads a School Book",
        text: "This is Jo on 88.1. Tonight I am reading from an old school book about the first mission. Half of you had this one in class, cracked spine and all.\n\nCaptain Leo and five other kids flew the ship Skip-One to Mira-9, and there they met the Mirans. The Mirans breathe methane, and their trees float in the clouds like islands. But here is my favorite part. The Mirans counted on the radio for years before anyone came. Nobody answered, and they kept counting anyway. Jo out.",
      },
      {
        title: "Sool on the Gray",
        text: "The knock came first, and then Sool's slow, soft voice, like breath on a cold window.\n\nSool said Mira-8 once had a sky-forest too, like the one on Mira-9. It went gray and quiet long before the first kids came. Then the voice paused for so long that the static seemed to be listening along with us.\n\n“What is gray, leave sleeping.”\n\nSool said nothing more, and the radio hissed until morning. Nobody at the cabin slept much either.",
      },
      {
        title: "Jo: A Dog on the Road",
        text: "Jo here, with a strange one tonight. Somebody saw a robot dog on the river road. It was limping badly, and one blue eye kept blinking on and off like a porch light with a loose bulb. From the description, it looked like an old Bolt-model, the kind every school kept.\n\nSo here is my request. If you know how to fix one of those, keep your toolbox handy. A dog like that should not be wandering out there alone. Jo out.",
      },
      {
        title: "Sool Asks About Us",
        text: "After the knock, Sool spoke again, slowly, as if choosing each word from a shelf.\n\n“Are you eating? Are you warm?”\n\nSool was asking about the kids of Mira-8. Then Sool told a story the Mirans have never forgotten. Long ago, Captain Leo promised them he would come back. And he did, not once but many times, so the Mirans learned to trust a promise from a kid. Sool ended with words that sounded like a rule.\n\n“Kids first. Kids are bravest.”",
      },
      {
        title: "Jo Knocks Back",
        text: "Tonight Jo tried something new. Jo played the knock back on the air: three notes, slow and clear, like a neighbor at the door after a storm. Then the station went silent, and everyone listening held still and waited.\n\nNo answer came that night. Jo did not sound discouraged, though.\n\n“The Mirans are patient,” Jo said. “They counted for many years before anyone answered them. We can wait a few nights. Jo out.”",
      },
      {
        title: "Sool's Song",
        text: "Sool did not say much tonight. Instead, Sool hummed the cloud-tree song, slow, with long notes that rose and fell like a chest breathing in sleep. Nobody at the cabin moved to turn it down, and Pip stopped whittling to listen. Even the fire seemed to burn more quietly. Then Sool spoke, very softly.\n\n“We wait. We are friends.”\n\nAfter that, the knock came again, three soft notes, and the radio went quiet.",
      },
    ],
  };

  T.crew.talk = Object.assign(T.crew.talk || {}, {
    "june-leo-t1": {
      title: "A Garden Nobody Planted",
      text: "June came to Mira-8 on the Skip Drive when she was ten years old. She brought one bag and one photo of her mother's garden, and she remembers holding the photo the whole way. She planted her first seeds on Mira-8 the week she landed, in a borrowed pot. “A new world is just a garden nobody has planted yet,” June says. Then she turns practical. The Garden room grows 1 food a day at its first level, and more as it grows.",
    },
    "june-leo-t2": {
      title: "A Seed in a Jar",
      text: "June keeps a cloud-tree seed from Mira-9 in a jar on the windowsill. Long ago, a Miran named Sool gave seeds like it to Captain Leo's crew. On Mira-9 the cloud-trees float in the sky like anchored balloons. They breathe in carbon dioxide and breathe out methane. “The seed is waiting for the right air,” June says, “and so am I.” Then she offers a tip, because June never talks only about dreams. The Lab room, once it is built, makes medical kits as the days go by.",
    },
    "tomas-leo-t1": {
      title: "Koen, the Builder",
      text: "Tomas says Koen, the builder on Captain Leo's crew, is the reason he learned to fix things. Koen built Bolt, a robot dog of bolts and wire. Once, Koen fixed a ship's lights with Bolt holding the other wire, which Tomas calls the bravest repair in history. Tomas's father kept a picture of Koen over his workbench, so Tomas grew up under that steady gaze. “Here is a builder's tip,” Tomas says. “The Garage room lets me fix the van for free.”",
    },
    "tomas-leo-t2": {
      title: "Every School's Dog",
      text: "Tomas says every school on Mira-8 had a Bolt-model robot dog to sniff the air pipes for leaks. Most of them shut down in the Fall, he says, but their parts are still out there, scattered like puzzle pieces. A Bolt-model's nose is really a tiny chemistry kit, and that impresses Tomas more than any engine. Then he adds a scavenger's tip, since he hates wasted trips. The things you take from a shelf in town come back after 3 days.",
    },
    "pip-leo-t1": {
      title: "Named After PIP",
      text: "Pip was named after PIP, the helper voice on the ship Skip-One. PIP talked Captain Leo's crew all the way to Mira-9 and home again, across a gap of space nobody had crossed before. Pip likes that PIP always had an answer and never panicked. “That is the goal,” Pip says, “even if I panic a little on the way.” Pip has a useful answer of their own, too. The Radio room finds new places for the map.",
    },
    "pip-leo-t2": {
      title: "Knocking Back",
      text: "Pip wants to knock back one day: three notes, sent all the way to Mira-9. The first Mirans counted on the radio for years, hoping someone would answer. Pip thinks about that a lot, usually late at night. “A knock with no answer is the loneliest sound there is,” Pip says. So Pip practices the rhythm on the cabin wall with two knuckles. Once the Radio room is built, Pip adds, the knock comes on the radio every few days.",
    },
  });

  T.crew.quests = Object.assign(T.crew.quests || {}, {
    "tomas-leo-1": {
      title: "Box of leg motors",
      brief: "Tomas found a shut-down Bolt-model robot dog by the back fence, and he wants to wake it up. It is dented and caked with dust, but Tomas says the frame is as sound as a church bell. First it needs new leg motors, because the old ones are rusted solid.\n\nReyes Hardware is northeast of the cabin. A box of leg motors sits on the floor beside the riding mower. It is a cardboard box with a red label. Tomas will give you 25 scrap and 1 spool of wire.",
      tag: "A cardboard box of four small leg motors, each one wrapped in paper like a gift. The red label says: for school robot dogs, Bolt-model. They rattle softly when you lift the box.",
      journal: "You brought Tomas a box of leg motors from Reyes Hardware. The robot dog by the van can stand now, though it wobbles like a newborn calf on ice. Pip cheered anyway, loudly.",
      done: "Tomas fits the leg motors into the robot dog one leg at a time. He hums under his breath, the way he does when a job is going well. When the last screw is tight, he steps back and waits. The robot dog stands up, wobbles, and sits down again with a click. Tomas laughs and pats its metal head. “That is a start,” he says. “Everything good starts out wobbly.”",
      after: "Tomas says Bolt-model dogs were built to copy Koen's first robot dog, Bolt. Bolt went everywhere Koen went, even to Mira-9, where it trotted along the soft roads as if it owned them. Tomas looks at the robot dog by the van for a long moment. It is the way he looks at an engine he is about to rebuild. He wants this one to go everywhere you go. “Out there,” Tomas says, “you could use a friend.”",
    },
    "tomas-leo-2": {
      title: "Jar with a nose sensor",
      brief: "Tomas says the robot dog needs a nose, which is really a tiny chemistry sensor that tells what something is made of. Greenhouse Row used one to test the soil. So there should still be one there, as long as nobody mistook it for junk. Tomas says sensors look boring, which is why they survive.\n\nGreenhouse Row is west of the cabin. The sensor is sealed in a glass jar with a red lid. Look on the floor by the beehives, and move slowly there. Tomas will give you 30 scrap and 1 box of engine parts.",
      tag: "A glass jar with a red lid. Inside is a small silver sensor on a wire, curled like a sleeping snail. The paper label says: soil tester, do not open in the rain.",
      journal: "You brought Tomas the nose sensor from Greenhouse Row. He spent the evening teaching the robot dog to sniff the van's fuel line. The van passed its test, barely, and sulked afterward.",
      done: "Tomas clicks the sensor into the robot dog's nose and holds his breath. The robot dog lifts its head and sniffs the air, slow and careful, like a cook tasting soup. Then it beeps twice. Tomas grins from ear to ear and explains that two beeps mean yes. Pip wants to know what it said yes to. “Everything, I hope,” Tomas says, and polishes the new nose with his sleeve until it shines.",
      after: "Tomas says Bolt's nose was a chemistry tester too. On Mira-9, Bolt sniffed the soft roads and found out they were grown, like coral, when everyone else assumed they were built. Tomas taps the robot dog's new nose with one finger, almost fondly. “A good nose is worth more than a good gun,” he says. “A gun only helps once trouble is already here. A nose tells you it is coming.”",
    },
    "tomas-leo-3": {
      title: "Tin with a battery cell",
      brief: "Tomas says the robot dog's battery is completely drained, and only a Bolt-model cell fits it. He tried three other batteries, and none of them clicked in, no matter how politely he asked. Without power, the robot dog is just a very heavy statue, and Tomas has stubbed his toe on it twice.\n\nSignal Electronics is north of the cabin. A red tin with a white paper band lies on the floor beside the robot. The battery cell is inside it. Tomas will give you 35 scrap and 1 box of radio parts.",
      tag: "A red tin with a white paper band. Inside, a heavy battery cell hums softly, like a cat purring in another room. Someone wrote on the band: fully charged, keep dry.",
      journal: "You brought Tomas a battery cell from Signal Electronics. The robot dog's eyes glowed blue for the first time, then went dark again. Tomas insists that is perfectly normal. I am choosing to believe him.",
      done: "Tomas snaps the battery cell into the robot dog's chest. For a long moment nothing happens, and the yard is so quiet you can hear the stove ticking indoors. Then its eyes glow blue, and its metal tail wags once against the floor. Pip gasps out loud. The light fades again, but Tomas is smiling. “It knows it is awake now,” he says. “It just has not decided what to do about it.”",
      after: "Tomas says the robot dog still has no memory. It does not know who its friends are, or even its own name. A school's old Bolt-model dog would have a memory, he says, tucked safely behind its gold star badge. Every school dog wore one, like a sheriff. Tomas taps the empty spot on the robot dog's collar. “Find me a badge,” he says, “and it will finally know us.”",
    },
    "tomas-leo-4": {
      title: "Gold star badge",
      brief: "Tomas says every school's robot dog wore a gold star badge with its memory chip behind it. Without one, the robot dog cannot learn our faces, so it treats everyone like a stranger. He says kids used to pat the badge for luck before big tests, so it may be a little worn. Tomas does not mind worn. Worn means loved.\n\nLincoln Middle School is northeast of the cabin. The badge lies by the basketball hoop, on a black leather fold. It is a gold shield with a star. Tomas will give you 45 scrap and 1 tool kit.",
      tag: "A gold shield badge with a star, on a black leather fold worn soft by small hands. On the back: Lincoln Lions robot dog, sniffs the air pipes every Monday.",
      journal: "You brought Tomas the school robot dog's gold star badge. Tomas and Pip stayed up late teaching the robot dog all our names. It beeps twice whenever it hears mine, which Pip says is a laugh.",
      done: "Tomas moves the memory chip from behind the badge into the robot dog, working as carefully as a surgeon. He closes the panel and waits. The robot dog turns its head and looks at each of you, one face at a time, as if taking a photograph. Then it beeps. Tomas lets out a long breath. “It remembers being a school dog,” he says. “Now it can remember us too.”",
      after: "Tomas says the robot dog knows our faces now. It follows him from the van to the porch and back again like a shadow. It even waits by the door when he goes inside. But it still needs eyes that see in the dark, and a voice to beep at us. Out there, the dark is where trouble likes to wait. Once it has both, Tomas says, it can go out with you, and you will not be alone.",
    },
    "tomas-leo-5": {
      title: "Toolbox of robot-dog parts",
      brief: "Tomas says the toy store at Northgate Mall sold spare parts for robot dogs, such as eye lights and voice chips.\n\nNorthgate Mall is northeast of the cabin. A red steel toolbox of those parts lies by the green dino. With them the robot dog can see in the dark, zap walkers and come with you. The mall is huge and full of echoes, so every footstep there sounds twice. Go carefully, keep your ears open, and come home. Tomas will not start the last repair without you. Tomas will give you 60 scrap.",
      tag: "A red steel toolbox with a dented corner. Inside are two blue eye lights and a small voice chip, packed in foam. A sticker on the lid says: Toy Town, robot dog repairs.",
      journal: "You brought Tomas the last parts for the robot dog, and Tomas named it Rivet. Rivet followed you around the yard all evening, beeping like a happy kettle. Nobody minded the noise, not even me.",
      done: "Tomas fits the eye lights and the voice chip, and the robot dog wakes up for good. Tomas names it Rivet, because it is held together with them. Rivet follows you in the yard and inside buildings, and it rides along in the van. It zaps walkers near it, which slows them, but it is no gun, so you still do most of the fighting. If walkers bite it too much, it shuts down, and Tomas fixes it at home for 20 scrap.",
      after: "Tomas says Koen would be proud of Rivet. Tomas has read about Koen in old school books more times than he can count, until the pages went soft. Koen once wrote that a robot is only as good as the friend who fixes it. Tomas pats Rivet's dented head. He says he will always fix Rivet, no matter how many times it breaks, because that is what Koen would do. Rivet beeps twice, which means yes.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
