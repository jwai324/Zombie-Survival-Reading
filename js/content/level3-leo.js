/* Reading level 3: the Captain Leo (Mira-8) crossover universe. June's ledger lines and the radio (T.universe.leo), and the
   crew's words for this universe's topics and quests (merged into T.crew). Facts: js/story-leo.js.
   Design: docs/UNIVERSES.md; rules for the words: docs/TEXT_GUIDE.md. Shown only while Settings: Universe is on. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[3] = root.ZSR.TEXT[3] || { level: 3 });
  T.universe = T.universe || {};
  T.crew = T.crew || {};

  T.universe.leo = {
    // June's ledger: a few lines under the day's page, one per WORLD.UNIVERSES.leo.journal entry, in order
    journal: [
      {
        title: "The Second Moon",
        text: "Mira-9 rose over the trees tonight, huge and pale, its white clouds turning slowly. Everyone on Mira-8 grows up under it, so most of us forget to look. Pip did not forget. Pip asked if anyone still lives up there. I said yes: the Mirans, the cloud-people. But that is a story for another night. — June",
      },
      {
        title: "Founders' Day",
        text: "My calendar says today would have been Founders' Day. Every year the town ate cake and told the same old story. It was about Captain Leo and Co-captain Camila, the first kids to reach Mira-9. That was about two hundred years ago. Nobody baked a cake this year, but Pip told the story anyway. — June",
      },
      {
        title: "Why Only Kids Came",
        text: "Tomas asked why everyone who came to Mira-8 came as a kid. I told him about the Skip Drive, which folds space like paper. It only works on bodies that are still growing, so only kids ride it. I was ten when I rode it, with one bag and one photo. — June",
      },
      {
        title: "The Gray",
        text: "I wrote down the town's name for the sickness across the river: the Gray. Long ago, Mira-8 had a sky forest like the one on Mira-9. It died before the first kids came. Miners across the river dug deep and brought up what was left. The Mirans had warned the town not to dig there. — June",
      },
      {
        title: "The Seed Jar",
        text: "I turned the jar on the windowsill toward the light this morning. Inside is a cloud-tree seed from Mira-9. It was given to my grandmother when she was a girl. It has never sprouted, because nobody knows the right air for it. I water it anyway. Gardeners are stubborn people. — June",
      },
      {
        title: "The Come Back Knock",
        text: "I remember the old radios in town picking up three soft notes from Mira-9. They sounded like a knock on a door. The town called it the Come Back Knock. Before that, the Mirans spent many years counting: one, two, three, up to ten. — June",
      },
      {
        title: "Koen and Bolt",
        text: "Tomas fixed the porch step today and talked about Koen the whole time. Koen was the builder on Captain Leo's crew. He built Bolt, a robot dog of bolts and wire. Bolt went everywhere Koen went. Every school on Mira-8 kept a Bolt-model to sniff the air pipes for leaks. — June",
      },
      {
        title: "Three Misty Fingers",
        text: "I read Pip the last page of Captain Leo and Co-captain Camila's mission report. At the end, Sool the Miran waves goodbye with three misty fingers. Mirans live a very long time, so Sool may still be up there. Pip waved at the sky, just in case. — June",
      },
    ],
    // the radio: one per WORLD.UNIVERSES.leo.radio entry, in order; each names its speaker
    radio: [
      {
        title: "Jo and the Knock",
        text: "Before Jo's show, three soft notes came through the static: knock, knock, knock. Then Jo came on, sounding pleased. “The old folks call that the Come Back Knock,” Jo said. “It comes from Mira-9. It came every few days before the Fall, too. So here is what it means. If you hear it, you are not alone.”",
      },
      {
        title: "A Voice Like Wind",
        text: "After the knock, a soft voice came on, like wind moving through tall grass. “Hello. I am Sool. We hear you.” Sool said the Mirans are watching Mira-8 from their clouds. Sool's English was short and simple, but clear. Then Sool said one more thing. “Do not dig. Stay together.”",
      },
      {
        title: "Jo Reads from History",
        text: "Jo read from an old school book about the first mission. Captain Leo and five other kids flew the ship Skip-One to Mira-9. There they met the Mirans. The Mirans breathe methane, and their trees float in the clouds. Before anyone came, the Mirans counted on the radio for years. “Imagine counting that long,” Jo said, “and still hoping.”",
      },
      {
        title: "What Is Gray",
        text: "After the knock, Sool spoke again. Sool said Mira-8 once had a sky-forest too, like the one on Mira-9. It went gray and quiet long before the first kids came. Then Sool said, slowly, “What is gray, leave sleeping.” After that there was only static.",
      },
      {
        title: "Jo and the Robot Dog",
        text: "Jo here, with a strange one. Someone saw a robot dog on the river road. It was limping, with one blue eye blinking. It looked like an old Bolt-model, the kind every school kept. So here is my ask. If you know how to fix one, keep your toolbox handy.",
      },
      {
        title: "Are You Warm?",
        text: "Sool came on the radio again, asking about the kids of Mira-8. “Are you eating? Are you warm?” Sool said Captain Leo had promised the Mirans he would come back. He kept that promise, many times. Then Sool said something new. “Kids first. Kids are bravest.”",
      },
      {
        title: "Jo Knocks Back",
        text: "Jo played the knock back on the air: three notes, sent into the dark. No answer came that night. “Do not worry,” Jo said. “The Mirans are patient. They counted for many years before anyone answered them. We can be patient too.”",
      },
      {
        title: "The Cloud-Tree Song",
        text: "Sool hummed the cloud-tree song tonight, slow, with long notes that rose and fell. Then Sool said, “We wait. We are friends.” The knock came again, three soft notes, and then the radio went quiet. Pip left it on all night anyway.",
      },
    ],
  };

  T.crew.talk = Object.assign(T.crew.talk || {}, {
    "june-leo-t1": {
      title: "A Garden Nobody Planted",
      text: "June came to Mira-8 on the Skip Drive when she was ten years old. She brought one bag and one photo, a picture of her mother's garden. June planted her first seeds on Mira-8 the week she landed. “A new world is just a garden nobody has planted yet,” she says. June says the Garden room grows 1 food a day at its first level. Each new level grows more.",
    },
    "june-leo-t2": {
      title: "Waiting for the Right Air",
      text: "June keeps a cloud-tree seed from Mira-9 in a jar on the windowsill. Long ago, a Miran named Sool gave seeds like it to Captain Leo's crew. On Mira-9, the cloud-trees float in the sky. They breathe in carbon dioxide and breathe out methane. “The seed is waiting for the right air,” June says, “and so am I.” Once the Lab room is built, she adds, it makes medical kits over time.",
    },
    "tomas-leo-t1": {
      title: "Koen and the Ship's Lights",
      text: "Tomas says Koen is the reason he learned to fix things. Koen was the builder on Captain Leo's crew. Koen built Bolt, a robot dog of bolts and wire. Once he fixed a ship's lights with Bolt holding the other wire. Tomas's father kept a picture of Koen over his workbench. Tomas says the Garage room lets him fix the van for free.",
    },
    "tomas-leo-t2": {
      title: "Robot Dogs in the Schools",
      text: "Tomas says every school on Mira-8 had a Bolt-model robot dog. It sniffed the air pipes for leaks. Most shut down in the Fall, but their parts are still out there. He says a Bolt-model's nose is really a tiny chemistry kit. Then Tomas adds something useful. The things you take from a shelf in town come back after 3 days.",
    },
    "pip-leo-t1": {
      title: "Named After PIP",
      text: "Pip was named after PIP, the helper voice on the ship Skip-One. PIP talked Captain Leo's crew all the way to Mira-9 and home again. Pip likes that PIP always had an answer and never panicked, not even once. Pip says the Radio room finds new places for the map.",
    },
    "pip-leo-t2": {
      title: "Knocking Back",
      text: "Pip wants to knock back one day, sending three notes to Mira-9. The first Mirans counted on the radio for years, hoping someone would answer. Pip says a knock with no answer is the loneliest sound there is. Once the Radio room is built, the knock comes every few days.",
    },
  });

  T.crew.quests = Object.assign(T.crew.quests || {}, {
    "tomas-leo-1": {
      title: "Box of leg motors",
      brief:
        "Tomas found a shut-down Bolt-model robot dog by the back fence. “I want to wake it up,” he says. First it needs new leg motors. Reyes Hardware is northeast of the cabin. A box of leg motors sits on the floor beside the riding mower. It is a cardboard box with a red label. Tomas will give you 25 scrap and 1 spool of wire.",
      tag: "A cardboard box of four small leg motors, each wrapped in paper. The red label says: for school robot dogs, Bolt-model.",
      journal: "You brought Tomas a box of leg motors from Reyes Hardware. The robot dog by the van can stand now, though it wobbles.",
      done: "Tomas fits the leg motors into the robot dog, one leg at a time. It stands up, wobbles, and sits down again with a click. “Well, it is a start,” Tomas says. He wipes his hands on his red rag and thanks you.",
      after:
        "Tomas says Bolt-model dogs were built to copy Koen's first robot dog, Bolt. Bolt went everywhere Koen went, even to Mira-9. Tomas looks at the robot dog sitting by the van. He wants this one to go everywhere you go.",
    },
    "tomas-leo-2": {
      title: "Jar with a nose sensor",
      brief:
        "The robot dog needs a nose, Tomas says. That means a tiny chemistry sensor that tells what something is made of. Greenhouse Row used one to test the soil. Greenhouse Row is west of the cabin. The sensor is sealed in a glass jar with a red lid. The jar sits on the floor by the beehives. Tomas will give you 30 scrap and 1 box of engine parts.",
      tag: "A glass jar with a red lid. Inside is a small silver sensor on a wire. The paper label says: soil tester, do not open in the rain.",
      journal: "You brought Tomas the nose sensor from Greenhouse Row. He spent the evening teaching the robot dog to sniff the van's fuel line.",
      done: "Tomas clicks the sensor into the robot dog's nose. It sniffs the air and beeps twice. “Two beeps means yes,” Tomas says, grinning. “It likes its new nose.” Then it sniffs Tomas's boots and beeps twice more. He thanks you and goes back to work.",
      after:
        "Tomas says Bolt's nose was a chemistry tester too. On Mira-9, Bolt sniffed the soft roads. Bolt found out the roads were grown, like coral. “A good nose is worth more than a good gun,” Tomas says. He taps the robot dog's new nose.",
    },
    "tomas-leo-3": {
      title: "Tin with a battery cell",
      brief:
        "The robot dog's battery is nearly flat, Tomas says. Only a Bolt-model cell will fit it. Signal Electronics is north of the cabin. A red tin lies on the floor beside the robot. It has a white paper band, and the battery cell is inside. Tomas will give you 35 scrap and 1 box of radio parts.",
      tag: "A red tin with a white paper band. Inside, a heavy battery cell hums softly. Someone wrote on the band: fully charged, keep dry.",
      journal: "You brought Tomas a battery cell from Signal Electronics. The robot dog's eyes glowed blue for the first time, then went dark again.",
      done: "Tomas snaps the battery cell into the robot dog. Its eyes glow blue for a moment, and its metal tail wags once. Tomas laughs out loud. “Did you see that?” he says. Then the blue fades, but Tomas does not stop smiling. He thanks you twice.",
      after:
        "Tomas says the robot dog still has no memory. It does not know who its friends are. Right now it beeps at the van and the woodstove the same way. A school's old Bolt-model dog would have one, behind its gold star badge. “A dog should know its friends,” Tomas says.",
    },
    "tomas-leo-4": {
      title: "Gold star badge",
      brief:
        "Tomas says every school's robot dog wore a gold star badge. Its memory chip was behind the badge. Lincoln Middle School is northeast of the cabin. The badge lies by the basketball hoop, on a black leather fold. It is a gold shield with a star. Tomas will give you 45 scrap and 1 tool kit.",
      tag: "A gold shield badge with a star, on a black leather fold. On the back: Lincoln Lions robot dog, sniffs the air pipes every Monday.",
      journal: "You brought Tomas the school robot dog's gold star badge. Tomas and Pip stayed up late teaching the robot dog all our names.",
      done: "Tomas moves the memory chip from the badge into the robot dog. It turns its head and looks at each of you, one at a time. Then it beeps, soft and happy. “It knows us,” Tomas says quietly, and he thanks you.",
      after:
        "Tomas says the robot dog knows our faces now. It still needs eyes for the dark, and a voice to beep at us. Tomas already has a plan for both. “Then it can go out with you,” Tomas says, “and watch your back.”",
    },
    "tomas-leo-5": {
      title: "Toolbox of robot-dog parts",
      brief:
        "The toy store at Northgate Mall sold spare parts for robot dogs. It had eye lights and voice chips, Tomas says. Northgate Mall is northeast of the cabin. A red steel toolbox of those parts lies by the green dino. With them, the robot dog can see in the dark. It can zap walkers and come with you. Tomas will give you 60 scrap.",
      tag: "A red steel toolbox. Inside are two blue eye lights and a small voice chip. A sticker on the lid says: Toy Town, robot dog repairs.",
      journal: "You brought Tomas the robot dog's last parts, and Tomas named it Rivet. Rivet followed you around the yard all evening, beeping.",
      done: "Tomas fits the eye lights and the voice chip. The robot dog wakes up for good. Tomas names it Rivet, because it is held together with them. Rivet follows you in the yard and inside buildings. It rides along in the van too. It zaps walkers near it, which slows them, but it is no gun. If walkers bite it too much, it shuts down. Tomas fixes it at home for 20 scrap.",
      after:
        "Tomas says Koen would be proud of Rivet. Koen once wrote something Tomas knows by heart. A robot is only as good as the friend who fixes it. “I will always fix Rivet,” Tomas says, “no matter how many times.” Rivet's tail wags, as if it understands.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
