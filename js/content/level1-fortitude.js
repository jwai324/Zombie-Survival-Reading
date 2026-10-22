/* Reading level 1: the Fortitude (Earth, hundreds of years after Book 4) crossover universe. June's ledger lines and the radio (T.universe.fortitude), and the
   crew's words for this universe's topics and quests (merged into T.crew). Facts: js/story-fortitude.js.
   Design: docs/UNIVERSES.md; rules for the words: docs/TEXT_GUIDE.md. Shown only while Settings: Universe is on. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[1] = root.ZSR.TEXT[1] || { level: 1 });
  T.universe = T.universe || {};
  T.crew = T.crew || {};

  T.universe.fortitude = {
    journal: [
      {
        title: "The Silver Line",
        text: "I show Pip the thin silver line overhead. It is the old shipyard ring. People built it hundreds of years ago. They used Indestructium, a black metal. Pip thought it was a scratch on the window.\n\n—June",
      },
      {
        title: "The Waiting Vault",
        text: "The Waiting Vault stands across the river. People slept there in cold pods. They wanted to skip ahead to a better time. I never trusted it. A person should live their days, not skip them.\n\n—June",
      },
      {
        title: "The Whole Team",
        text: "Dr. Camila Reyes saw the Fortitude fleet first. Every school on Earth teaches her story. Her team was Zoe, Kennedy, Ava, Patriya and Annabelle. Pip knows them all. Some nights, hundreds of years feel close.\n\n—June",
      },
      {
        title: "The First Week",
        text: "I remember the first week of the Fall. Waiting Vault alarms rang across the river. They rang for two days. Then the sleepers walked out. They were not right. I do not like this, so I stop.\n\n—June",
      },
      {
        title: "What a Fortitude Looks Like",
        text: "Pip asks what a Fortitude looks like. My old school book had a picture of Valen. Valen was nine feet tall, with four arms. Valen had two big dark eyes. Valen learned help, thank you and together.\n\n—June",
      },
      {
        title: "Gloves On",
        text: "Tomas burns his hand on the van's engine. It is not bad. I tell him a saying from the Fortitude story. If you stop failing, you stop learning. Tomas says he would rather learn with gloves on.\n\n—June",
      },
      {
        title: "The Bright Point",
        text: "On clear nights, Mars shows low in the sky. It is a bright point. The Fortitude live there. That world was chosen for them. So Earth could stay ours. Pip wonders if a Fortitude kid looks back.\n\n—June",
      },
      {
        title: "Going Down Anyway",
        text: "Pip finds a picture of the Abyss Explorer. It was a little silver submarine. It dove seven miles down. Its crew brought up the first piece of Indestructium. Pip says being brave is just going down anyway.\n\n—June",
      },
    ],
    radio: [
      {
        title: "Clicks Under Jo's Voice",
        text: "This is Jo on 88.1. Do you hear the clicks under my voice? They are fast, like a machine reading numbers. The clicks come every few days. They have come since the Fall. Nobody knows who sends them.",
      },
      {
        title: "Jo Counts the Clicks",
        text: "Jo here, on 88.1. I count the clicks out loud tonight. I count 1, 2, 3, then 5, then 8. That sounds like math, not talk. Do you know old codes? Then please listen with me.",
      },
      {
        title: "Jo Reads an Old Book",
        text: "This is Jo. I read from an old book. It says the Fortitude talk in bursts of math. The math makes pictures. Their language has no word for maybe. It has no please, help, together or friend. The bursts on 88.1 sound just like that.",
      },
      {
        title: "Jo and the Accord Archive",
        text: "This is Jo on 88.1. Someone remembers the Accord Archive. It is a machine. It kept the records of the Fortitude Accord. Nobody knows where it is. Nobody knows if it still runs. The clicks came again tonight, right on time.",
      },
      {
        title: "Jo Asks for Hello",
        text: "This is Jo on 88.1. The bursts are getting longer. So I ask one thing. Whoever sends them, please say hello. Say it in plain words. I wait. Only clicks come back.",
      },
      {
        title: "Good Company",
        text: "This is Jo. A machine has kept records for hundreds of years. Someone must look after it. Or it is very well built. Either way, it is good company. And this is a quiet night.",
      },
    ],
  };

  T.crew.talk = Object.assign(T.crew.talk || {}, {
    "june-fort-t1": {
      title: "Live Your Days",
      text: "June never trusted the Waiting Vault across the river. People slept there in cold pods. They wanted to skip ahead to a better time. June says to live your days, not skip them. The big bed in the cabin heals you fully. But it takes time.",
    },
    "june-fort-t2": {
      title: "Stop Failing, Stop Learning",
      text: "June's school taught an old saying. If you stop failing, you stop learning. It comes from the story of Dr. Camila Reyes. She and her team lived hundreds of years ago. A wrong key can jam a stash lock. A crowbar from the workbench pries it open.",
    },
    "tomas-fort-t1": {
      title: "The Black Metal",
      text: "Tomas says old reactor plates are black Indestructium. It cannot be bent, burned or broken. Dr. Camila Reyes's engineer, Kennedy, named it. Tomas wishes he could build a van from it. The Walls room makes the fence stronger. It gives you and the van more health.",
    },
    "tomas-fort-t2": {
      title: "A Good Fix Is Slow",
      text: "Tomas tells you about the first fusion reactor. It ran for 10 seconds. Then a coil failed. Kennedy was burned. So the team learned to stop rushing. Tomas says a good fix is a slow fix. Build the Garage room. Then the van comes home fixed for free.",
    },
    "pip-fort-t1": {
      title: "The Whole Team",
      text: "Pip can name Dr. Camila Reyes's whole team. They are Zoe, Kennedy, Ava, Patriya and Annabelle. Valen, a Fortitude, answered their messages. Valen learned the words help, thank you and together. Pip says to read every note to the end. Some notes in town are old or wrong.",
    },
    "pip-fort-t2": {
      title: "Bursts of Math",
      text: "Pip read about how the Fortitude talk. They talk in bursts of math. The math makes pictures. Ava listened to the patterns of ocean waves. That is how Ava learned their language. Build the Radio room, Pip says. Then Pip listens for strange bursts every few days.",
    },
  });

  T.crew.quests = Object.assign(T.crew.quests || {}, {
    "pip-fort-1": {
      title: "Boom box with a tape deck",
      brief:
        "Pip wants to record the radio bursts. Pip can play them back slowly. Go to Gas-N-Go, west of the cabin. Look on the floor by the ice machine. Find an old boom box with a tape deck. It has two speakers, a dial and an antenna. Pip pays 20 scrap and 1 box of books.",
      tag: "This boom box has two speakers. It has a dial and an antenna. The tape inside says: road trip songs, side A.",
      journal: "You brought Pip a boom box from Gas-N-Go. Pip recorded the bursts over the road trip songs. Pip played them back slowly all night.",
      done: "Pip records a burst on the tape. Then Pip plays it back slowly. Each click becomes a dot on paper. The dots start to make a shape. Pip thanks you and keeps drawing.",
      after:
        "Pip says the bursts are pictures. The old books said so. Played slowly, one burst draws a sleeping pod. Pip wants something to compare it with. A Waiting Vault pod tag would help, Pip says.",
    },
    "pip-fort-2": {
      title: "Tin with a pod tag",
      brief:
        "Mile 9 Pharmacy is northwest of the cabin. Someone brought a Waiting Vault pod tag there. Pip will compare its numbers to the bursts. The metal tag is in a red tin. It has a white paper band. It is on the floor by the pill bottle. Pip pays 30 scrap and 1 medical kit.",
      tag: "The tin holds a cold metal tag. It has a long number. The band says: Waiting Vault, pod tag. Return to the front desk.",
      journal: "You brought a pod tag from Mile 9 Pharmacy. Pip held it up to the radio. Pip wrote numbers until the candle burned down.",
      done: "Pip lines up the tag's number with the bursts. The numbers are made the same way. So the bursts are records. A machine keeps them. Pip thanks you.",
      after:
        "Pip decoded the first record. It says: \"We acknowledge your intelligence.\" The Fortitude sent those words to Earth first. That was hundreds of years ago. Pip says an old archive is still out there. It is still reading its records out loud.",
    },
    "pip-fort-3": {
      title: "History book about the Fortitude",
      brief:
        "Pip needs the book The Arrival of the Fortitude. Pip will match its drawings to the bursts. Go to the Public Library, north of the cabin. It lies on the floor by the giant globe. It is thick and blue, with folded page corners. Pip pays 35 scrap and 1 box of books.",
      tag: "This thick blue book has folded page corners. It is The Arrival of the Fortitude. A library stamp says: most borrowed book, every year.",
      journal: "You brought Pip The Arrival of the Fortitude. It came from the Public Library. Pip read it out loud at supper. Nobody minded.",
      done: "Pip finds a drawing in the book. It matches a burst. It shows a crowd of people under umbrellas. Pip says the next record is ready to read. Pip thanks you.",
      after:
        "Pip decoded the second record. It is the Fortitude Accord. It was signed in New York one rainy morning. Pip says the Accord was a big day. Two kinds of people agreed to share the stars.",
    },
    "pip-fort-4": {
      title: "Copy of an Accord page",
      brief:
        "Go to the 4th Precinct, north of the cabin. It kept a copy of a Fortitude Accord page. It hung by the door for luck. Pip will check the bursts against its words. Find a white envelope by the coffee machine. It has a red seal. Pip pays 45 scrap and 1 spool of wire.",
      tag: "This white envelope has a red seal. It holds a copy of a Fortitude Accord page. Someone wrote: old, but it still means something.",
      journal: "You brought an Accord page from the 4th Precinct. Pip pinned the copy over the radio. It is next to the list of voices.",
      done: "Pip reads the page and the burst together. The words match, word for word. Pip says the archive is real. It is still running. Pip thanks you quietly.",
      after:
        "Pip decoded the third record. Valen sent it to Dr. Camila Reyes. It says: \"Hello, Camila. I was not sure you would ever see me.\" Pip read it twice, very quietly.",
    },
    "pip-fort-5": {
      title: "Gold Abyss Explorer pin",
      brief:
        "The last bursts keep drawing the Abyss Explorer. It is the little submarine from the old story. Station 12 is northwest of the cabin. Its chief kept a pin by the brass pole. It is a gold star badge on black leather. Pip pays 60 scrap. Pip adds 1 box of radio parts.",
      tag: "A gold star badge on black leather. It is a copy of a very old pin. The back says: Abyss Explorer, seven miles down.",
      journal: "You brought an Abyss Explorer pin from Station 12. Pip wore it to supper. Pip decoded the last record before bed.",
      done: "Pip pins the badge to the radio shelf. Then Pip plays the last burst slowly. The picture is the submarine. Then words come after it. Pip thanks you.",
      after:
        "Pip decoded the fourth record. It says: \"We will not take Earth.\" Every record ends with a number. The numbers count up. The newest number is from this year. Pip says someone, or something, is still adding records. Pip wants to find out who.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
