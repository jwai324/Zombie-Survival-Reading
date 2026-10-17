/* Reading level 1: the Captain Leo (Mira-8) crossover universe. June's ledger lines and the radio (T.universe.leo), and the
   crew's words for this universe's topics and quests (merged into T.crew). Facts: js/story-leo.js.
   Design: docs/UNIVERSES.md; rules for the words: docs/TEXT_GUIDE.md. Shown only while Settings: Universe is on. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[1] = root.ZSR.TEXT[1] || { level: 1 });
  T.universe = T.universe || {};
  T.crew = T.crew || {};

  T.universe.leo = {
    // June's ledger: a few lines under the day's page, one per WORLD.UNIVERSES.leo.journal entry, in order
    journal: [
      {
        title: "The Second Moon",
        text: "Mira-9 rises over the trees, huge and pale. Its white clouds swirl. Everyone on Mira-8 grows up under it. Pip asks if anyone lives up there. I say yes, the Mirans, the cloud-people. That story can wait.\n\n—June",
      },
      {
        title: "Founders' Day",
        text: "My calendar says it is Founders' Day. We always ate cake and told one story. Young Captain Leo and Co-captain Camila reached Mira-9 first. That was two hundred years ago. Nobody bakes, but Pip tells the story.\n\n—June",
      },
      {
        title: "Why Only Kids Came",
        text: "Tomas asks why only kids came to Mira-8. The Skip Drive folds space like paper, I say. It only works on growing bodies. I rode it at ten. I had one bag and one photo.\n\n—June",
      },
      {
        title: "The Gray",
        text: "We call the sickness across the river the Gray. Mira-8 once had a sky forest, like Mira-9. It died before kids came. Miners dug deep and brought it up. The Mirans warned us not to dig there.\n\n—June",
      },
      {
        title: "The Seed Jar",
        text: "I turn the windowsill jar to the light. It holds a cloud-tree seed from Mira-9. My grandmother got it as a girl. It never sprouts. Nobody knows the air it needs. I water it anyway.\n\n—June",
      },
      {
        title: "The Come Back Knock",
        text: "I remember three soft notes from Mira-9. Old town radios picked them up. They sounded like a knock on a door. We called it the Come Back Knock. For years before that, Mirans counted to ten.\n\n—June",
      },
      {
        title: "Koen and Bolt",
        text: "Tomas fixes the porch step and talks about Koen. Koen was Captain Leo's builder. Koen built Bolt from bolts and wire. That robot dog went everywhere with him. Mira-8 schools kept Bolt-models to sniff pipes for leaks.\n\n—June",
      },
      {
        title: "Three Misty Fingers",
        text: "I read Pip a mission report's last page. Captain Leo and Co-captain Camila wrote it. Sool the Miran waves goodbye with three misty fingers. Mirans live long. Sool may be up there. Pip waves, just in case.\n\n—June",
      },
    ],
    // the radio: one per WORLD.UNIVERSES.leo.radio entry, in order; each names its speaker
    radio: [
      {
        title: "Jo and the Knock",
        text: "Before Jo's show, three soft notes come through. They go knock, knock, knock. Then Jo speaks. \"Old folks call that the Come Back Knock. It comes from Mira-9. It came every few days before the Fall too. If you hear it, you are not alone.\"",
      },
      {
        title: "A Voice Called Sool",
        text: "After the knock, a soft voice comes on. It sounds like wind through grass. \"Hello. I am Sool. We hear you.\" Sool says the Mirans watch Mira-8 from their clouds. Then Sool says, \"Do not dig. Stay together.\"",
      },
      {
        title: "Jo Reads a School Book",
        text: "Jo reads a school book about the first mission. Captain Leo and five other kids flew to Mira-9. Their ship was Skip-One. There they met the Mirans. Mirans breathe methane, and their trees float in clouds. Before that, Mirans counted on the radio for years.",
      },
      {
        title: "Sool on the Gray",
        text: "Sool speaks after the knock. Sool says Mira-8 once had a sky forest too. It went gray and quiet long ago. That was before the first kids came. Then Sool says, \"What is gray, leave sleeping.\"",
      },
      {
        title: "Jo Sees a Robot Dog",
        text: "Jo has a strange report. Someone saw a robot dog on the river road. It was limping, with one blue eye blinking. It looked like an old Bolt-model. Every school kept one of those. Jo asks a favor. \"If you can fix one, keep your toolbox handy.\"",
      },
      {
        title: "Sool Asks About Kids",
        text: "Sool is on the radio again. \"Kids of Mira-8, are you eating? Are you warm?\" Captain Leo promised the Mirans he would come back. Sool says he did, many times. Then Sool says, \"Kids first. Kids are bravest.\"",
      },
      {
        title: "Jo Knocks Back",
        text: "Jo plays the knock back on the air. Three notes go out. No answer comes that night. Jo is not worried. \"The Mirans are patient,\" Jo says. \"They counted for many years before anyone answered.\"",
      },
      {
        title: "Sool Hums",
        text: "Sool hums the cloud-tree song. It is slow, with long notes. Then Sool says, \"We wait. We are friends.\" The knock comes again, three soft notes. Then the radio goes quiet.",
      },
    ],
  };

  T.crew.talk = Object.assign(T.crew.talk || {}, {
    "june-leo-t1": {
      title: "One Bag and One Photo",
      text: "June rode the Skip Drive to Mira-8 at ten. She had one bag, one photo. It showed her mother's garden. She planted seeds her first week. June says a new world is an unplanted garden. A new Garden room grows 1 food a day. Each level grows more.",
    },
    "june-leo-t2": {
      title: "The Right Air",
      text: "June keeps a cloud-tree seed in a jar. Sool the Miran gave Captain Leo's crew some. On Mira-9, cloud-trees float in the sky. They breathe carbon dioxide in and methane out. It waits for the right air, June says. So does she. A Lab room makes medical kits.",
    },
    "tomas-leo-t1": {
      title: "Koen the Builder",
      text: "Koen is why Tomas fixes things. Koen was Captain Leo's builder. Bolt was his robot dog of bolts and wire. Koen fixed a ship's lights once. Bolt held the other wire. Tomas's father had Koen's picture over his bench. With a Garage room, Tomas fixes the van free.",
    },
    "tomas-leo-t2": {
      title: "A Dog in Every School",
      text: "Tomas says Mira-8 schools had Bolt-model robot dogs. They sniffed the air pipes for leaks. Most shut down in the Fall. But their parts are still out there. Their noses are tiny chemistry kits. Things taken from town shelves return after 3 days.",
    },
    "pip-leo-t1": {
      title: "Named After PIP",
      text: "Pip was named after PIP. PIP was the helper voice on the ship Skip-One. PIP talked Captain Leo's crew to Mira-9. Then PIP talked them home. Pip likes that PIP always had an answer. PIP never panicked. The Radio room finds new places, Pip says.",
    },
    "pip-leo-t2": {
      title: "Knocking Back",
      text: "Pip wants to knock back one day. Pip would send three notes to Mira-9. The first Mirans counted on the radio for years. They hoped someone would answer. To Pip, an unanswered knock is the loneliest sound. A Radio room hears the knock every few days.",
    },
  });

  T.crew.quests = Object.assign(T.crew.quests || {}, {
    "tomas-leo-1": {
      title: "Box of leg motors",
      brief:
        "Tomas found a robot dog by the back fence. He wants to wake the shut-down Bolt-model. First, it needs new leg motors. Go to Reyes Hardware, northeast of the cabin. Look on the floor by the riding mower. Find a cardboard box with a red label. You get 25 scrap and 1 spool of wire.",
      tag: "This cardboard box holds four small leg motors. Each one is wrapped in paper. The red label says: for school robot dogs, Bolt-model.",
      journal: "You brought Tomas leg motors from Reyes Hardware. The robot dog in the garage can stand now. It still wobbles.",
      done: "Tomas fits the leg motors into the robot dog. He does one leg at a time. The robot dog stands up and wobbles. Then it sits down again with a click. Tomas thanks you.",
      after:
        "Tomas says Bolt-model dogs copy Koen's first robot dog. That dog was named Bolt. Bolt went everywhere Koen went, even to Mira-9. Tomas wants this one to go everywhere you go.",
    },
    "tomas-leo-2": {
      title: "Jar with a nose sensor",
      brief:
        "Tomas wants a nose for the robot dog. It is a tiny chemistry sensor. It tells what things are made of. Greenhouse Row tested soil with one. Go there, west of the cabin. Find a glass jar with a red lid. It sits by the beehives. Earn 30 scrap and 1 box of engine parts.",
      tag: "This glass jar has a red lid. A sensor on a wire is inside. The label says: Soil tester. Do not open in rain.",
      journal: "You brought Tomas the nose sensor from Greenhouse Row. All evening, Tomas taught the robot dog. Now it can sniff the van's fuel line.",
      done: "Tomas clicks the sensor into the robot dog's nose. It sniffs the air. Then it beeps two times. Tomas says two beeps mean yes. Tomas thanks you.",
      after:
        "Tomas says Bolt's nose was a chemistry tester too. On Mira-9, Bolt sniffed the soft roads. Bolt found out they were grown, like coral. Tomas says a good nose beats a good gun.",
    },
    "tomas-leo-3": {
      title: "Tin with a battery cell",
      brief:
        "Tomas says the robot dog's battery is empty. Only a Bolt-model cell fits it. Signal Electronics is north of the cabin. Look on the floor beside the robot. Find a red tin with a white paper band. The battery cell is inside. Tomas pays 35 scrap. He adds 1 box of radio parts.",
      tag: "This red tin has a white paper band. A heavy battery cell inside hums softly. Someone wrote on the band: fully charged, keep dry.",
      journal: "You brought Tomas a battery cell from Signal Electronics. The robot dog's eyes glowed blue. It was the first time. They went dark again.",
      done: "Tomas snaps the battery cell into the robot dog. Its eyes glow blue for a moment. Its metal tail wags once. Tomas thanks you.",
      after:
        "Tomas says the robot dog still has no memory. It does not know who its friends are. A school's old Bolt-model dog would have a memory. It would be behind its gold star badge.",
    },
    "tomas-leo-4": {
      title: "Gold star badge",
      brief:
        "Every school's robot dog wore a gold star badge. Tomas says its memory chip is behind the badge. Lincoln Middle School is northeast of the cabin. The badge lies by the basketball hoop. It rests on a black leather fold. The gold shield has a star. Tomas pays 45 scrap and 1 tool kit.",
      tag: "This gold shield has a star. The fold is black leather. The back says: Lincoln Lions robot dog. It sniffs pipes every Monday.",
      journal: "You brought Tomas the gold star badge. Tomas and Pip stayed up late. They taught the robot dog all our names.",
      done: "Tomas moves the memory chip from the badge. It goes into the robot dog. The robot dog turns its head. It looks at each of you and beeps. Tomas thanks you.",
      after:
        "Tomas says the robot dog knows our faces now. It still needs eyes that see in the dark. It needs a voice to warn us too. Then it can go out with you, Tomas says.",
    },
    "tomas-leo-5": {
      title: "Toolbox of robot-dog parts",
      brief:
        "Northgate Mall's toy store sold robot dog parts. Tomas wants its eye lights and voice chips. Northgate Mall is northeast of the cabin. A red steel toolbox holds them. It sits by the green dino. Then the robot dog sees in the dark. It can zap walkers and come with you. You get 60 scrap.",
      tag: "This red steel toolbox holds two blue eye lights. It holds a voice chip too. The lid sticker says: Toy Town, robot dog repairs.",
      journal: "You brought Tomas the robot dog's last parts. Tomas named it Rivet. Rivet followed you around the yard all evening, beeping.",
      done: "Tomas fits the new parts. The robot dog wakes for good. Tomas names it Rivet, for its rivets. Rivet follows you everywhere, even in the van. Its zaps slow walkers, but it is no gun. Many bites shut it down. Tomas fixes it at home for 20 scrap.",
      after:
        "Tomas says Koen would be proud of Rivet. Koen once wrote about it. A robot is only as good as its friend. The friend is the one who fixes it. Tomas says he will always fix Rivet. He will fix it no matter how many times.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
