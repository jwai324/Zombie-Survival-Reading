/* Reading level 3: the Fortitude (Earth, hundreds of years after Book 4) crossover universe. June's ledger lines and the radio (T.universe.fortitude), and the
   crew's words for this universe's topics and quests (merged into T.crew). Facts: js/story-fortitude.js.
   Design: docs/UNIVERSES.md; rules for the words: docs/TEXT_GUIDE.md. Shown only while Settings: Universe is on. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[3] = root.ZSR.TEXT[3] || { level: 3 });
  T.universe = T.universe || {};
  T.crew = T.crew || {};

  T.universe.fortitude = {
    journal: [
      {
        title: "The Silver Line",
        text: "Tonight I showed Pip the thin silver line across the sky. It is the old shipyard ring, built hundreds of years ago. They made it from a black metal called Indestructium. Pip squinted at it and decided it was a scratch on the window. — June",
      },
      {
        title: "The Waiting Vault",
        text: "Across the river stands the Waiting Vault, where people slept in cold pods. They hoped to skip ahead to a better time. I never trusted it, not for one day. A person should live their days, not skip them. — June",
      },
      {
        title: "The Whole Team",
        text: "Every school on Earth teaches the story of Dr. Camila Reyes. She was the one who saw the Fortitude fleet first. Pip can name the whole team: Zoe, Kennedy, Ava, Patriya and Annabelle. That was hundreds of years ago, but some nights it still feels close. — June",
      },
      {
        title: "The First Week",
        text: "Tonight I wrote down what I remember of the Fall's first week. The alarms at the Waiting Vault rang across the river for two days. Then the sleepers walked out, and they were not right. I do not like to write about it, so I will stop there. — June",
      },
      {
        title: "What a Fortitude Looks Like",
        text: "Pip asked me what a Fortitude looks like. I described the picture of Valen from my old school book. Valen stood nine feet tall, with four arms and two big dark eyes. Valen was the Fortitude who learned the words help, thank you and together. — June",
      },
      {
        title: "Learning with Gloves On",
        text: "Tomas burned his hand on the van's engine today, though not badly. I told him the old saying from the story of the Fortitude. If you stop failing, you stop learning. Tomas said he would rather learn with gloves on, thank you very much. — June",
      },
      {
        title: "The Bright Point",
        text: "On clear nights, Mars shows as a bright point low in the sky. The Fortitude live there, on the world that was chosen for them. That way, Earth could stay ours. Pip wonders if a Fortitude kid is looking back at us right now. — June",
      },
      {
        title: "Going Down Anyway",
        text: "Pip found a picture of the Abyss Explorer, a little silver submarine. It dove seven miles down into the dark. Its crew brought up the first piece of Indestructium. Pip says being brave is just going down anyway. — June",
      },
    ],
    radio: [
      {
        title: "Clicks Under Jo's Voice",
        text: "This is Jo on 88.1. Listen closely under my voice tonight, and you will hear fast clicks. They sound like a machine reading numbers out loud. The clicks have come every few days since the Fall. Nobody knows who sends them, and I have asked around. If you know, I would love to hear from you.",
      },
      {
        title: "Jo Counts the Clicks",
        text: "Jo here on 88.1. Tonight I counted the clicks out loud: 1, 2, 3, then 5, then 8. It sounds like math to me, not talk. It is too neat to be an accident. So I am asking anyone who knows old codes to listen in. Write down what you hear.",
      },
      {
        title: "Jo Reads an Old Book",
        text: "This is Jo, reading from an old book I found. It says the Fortitude talk in bursts of math that make pictures. Their language has no word for maybe, please, help, together or friend. Imagine that. The bursts we hear on 88.1 sound just like that. I am not saying what it means. I am only saying what I hear.",
      },
      {
        title: "Jo and the Accord Archive",
        text: "This is Jo on 88.1. Someone remembers an old machine called the Accord Archive. It kept the records of the Fortitude Accord. Nobody knows where it is, or if it still runs. But I can tell you this much. The clicks came again tonight, right on time.",
      },
      {
        title: "Jo Asks for Hello",
        text: "This is Jo on 88.1. The bursts are getting longer, night after night. So tonight I am talking to whoever sends them. Please say hello, in plain words, so we know you are there. I waited after I asked, and I listened hard. Only clicks came back.",
      },
      {
        title: "Good Company",
        text: "Jo here, on a quiet night. I keep thinking about those clicks. Picture a machine that keeps records for hundreds of years. It must have someone looking after it. Or it is just very well built. Either way, I have decided I do not mind. It is good company on a quiet night like this one.",
      },
    ],
  };

  T.crew.talk = Object.assign(T.crew.talk || {}, {
    "june-fort-t1": {
      title: "Live Your Days",
      text: "June never trusted the Waiting Vault across the river. People slept there in cold pods to skip ahead to a better time. “A person should live their days, not skip them,” June says. She says healing is the same. The big bed in the cabin heals you fully, but it takes time. So plan for it.",
    },
    "june-fort-t2": {
      title: "Stop Failing, Stop Learning",
      text: "June's school taught an old saying: if you stop failing, you stop learning. It comes from the story of Dr. Camila Reyes and her team. That was hundreds of years ago. June says it is true of stash locks, too. A wrong key can jam a stash lock. Then a crowbar from the workbench pries it open.",
    },
    "tomas-fort-t1": {
      title: "The Black Metal",
      text: "Tomas says the black metal in old reactor plates is Indestructium. It cannot be bent, burned or broken, and he has tried. Kennedy, the engineer on Dr. Camila Reyes's team, gave it that name. Tomas wishes he could build a van out of it. Until then, he says, build the Walls room. It makes the fence stronger and gives you and the van more health.",
    },
    "tomas-fort-t2": {
      title: "A Good Fix Is Slow",
      text: "Tomas says the first fusion reactor ran for 10 seconds before a coil failed. Kennedy was burned, and the team learned to stop rushing. “A good fix is a slow fix,” Tomas says, and that goes for vans. Once the Garage room is built, the van comes home fixed for free.",
    },
    "pip-fort-t1": {
      title: "The Whole Team",
      text: "Pip can name Dr. Camila Reyes's whole team: Zoe, Kennedy, Ava, Patriya and Annabelle. Valen was the Fortitude who answered their messages. Valen learned the words help, thank you and together. Pip says to read every note to the end. Some notes in town are old or wrong, and the end tells you which.",
    },
    "pip-fort-t2": {
      title: "Bursts of Math",
      text: "Pip read that the Fortitude talk in bursts of math that make pictures. Ava learned their language by listening to the patterns of ocean waves. Pip thinks that is the best way anyone ever learned anything. Once the Radio room is built, Pip listens for strange bursts every few days.",
    },
  });

  T.crew.quests = Object.assign(T.crew.quests || {}, {
    "pip-fort-1": {
      title: "Boom box with a tape deck",
      brief:
        "Pip wants to record the bursts on the radio and play them back slowly. “Slow them down, and maybe they make sense,” Pip says. Gas-N-Go is west of the cabin. Look on the floor by the ice machine for an old boom box. It has a tape deck, two speakers, a dial and an antenna. Pip will give you 20 scrap and 1 box of books.",
      tag: "This boom box has two speakers, a dial and an antenna. A tape is still inside. Someone wrote on the tape: road trip songs, side A.",
      journal: "You brought Pip a boom box from Gas-N-Go. Pip recorded the bursts over the road trip songs. Then Pip played them back slowly all evening, ear to the speaker.",
      done: "Pip records a burst and plays it back slowly. At that speed, each click becomes a dot on Pip's paper. The dots are not random. They start to make a shape, and Pip forgets to blink. “Thank you,” Pip says, without looking up.",
      after:
        "Pip says the bursts really are pictures, just like the old books said. Played slowly, one burst draws a sleeping pod. Pip wants something real to compare it with. A pod tag from the Waiting Vault would help, Pip says. Pip has already cleared a spot on the shelf for it.",
    },
    "pip-fort-2": {
      title: "Tin with a pod tag",
      brief:
        "Someone brought a metal tag from a Waiting Vault pod to Mile 9 Pharmacy. Pip wants to compare its numbers with the bursts. Mile 9 Pharmacy is northwest of the cabin. Look on the floor by the pill bottle. The tag is inside a red tin with a white paper band. Pip will give you 30 scrap and 1 medical kit.",
      tag: "A red tin with a white paper band. Inside is a cold metal tag stamped with a long number. The band says: Waiting Vault, pod tag, return to the front desk.",
      journal: "You brought Pip a pod tag from Mile 9 Pharmacy. Pip held it up to the radio. Then Pip wrote numbers until the candle burned down.",
      done: "Pip lines up the tag's number with the numbers in the bursts. They are made the same way, digit by digit. “The bursts are records,” Pip says, “and a machine is keeping them.” Pip holds the tag up to the light and thanks you.",
      after:
        "Pip decoded the first record. It says: \"We acknowledge your intelligence.\" Those were the first words the Fortitude ever sent to Earth. That was hundreds of years ago. Pip says somewhere an old archive is still reading its records out loud. Pip wants to know where, and who keeps it running.",
    },
    "pip-fort-3": {
      title: "History book about the Fortitude",
      brief:
        "Pip needs an old history book called The Arrival of the Fortitude. Pip wants to match the bursts' pictures to its drawings. The Public Library is north of the cabin. The book lies on the floor beside the giant globe. It is a thick blue book with folded page corners. Pip will give you 35 scrap and 1 box of books.",
      tag: "A thick blue book with folded page corners: The Arrival of the Fortitude. A library stamp inside says: most borrowed book, every year.",
      journal: "You brought Pip The Arrival of the Fortitude from the Public Library. Pip read it out loud at supper, and nobody minded, not even Tomas.",
      done: "Pip flips through the book until one drawing matches a burst. It shows a crowd of people standing under umbrellas. Pip marks the page with a strip of paper. Pip says the next record is ready to read, and thanks you twice.",
      after:
        "Pip decoded the second record. It is the Fortitude Accord, signed in New York on a rainy morning. On that day, Pip says, two kinds of people agreed to share the stars. Pip read the record out loud to the whole crew. Pip thinks the umbrellas are the best part.",
    },
    "pip-fort-4": {
      title: "Copy of an Accord page",
      brief:
        "The 4th Precinct kept a copy of a page of the Fortitude Accord. It hung framed by the door, for luck. Pip wants to check the bursts against the real words. The 4th Precinct is north of the cabin. The page is in a white envelope with a red seal. It lies on the floor by the coffee machine. Pip will give you 45 scrap and 1 spool of wire.",
      tag: "A white envelope with a red seal. Inside is a copy of a page of the Fortitude Accord. Someone wrote on the envelope: old, but it still means something.",
      journal: "You brought Pip a copy of an Accord page from the 4th Precinct. Pip pinned it over the radio, next to the list of voices.",
      done: "Pip holds the page beside the notes from the burst. The words match, word for word. Pip reads the page again, line by line, and nods. “The archive is real,” Pip says, “and it is still running.” Pip says it so quietly that you lean in to hear.",
      after:
        "Pip decoded the third record: a message from Valen to Dr. Camila Reyes. It says: \"Hello, Camila. I was not sure you would ever see me.\" Pip read it twice, very quietly. Then Pip put the pencil down and sat for a while.",
    },
    "pip-fort-5": {
      title: "Gold Abyss Explorer pin",
      brief:
        "The last bursts keep drawing one shape: the Abyss Explorer. That is the little submarine from the old story. Station 12's chief kept an Abyss Explorer pin by the brass pole. Station 12 is northwest of the cabin. The pin is a gold badge with a star, on a black leather fold. Pip will give you 60 scrap and 1 box of radio parts.",
      tag: "A gold badge with a star, on a black leather fold. The star is worn smooth. Stamped on the back: Abyss Explorer, seven miles down.",
      journal: "You brought Pip an Abyss Explorer pin from Station 12. Pip wore it to supper and decoded the last record before bed.",
      done: "Pip pins the badge to the radio shelf and plays the last burst slowly. The picture is the submarine, small and brave, and then come words. Pip writes them down one at a time, pencil shaking a little. Pip thanks you without looking up.",
      after:
        "Pip decoded the fourth record: \"We will not take Earth.\" Every record ends with a number that counts up. The newest number is from this year. Pip says someone, or something, is still adding records. Pip wants to find out who. Pip pins the list of records next to the list of voices.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
