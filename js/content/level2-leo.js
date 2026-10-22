/* Reading level 2: the Captain Leo (Mira-8) crossover universe. June's ledger lines and the radio (T.universe.leo), and the
   crew's words for this universe's topics and quests (merged into T.crew). Facts: js/story-leo.js.
   Design: docs/UNIVERSES.md; rules for the words: docs/TEXT_GUIDE.md. Shown only while Settings: Universe is on. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[2] = root.ZSR.TEXT[2] || { level: 2 });
  T.universe = T.universe || {};
  T.crew = T.crew || {};

  T.universe.leo = {
    // June's ledger: a few lines under the day's page, one per WORLD.UNIVERSES.leo.journal entry, in order
    journal: [
      {
        title: "The Second Moon",
        text: "Mira-9 rose over the trees tonight, huge and pale. Its white clouds turned slowly. Everyone on Mira-8 grows up under it. Pip asked if anyone still lives up there. I said yes, the Mirans, the cloud-people. But that is a story for another night.\n\n- June",
      },
      {
        title: "Founders' Day",
        text: "My calendar says today was Founders' Day. Every year, the town ate cake. We told the story of Captain Leo and Co-captain Camila. They were the first kids to reach Mira-9. That was two hundred years ago. Nobody baked, but Pip told it anyway.\n\n- June",
      },
      {
        title: "Why Only Kids Came",
        text: "Tomas asked why only kids ever came to Mira-8. The Skip Drive folds space like paper, I told him. It only works on bodies that are still growing. I rode it at ten with one bag, one photo.\n\n- June",
      },
      {
        title: "The Gray",
        text: "We call the sickness across the river the Gray. Long ago, Mira-8 had a sky forest like Mira-9's. It died before the first kids came. The miners across the river dug deep. They brought up what was left. The Mirans had warned us not to dig.\n\n- June",
      },
      {
        title: "The Jar on the Windowsill",
        text: "I turned the jar on the windowsill toward the light. It holds a cloud-tree seed from Mira-9. My grandmother got it as a girl. It has never sprouted. Nobody knows the right air for it. I water it anyway.\n\n- June",
      },
      {
        title: "The Come Back Knock",
        text: "I remember three soft notes on the old town radios. They came from Mira-9, like a knock on a door. We called it the Come Back Knock. For years before that, Mirans sent numbers, one to ten.\n\n- June",
      },
      {
        title: "Koen and Bolt",
        text: "Tomas fixed the porch step and talked about Koen. Koen was the builder on Captain Leo's crew. He built Bolt, a robot dog of bolts and wire. Bolt went everywhere Koen went. Every Mira-8 school kept a Bolt-model robot dog. It sniffed air pipes for leaks.\n\n- June",
      },
      {
        title: "Three Misty Fingers",
        text: "I read Pip the last page of a mission report. Captain Leo and Co-captain Camila wrote it. Sool the Miran waved goodbye with three misty fingers. Mirans live a very long time. Sool may still be up there. Pip waved at the sky, just in case.\n\n- June",
      },
    ],
    // the radio: one per WORLD.UNIVERSES.leo.radio entry, in order; each names its speaker
    radio: [
      {
        title: "Jo and the Knock",
        text: "Before Jo's show, three soft notes came through. Knock, knock, knock. Then Jo came on. \"Old folks call that the Come Back Knock,\" Jo said. \"It comes from Mira-9. It came every few days before the Fall, too. So if you hear it, you are not alone.\"",
      },
      {
        title: "Sool Says Hello",
        text: "After the knock, a new voice came on. It was soft, like wind through grass. \"Hello. I am Sool. We hear you.\" Sool said the Mirans are watching Mira-8. They watch from their clouds. Then Sool said one more thing. \"Do not dig. Stay together.\"",
      },
      {
        title: "Jo Reads History",
        text: "Jo read from an old school book today. It was about the first mission. Captain Leo and five other kids flew the ship Skip-One. They reached Mira-9 and met the Mirans. The Mirans breathe methane. Their trees float in the clouds. Before anyone came, the Mirans counted on the radio. They did it for years.",
      },
      {
        title: "Sool and the Gray",
        text: "The knock came, and then Sool spoke. Sool said Mira-8 once had a sky-forest too. It went gray and quiet long ago. That was before the first kids came. Then Sool said, \"What is gray, leave sleeping.\" The radio hissed after that.",
      },
      {
        title: "Jo and the Robot Dog",
        text: "Jo here, with a strange one. Someone saw a robot dog on the river road. It was limping, with one blue eye blinking. It looked like an old Bolt-model. You know, the kind every school kept. If you can fix one, keep your toolbox handy.",
      },
      {
        title: "Sool Asks About Us",
        text: "Sool was on the radio again. Sool asked about the kids of Mira-8. \"Are you eating? Are you warm?\" Captain Leo once promised the Mirans he would come back. He did, Sool said, many times. \"Kids first,\" Sool said. \"Kids are bravest.\"",
      },
      {
        title: "Jo Knocks Back",
        text: "Jo played the knock back on the air. Three notes went out into the night. No answer came. But Jo did not sound worried. \"The Mirans are patient,\" Jo said. \"They counted for many years before anyone answered. We can wait too.\"",
      },
      {
        title: "The Cloud-Tree Song",
        text: "Sool hummed a slow song with long notes. Sool called it the cloud-tree song. Then Sool said, \"We wait. We are friends.\" The knock came one more time, three soft notes. Then the radio went quiet.",
      },
    ],
  };

  T.crew.talk = Object.assign(T.crew.talk || {}, {
    "june-leo-t1": {
      title: "One Bag and One Photo",
      text: "June came to Mira-8 on the Skip Drive at ten. She brought one bag and one photo. It showed her mother's garden. June planted her first seeds the week she landed. She says a new world is just a garden. Nobody has planted it yet. A new Garden room grows 1 food a day. It grows more with each level, June says.",
    },
    "june-leo-t2": {
      title: "Waiting for the Right Air",
      text: "June keeps a cloud-tree seed in a windowsill jar. It came from Mira-9. A Miran named Sool gave some to Captain Leo's crew. On Mira-9, cloud-trees float in the sky. They breathe in carbon dioxide and breathe out methane. June says the seed is waiting for the right air. So is she. Once built, the Lab room makes medical kits over time.",
    },
    "tomas-leo-t1": {
      title: "Koen and the Ship's Lights",
      text: "Tomas learned to fix things because of Koen. Koen was the builder on Captain Leo's crew. He built Bolt, a robot dog of bolts and wire. Once Koen fixed a ship's lights. Bolt held the other wire for him. Tomas's father kept a picture of Koen over his workbench. With the Garage room, Tomas fixes the van for free.",
    },
    "tomas-leo-t2": {
      title: "Robot Dogs in the Schools",
      text: "Tomas says each Mira-8 school had a Bolt-model robot dog. It sniffed the air pipes for leaks. Most of them shut down in the Fall. But their parts are still out there. A Bolt-model's nose is really a tiny chemistry kit. One more thing, Tomas says. Take something from a shelf in town. It comes back after 3 days.",
    },
    "pip-leo-t1": {
      title: "Named After PIP",
      text: "Pip was named after PIP. PIP was the helper voice on the ship Skip-One. PIP talked Captain Leo's crew all the way to Mira-9. Then PIP talked them all the way home again. Pip likes that PIP always had an answer. PIP never panicked, not once. Pip says the Radio room finds new places.",
    },
    "pip-leo-t2": {
      title: "Knocking Back",
      text: "Pip wants to knock back one day. That means three notes, sent all the way to Mira-9. The first Mirans counted on the radio for years. They were hoping someone would answer. Pip says an unanswered knock is the loneliest sound. With a Radio room, the knock comes every few days.",
    },
  });

  T.crew.quests = Object.assign(T.crew.quests || {}, {
    "tomas-leo-1": {
      title: "Box of leg motors",
      brief:
        "Tomas found a shut-down robot dog by the back fence. It is an old Bolt-model. Tomas wants to wake it up. First, it needs new leg motors. Reyes Hardware is northeast of the cabin. A box of leg motors sits on the floor there. It is beside the riding mower. Look for a cardboard box with a red label. You get 25 scrap and 1 spool of wire.",
      tag: "This cardboard box holds four small leg motors. Each one is wrapped in paper. The red label says: for school robot dogs, Bolt-model.",
      journal: "You brought Tomas leg motors from Reyes Hardware. Now the robot dog by the van can stand. It still wobbles, though.",
      done: "Tomas fits the leg motors into the robot dog. He does it one leg at a time. It stands up and wobbles. Then it sits down again with a click. Tomas laughs and thanks you. He says it is a start.",
      after:
        "Tomas says Bolt-model dogs were built to copy Bolt. Bolt was Koen's first robot dog. Bolt went everywhere Koen went, even to Mira-9. Tomas wants this one to go everywhere you go. He pats its metal head.",
    },
    "tomas-leo-2": {
      title: "Jar with a nose sensor",
      brief:
        "The robot dog needs a nose, Tomas says. That means a tiny chemistry sensor. It tells what something is made of. Greenhouse Row used one to test the soil. Greenhouse Row is west of the cabin. It is sealed in a glass jar. The red-lidded jar is on the floor by the beehives. You get 30 scrap and 1 box of engine parts.",
      tag: "This glass jar has a red lid. Inside is a small silver sensor on a wire. The paper label says: soil tester. Do not open in the rain.",
      journal: "You brought Tomas the nose sensor from Greenhouse Row. He spent the evening with the robot dog. He taught it to sniff the van's fuel line.",
      done: "Tomas clicks the sensor into the robot dog's nose. It sniffs the air. Then it beeps twice. Tomas grins. He says two beeps mean yes. Tomas thanks you for the nose.",
      after:
        "Tomas says Bolt's nose was a chemistry tester too. On Mira-9, Bolt sniffed the soft roads. Bolt found out they were grown, like coral. A good nose beats a good gun, Tomas says.",
    },
    "tomas-leo-3": {
      title: "Tin with a battery cell",
      brief:
        "The robot dog's battery has no power left, Tomas says. Only a Bolt-model cell will fit it. Signal Electronics is north of the cabin. A red tin lies on the floor beside the robot. The tin has a white paper band. The battery cell is inside. You get 35 scrap and 1 box of radio parts.",
      tag: "This red tin has a white paper band. Inside, a heavy battery cell hums softly. Someone wrote on the band: fully charged, keep dry.",
      journal: "You brought Tomas a battery cell from Signal Electronics. The robot dog's eyes glowed blue for the first time. Then they went dark again.",
      done: "Tomas snaps the battery cell into the robot dog. Its eyes glow blue for a moment. Its metal tail wags once. Tomas grins and thanks you. He says that wag was for you.",
      after:
        "Tomas says the robot dog still has no memory. It does not know who its friends are. A school's old Bolt-model dog would have one. The memory chip sat behind its gold star badge. Tomas wants to find one.",
    },
    "tomas-leo-4": {
      title: "Gold star badge",
      brief:
        "Each school robot dog wore a gold star badge. Tomas says its memory chip was behind the badge. Lincoln Middle School is northeast of the cabin. The badge lies by the basketball hoop. It sits on a black leather fold. Look for a gold shield with a star. Tomas will give you 45 scrap and 1 tool kit.",
      tag: "This gold shield badge has a star. It sits on a black leather fold. The back says: Lincoln Lions robot dog. It sniffs the air pipes every Monday.",
      journal: "You brought Tomas the school robot dog's gold star badge. Tomas and Pip stayed up late. They taught the robot dog all our names.",
      done: "Tomas takes the memory chip from behind the badge. He moves it into the robot dog. The robot dog turns its head. It looks at each of you, one by one. Then it beeps. Tomas thanks you.",
      after:
        "Tomas says the robot dog knows our faces now. But it still needs eyes that see in the dark. It also needs a voice to beep at us. Then it can go out with you, Tomas says.",
    },
    "tomas-leo-5": {
      title: "Toolbox of robot-dog parts",
      brief:
        "The toy store at Northgate Mall sold robot dog parts. It sold spare eye lights and voice chips. Northgate Mall is northeast of the cabin. Look by the green dino for a red steel toolbox. The parts are inside. With them, the robot dog can see in the dark. It can zap walkers and come with you. Tomas will give you 60 scrap.",
      tag: "This red steel toolbox holds two blue eye lights. A small voice chip is inside too. The lid sticker says: Toy Town, robot dog repairs.",
      journal: "You brought Tomas the last parts for the robot dog. Tomas named it Rivet. Rivet followed you around the yard all evening, beeping.",
      done: "Tomas fits the eye lights and the voice chip. The robot dog wakes up for good. Tomas names it Rivet, since rivets hold it together. Rivet follows you in the yard and buildings. It rides in the van. Its zaps slow walkers down, but it is no gun. Too many bites shut it down. Tomas fixes it at home for 20 scrap.",
      after:
        "Tomas says Koen would be proud of Rivet. Koen once wrote about robots. A robot is only as good as one thing. That is the friend who fixes it. Tomas says he will always fix Rivet. It does not matter how many times.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
