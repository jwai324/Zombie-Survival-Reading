/* Reading level 2: the Fortitude (Earth, hundreds of years after Book 4) crossover universe. June's ledger lines and the radio (T.universe.fortitude), and the
   crew's words for this universe's topics and quests (merged into T.crew). Facts: js/story-fortitude.js.
   Design: docs/UNIVERSES.md; rules for the words: docs/TEXT_GUIDE.md. Shown only while Settings: Universe is on. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[2] = root.ZSR.TEXT[2] || { level: 2 });
  T.universe = T.universe || {};
  T.crew = T.crew || {};

  T.universe.fortitude = {
    journal: [
      {
        title: "The Silver Line",
        text: "I showed Pip the thin silver line across the sky. It is the old shipyard ring. It was built hundreds of years ago. They made it from a black metal called Indestructium. Pip thought it was a scratch on the window.\n\n- June",
      },
      {
        title: "The Waiting Vault",
        text: "Across the river stands the Waiting Vault. People slept there in cold pods. They wanted to skip ahead to a better time. I never trusted it, not once. A person should live their days, not skip them.\n\n- June",
      },
      {
        title: "The Whole Team",
        text: "Every school on Earth teaches about Dr. Camila Reyes. She saw the Fortitude fleet first. Her team was Zoe, Kennedy, Ava, Patriya and Annabelle. Pip can name them all, in order. That was hundreds of years ago. But some nights, it still feels close.\n\n- June",
      },
      {
        title: "The First Week",
        text: "I wrote about the first week of the Fall. The alarms at the Waiting Vault rang for two days. We could hear them across the river. Then the sleepers walked out, and they were not right. I do not like writing it, so I stopped there.\n\n- June",
      },
      {
        title: "What a Fortitude Looks Like",
        text: "Pip asked what a Fortitude looks like. My old school book had a picture of Valen. I described it for Pip. Valen was nine feet tall, with four arms. Valen had two big dark eyes. Valen learned the words help, thank you and together.\n\n- June",
      },
      {
        title: "Learning with Gloves On",
        text: "Tomas burned his hand on the van's engine today. It was not bad. I told him an old saying from the Fortitude story. If you stop failing, you stop learning. Tomas said he would rather learn with gloves on.\n\n- June",
      },
      {
        title: "The Bright Point",
        text: "On clear nights, Mars shows as a bright point. It sits low in the sky. The Fortitude live there now. That world was chosen for them. That way, Earth could stay ours. Is a Fortitude kid looking back at us? Pip wonders.\n\n- June",
      },
      {
        title: "Going Down Anyway",
        text: "Pip found a picture of the Abyss Explorer. It was a little silver submarine. It dove seven miles down. Its crew brought up the first piece of Indestructium. Pip says being brave is just going down anyway.\n\n- June",
      },
    ],
    radio: [
      {
        title: "Clicks Under Jo's Voice",
        text: "This is Jo on 88.1. Listen closely under my voice. Do you hear those fast clicks? They sound like a machine reading numbers. The clicks have come every few days since the Fall. Nobody knows who sends them. If you know, tell me.",
      },
      {
        title: "Jo Counts the Clicks",
        text: "Jo here, on 88.1. Tonight I counted the clicks out loud. I got 1, 2, 3, then 5, then 8. To me, that sounds like math, not talk. So here is my ask. Does anyone know old codes? If you do, please listen.",
      },
      {
        title: "Jo Reads an Old Book",
        text: "This is Jo. Today I read from an old book. It says the Fortitude talk in bursts of math. The math makes pictures, not words. Their language has no word for maybe or please. It has no word for help, together or friend. The bursts on 88.1 sound just like that.",
      },
      {
        title: "Jo and the Accord Archive",
        text: "This is Jo on 88.1. Someone out there remembers the Accord Archive. It is a machine that kept old records. They were the records of the Fortitude Accord. Nobody knows where the Archive is. Nobody knows if it still runs. But the clicks came again tonight, right on time.",
      },
      {
        title: "Jo Asks for Hello",
        text: "This is Jo on 88.1. The bursts are getting longer every time. So tonight I have a message. To whoever sends them: say hello in plain words. We are listening. I waited a long time after that. Only clicks came back.",
      },
      {
        title: "Good Company",
        text: "Jo here, on a quiet night. I keep thinking about those clicks. Some machine has kept records for hundreds of years. Someone must be looking after it. Or else it is very well built. Either way, I do not mind. It is good company on a quiet night.",
      },
    ],
  };

  T.crew.talk = Object.assign(T.crew.talk || {}, {
    "june-fort-t1": {
      title: "Live Your Days",
      text: "June never trusted the Waiting Vault across the river. People slept there in cold pods. They wanted to skip ahead to a better time. A person should live their days, June says. The same goes for healing, she says. The big bed in the cabin heals you fully. But it takes time.",
    },
    "june-fort-t2": {
      title: "Stop Failing, Stop Learning",
      text: "June's school taught an old saying. If you stop failing, you stop learning. It comes from the story of Dr. Camila Reyes. She and her team lived hundreds of years ago. June says it fits stash locks, too. A wrong key can jam a stash lock. Then a crowbar from the workbench pries it open.",
    },
    "tomas-fort-t1": {
      title: "The Black Metal",
      text: "Tomas says old reactor plates hold a black metal. It is called Indestructium. It cannot be bent, burned or broken. Kennedy gave it that name. Kennedy was the engineer on Dr. Camila Reyes's team. Tomas wishes he could build a van out of it. The Walls room makes the fence stronger, he says. It gives you and the van more health.",
    },
    "tomas-fort-t2": {
      title: "A Good Fix Is Slow",
      text: "Tomas tells you about the first fusion reactor. It ran for 10 seconds. Then a coil failed, and Kennedy was burned. After that, the team learned to stop rushing. Tomas says a good fix is a slow fix. He has another tip. Build the Garage room. Then the van comes home fixed for free.",
    },
    "tomas-fort-t3": {
      title: "A Famous Last Name",
      text: "Tomas tells you about Mr. Reyes of Reyes Hardware. Mr. Reyes tells everyone the same thing. He says his family goes back to Dr. Camila Reyes. But she lived hundreds of years ago. So nobody can prove it either way. Tomas likes the story, true or not. Reyes Hardware is the place to find lumber and nails.",
    },
    "pip-fort-t1": {
      title: "The Whole Team",
      text: "Pip can name Dr. Camila Reyes's whole team. They were Zoe, Kennedy, Ava, Patriya and Annabelle. Valen was the Fortitude who answered their messages. Valen learned the words help, thank you and together. Pip has a tip from all that reading. Read every note to the end. Some notes in town are old or wrong.",
    },
    "pip-fort-t2": {
      title: "Bursts of Math",
      text: "Pip read that the Fortitude talk in bursts of math. The bursts make pictures, not words. Ava listened to the patterns of ocean waves. That is how Ava learned their language. Build the Radio room, Pip says. Then Pip listens for strange bursts every few days.",
    },
  });

  T.crew.quests = Object.assign(T.crew.quests || {}, {
    "pip-fort-1": {
      title: "Boom box with a tape deck",
      brief:
        "Pip wants to record the bursts on the radio. Then Pip can play them back slowly. Gas-N-Go is west of the cabin. Look on the floor by the ice machine. An old boom box sits there. It has a tape deck and two speakers. It also has a dial and an antenna. Pip will pay 20 scrap and 1 box of books.",
      tag: "A tape is still inside this boom box. It has two speakers, a dial and an antenna. Someone wrote on the tape: road trip songs, side A.",
      journal: "You brought Pip a boom box from Gas-N-Go. Pip recorded the bursts over the road trip songs. Then Pip played them back slowly all evening.",
      done: "Pip records a burst and plays it back slowly. Each click becomes a dot on Pip's paper. Then the dots start to make a shape. Pip leans in close and keeps drawing. Pip thanks you for the boom box.",
      after:
        "Pip says the bursts are pictures. The old books said so. Played slowly, one burst draws a sleeping pod. Pip wants something to compare it with. A Waiting Vault pod tag would help, Pip says.",
    },
    "pip-fort-2": {
      title: "Tin with a pod tag",
      brief:
        "Someone brought a metal tag to Mile 9 Pharmacy. It came from a pod at the Waiting Vault. Pip wants to compare its numbers with the bursts. Mile 9 Pharmacy is northwest of the cabin. Look on the floor by the pill bottle. A red tin with a white paper band lies there. The tag is inside it. Pip will pay 30 scrap and 1 medical kit.",
      tag: "This red tin has a white paper band. Inside is a cold metal tag with a long number. The band says: Waiting Vault, pod tag. Return to the front desk.",
      journal: "You brought Pip a pod tag from Mile 9 Pharmacy. Pip held it up to the radio. Then Pip wrote numbers until the candle burned down.",
      done: "Pip lines up the tag's number beside the burst numbers. They are made the same way. So the bursts are records, Pip says. A machine keeps them. Pip thanks you and keeps writing.",
      after:
        "Pip decoded the first record. It says: \"We acknowledge your intelligence.\" Those were the first words the Fortitude sent to Earth. That was hundreds of years ago. Pip says an old archive is still out there somewhere. It is still reading its records out loud.",
    },
    "pip-fort-3": {
      title: "History book about the Fortitude",
      brief:
        "Pip needs an old history book. It is called The Arrival of the Fortitude. Pip wants to match the bursts' pictures to its drawings. The Public Library is north of the cabin. The book lies on the floor beside the giant globe. It is a thick blue book with folded page corners. Pip will pay 35 scrap and 1 box of books.",
      tag: "This thick blue book has folded page corners. It is The Arrival of the Fortitude. A library stamp inside says: most borrowed book, every year.",
      journal: "You brought Pip The Arrival of the Fortitude. It came from the Public Library. Pip read it out loud at supper, and nobody minded.",
      done: "One drawing in the book matches a burst. It shows a crowd of people under umbrellas. Pip taps the page and grins. Pip says the next record is ready to read. Pip thanks you.",
      after:
        "Pip decoded the second record. It is the Fortitude Accord. It was signed in New York on a rainy morning. Pip says the Accord was a special day. Two kinds of people agreed to share the stars.",
    },
    "pip-fort-4": {
      title: "Copy of an Accord page",
      brief:
        "The 4th Precinct kept a Fortitude Accord page for luck. The copy hung in a frame by the door. Pip wants to check the bursts against the real words. The 4th Precinct is north of the cabin. Look for a white envelope with a red seal. It lies on the floor by the coffee machine. Pip will pay 45 scrap and 1 spool of wire.",
      tag: "This white envelope has a red seal. Inside is a copy of a Fortitude Accord page. Someone wrote on it: old, but it still means something.",
      journal: "You brought Pip a copy of an Accord page. It came from the 4th Precinct. Pip pinned it over the radio. It hangs next to the list of voices.",
      done: "The page matches the burst, word for word. Pip reads it twice to be sure. Pip says the archive is real. And it is still running. Pip thanks you very quietly.",
      after:
        "Pip decoded the third record. It is a message from Valen to Dr. Camila Reyes. It says: \"Hello, Camila. I was not sure you would ever see me.\" Pip read it twice, very quietly.",
    },
    "pip-fort-5": {
      title: "Gold Abyss Explorer pin",
      brief:
        "The last bursts keep drawing one shape. It is the Abyss Explorer, the little submarine. That submarine is from the old story. Station 12's chief kept an Abyss Explorer pin. It is by the brass pole. Station 12 is northwest of the cabin. The pin is a gold badge with a star. It sits on a black leather fold. Pip will pay 60 scrap. Pip adds 1 box of radio parts.",
      tag: "This gold badge has a star, on a black leather fold. Stamped on the back: Abyss Explorer, seven miles down. It is a keepsake copy of a very old pin.",
      journal: "You brought Pip an Abyss Explorer pin from Station 12. Pip wore it to supper. Then Pip decoded the last record before bed.",
      done: "Pip pins the badge to the radio shelf. Then Pip plays the last burst slowly. The picture is the submarine. And then come words. Pip thanks you and holds very still.",
      after:
        "Pip decoded the fourth record. It says: \"We will not take Earth.\" Every record ends with a number that counts up. The newest number is from this year. Pip says someone, or something, is still adding records. Pip wants to find out who.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
