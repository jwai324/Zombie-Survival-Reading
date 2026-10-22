/* Reading level 5: the Fortitude (Earth, hundreds of years after Book 4) crossover universe. June's ledger lines and the radio (T.universe.fortitude), and the
   crew's words for this universe's topics and quests (merged into T.crew). Facts: js/story-fortitude.js.
   Design: docs/UNIVERSES.md; rules for the words: docs/TEXT_GUIDE.md. Shown only while Settings: Universe is on. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[5] = root.ZSR.TEXT[5] || { level: 5 });
  T.universe = T.universe || {};
  T.crew = T.crew || {};

  T.universe.fortitude = {
    journal: [
      { title: "A Scratch on the Sky", text: "After supper I showed Pip the thin silver line across the sky, faint as a hair on a lens. Pip thought it was a scratch on the window and tried to polish it away with a sleeve. It is the old shipyard ring, built hundreds of years ago from a black metal called Indestructium. “June, it never moves,” Pip said. Neither do the things built to last." },
      { title: "The Vault Across the River", text: "Across the river stands the Waiting Vault, where people slept in cold pods to skip ahead to a better time. I never trusted it, even when the posters made it look like a holiday. A person should live their days, not skip them. That is June's whole philosophy, and it fits on a seed packet. The hard seasons are part of the harvest." },
      { title: "The Lesson Everyone Knows", text: "Every school on Earth teaches the story of Dr. Camila Reyes, who saw the Fortitude fleet first. Pip can name the whole team the way other kids name ball players: Zoe, Kennedy, Ava, Patriya and Annabelle. I reminded Pip that it was hundreds of years ago. “June, it doesn't feel that long,” Pip said. Some nights, sitting under the stars, it doesn't feel that long to me either." },
      { title: "What I Remember", text: "I sat down tonight to write what I remember of the first week of the Fall. The alarms at the Waiting Vault rang across the river for two days. They were high and thin, like a kettle nobody would take off the stove. Then the sleepers walked out, and they were not right. I do not like to write about it. Even June has her limits, so I stopped there." },
      { title: "Nine Feet Tall", text: "Pip asked me what a Fortitude looks like, so I described the picture of Valen in my old school book. Valen was nine feet tall, with four arms and two big dark eyes, like wells you could fall into. Pip looked worried until I told the best part. Valen was the Fortitude who learned the words help, thank you and together. “June, that's three good words,” Pip said. Four, if you count properly." },
      { title: "Learning With Gloves On", text: "Tomas burned his hand on the van's engine today, not badly, but enough to make him hop around the yard. While I wrapped it, I told him the old saying from the Fortitude story. If you stop failing, you stop learning. Tomas considered this with great dignity. “June, I would rather learn with gloves on,” he said. Honestly, so would I." },
      { title: "A Bright Point Low", text: "On clear nights Mars shows as a bright point low in the sky, steady while the stars around it flicker. Here is June's history lesson, as I gave it to Pip. The Fortitude live there, on the world that was chosen for them, so Earth could stay ours. A fair trade made by people who had every reason not to trust each other. Pip wonders if a Fortitude kid is looking back at us." },
      { title: "Going Down Anyway", text: "Pip found a picture of the Abyss Explorer, the little silver submarine that dove seven miles down into the dark. Its crew brought up the first piece of Indestructium, which means the whole shipyard ring began at the bottom of the sea. Pip thought about that for a long time. Then Pip said being brave is just going down anyway. I have heard grown-ups say it worse." },
    ],
    radio: [
      { title: "Jo and the Clicks", text: "This is Jo on 88.1, and if you turn your volume up, you will hear I have company. Under my voice there are fast clicks, like a machine reading numbers to itself. They have come every few days since the Fall, steady as a dripping tap. At first I blamed my old transmitter, which deserves plenty of blame. Not this time, though. Nobody knows who sends them. I would very much like to. Jo out." },
      { title: "Counting Out Loud", text: "Jo here on 88.1. Last night I sat with a pencil and counted the clicks out loud, so tonight you can count with me. 1, 2, 3, then 5, then 8. Then silence, and the whole thing starts over, as neat as a heartbeat. It sounds like math, not talk, and math does not happen by accident. If anyone out there knows old codes, please listen. Write down what you hear and tell me what you think." },
      { title: "Bursts That Make Pictures", text: "This is Jo on 88.1, and tonight I am reading from an old book that has been propping up my table leg. It deserves better. The book says the Fortitude talk in bursts of math that make pictures. Their language has no word for maybe, please, help, together or friend. Imagine a language with no please in it. Now listen to the bursts on 88.1 tonight. They sound just like that. I will let you draw your own conclusions." },
      { title: "The Accord Archive", text: "Jo on 88.1. A listener walked up to my building today and shouted something interesting at the door. They remember the Accord Archive, a machine that kept the records of the Fortitude Accord. Nobody knows where it is, or if it still runs. It could be rusting in a field, or humming in a basement under our feet. Either way, the clicks came again tonight, right on time, the way they always do. Jo out." },
      { title: "Say Hello", text: "This is Jo, and the bursts are getting longer. A week ago they were a few seconds, like someone clearing their throat. Tonight one ran close to a minute, like someone about to make a speech. So I leaned into the microphone and asked whoever sends them to say hello in plain words. I asked nicely, twice. Then I waited with my hand on the dial. Only clicks came back. Jo on 88.1, mildly offended." },
      { title: "Good Company", text: "Jo on 88.1, late enough that the city sounds like it is holding its breath. I keep turning those clicks over in my head. A machine that keeps records for hundreds of years must have someone looking after it. Or it is very well built, the way old bridges are. I cannot decide which answer I like more. Either way, it is good company on a quiet night. Stay up with me a while. Jo out." },
    ],
  };

  T.crew.talk = Object.assign(T.crew.talk || {}, {
    "june-fort-t1": {
      title: "Live Your Days",
      text: "June looks across the river toward the Waiting Vault, and her mouth goes thin. She never trusted it. People slept there in cold pods to skip ahead to a better time. To June, that is like flipping to the end of a book. “A person should live their days, not skip them,” June says. Then she points at the big bed in the cabin. It heals you fully, she says, but it takes time, so let it.",
    },
    "june-fort-t2": {
      title: "Stop Failing, Stop Learning",
      text: "June says her school taught an old saying: if you stop failing, you stop learning. It comes from the story of Dr. Camila Reyes and her team, hundreds of years ago. It has outlived every teacher who ever chalked it on a board. June believes it, because every garden she ever grew started with mistakes. Then she gets practical. A wrong key can jam a stash lock, she says, and a crowbar from the workbench pries it open.",
    },
    "tomas-fort-t1": {
      title: "Metal That Will Not Bend",
      text: "Tomas says the black metal in old reactor plates is Indestructium, and he says the name like a prayer. It cannot be bent, burned or broken. Kennedy, the engineer on Dr. Camila Reyes's team, gave it that name. Tomas wishes he could build a van out of it, because then he could finally sleep through a wave. Until then, he says, build the Walls room. It makes the fence stronger and gives you and the van more health.",
    },
    "tomas-fort-t2": {
      title: "A Good Fix Is Slow",
      text: "Tomas tells you about the first fusion reactor in the old story. It ran for 10 seconds before a coil failed, and Kennedy was burned. After that, the team learned to stop rushing. “A good fix is a slow fix,” Tomas says, and he looks at his own healing hand when he says it. Then he brightens, because he has a slow fix of his own planned. Once the Garage room is built, he says, the van comes home fixed for free.",
    },
    "tomas-fort-t3": {
      title: "A Famous Last Name",
      text: "Tomas grins when Mr. Reyes of Reyes Hardware comes up. Mr. Reyes tells everyone who will stand still long enough that his family goes back to Dr. Camila Reyes. She lived hundreds of years ago, so nobody can prove it either way; that trail went cold centuries back. Tomas does not mind. He likes the story, true or not, and he would sooner fix a leaky roof than ask Mr. Reyes for proof. Then he gets practical. Reyes Hardware, he says, is the place to find lumber and nails.",
    },
    "pip-fort-t1": {
      title: "The Whole Team",
      text: "Pip can name Dr. Camila Reyes's whole team and does so at the slightest excuse: Zoe, Kennedy, Ava, Patriya and Annabelle. Valen was the Fortitude who answered their messages. Valen learned the words help, thank you and together, which Pip considers the most important vocabulary list in history. Then Pip turns practical. Read every note to the end, Pip says, because some notes in town are old or wrong. A half-read note is worse than none.",
    },
    "pip-fort-t2": {
      title: "Listening Like Ava",
      text: "Pip read that the Fortitude talk in bursts of math that make pictures. Long ago, Ava learned their language by listening to the patterns of ocean waves. Pip finds that almost unbelievable, since waves never repeat exactly. Pip has started practicing on the wind and the creek. Once the Radio room is built, Pip listens for strange bursts every few days. Pip says the trick is patience: a pattern only shows itself to someone who stays long enough to see it.",
    },
  });

  T.crew.quests = Object.assign(T.crew.quests || {}, {
    "pip-fort-1": {
      title: "Boom box with a tape deck",
      brief: "Pip wants to record the bursts on the radio and play them back slowly. At full speed the clicks blur together like rain on a roof, Pip says. Slowed down, they might turn into something you can count. Pip has tried counting them live and lost track every time.\n\nGas-N-Go is west of the cabin. An old boom box with a tape deck sits on the floor by the ice machine. It has two speakers, a dial and an antenna, so it is hard to miss. Pip will give you 20 scrap and 1 box of books.",
      tag: "A boom box with two speakers, a dial and an antenna, and a tape still inside. Someone wrote on the tape in marker: road trip songs, side A. The batteries are flat, but Tomas can fix that.",
      journal: "You brought Pip a boom box from Gas-N-Go. Pip recorded the bursts over the road trip songs and played them back slowly all evening. Tomas mourned the songs, loudly and at length.",
      done: "Pip records a burst on the boom box and plays it back slowly. Each click lands like a single raindrop on a tin roof. Each click becomes a dot on Pip's paper. Row by row, the dots start to make a shape, the way stars become a picture once you connect them. Pip thanks you without looking up from the page. Pip says this is the moment the noise turned into a clue.",
      after: "Pip says the bursts are pictures, just like the old books said, and Pip has the proof on paper. Played slowly, one burst draws a sleeping pod, long and rounded, like a seed in its shell. A shape is only a guess, though, until you have something to compare it with. So Pip says a pod tag from the Waiting Vault would help. Pip has already cleared a space for it on the radio shelf.",
    },
    "pip-fort-2": {
      title: "Tin with a pod tag",
      brief: "Someone brought a metal tag from a Waiting Vault pod to Mile 9 Pharmacy, maybe to ask about the sleepers. Pip wants to compare its numbers with the bursts. If they match, Pip says, then the bursts are not random at all. They would be a record of something real, kept on purpose by someone careful.\n\nMile 9 Pharmacy is northwest of the cabin. A red tin with a white paper band lies on the floor by the pill bottle, with the tag inside. Pip will give you 30 scrap and 1 medical kit.",
      tag: "A red tin with a white paper band. Inside is a cold metal tag stamped with a long number, chilly even in a warm hand. The band says: Waiting Vault, pod tag, return to the front desk.",
      journal: "You brought Pip a pod tag from Mile 9 Pharmacy. Pip held it up to the radio and wrote numbers until the candle burned down to a puddle. I lit another and went to bed.",
      done: "Pip lines up the tag's number with the numbers in the bursts, one digit at a time, lips moving silently. It takes most of an hour. Then Pip sits back with the look of someone who just found the last puzzle piece under the couch. The tag and the bursts are made the same way, Pip says. That means the bursts are records, kept by a machine. Pip thanks you twice, once for the tin and once for the answer.",
      after: "Pip decoded the first record, and reads it to you in a hushed voice. It says: “We acknowledge your intelligence.” Those were the first words the Fortitude ever sent to Earth, hundreds of years ago. Every kid learns them in school. But Pip says hearing them come out of a radio feels different, like finding a letter addressed to you. Somewhere, Pip says, an old archive is still reading its records out loud.",
    },
    "pip-fort-3": {
      title: "History book about the Fortitude",
      brief: "Pip needs the old history book The Arrival of the Fortitude, to match the bursts' pictures to its drawings. A picture without a caption is only half a message, Pip says, and the book has the captions. Pip borrowed it once at school and never forgot it.\n\nThe Public Library is north of the cabin. The book lies on the floor beside the giant globe. It is a thick blue book with folded page corners, the kind of book that has been loved hard. Pip will give you 35 scrap and 1 box of books.",
      tag: "A thick blue book with folded page corners: The Arrival of the Fortitude. A library stamp inside says: most borrowed book, every year. Its spine has been opened so often it falls open on its own.",
      journal: "You brought Pip The Arrival of the Fortitude from the Public Library. Pip read it out loud at supper, and nobody minded. Tomas pretended not to listen and then asked what happened next.",
      done: "Pip spreads the burst drawings across the floor and pages through the book beside them, matching shapes like a detective comparing fingerprints. Near the middle, Pip freezes. One drawing in the book matches a burst exactly: a crowd of people under umbrellas. Pip checks it three times, then thanks you with a grin that takes up most of their face. Then Pip checks it a fourth time. Pip says the next record is ready to read.",
      after: "Pip decoded the second record. It is the Fortitude Accord, signed in New York on a rainy morning, which explains the umbrellas. Pip says the Accord was the day two kinds of people agreed to share the stars. Imagine two strangers shaking hands in the rain, Pip says, except one of them came from another world. Then Pip reads the record again, slower, as though it were a recipe worth memorizing.",
    },
    "pip-fort-4": {
      title: "Copy of an Accord page",
      brief: "The 4th Precinct kept a copy of a page of the Fortitude Accord, framed by the door, for luck. Pip wants to check the bursts against the real words, because a decoder that is never checked is just a guesser. Pip would rather be right than fast, and June agrees with that completely.\n\nThe 4th Precinct is north of the cabin. The page is in a white envelope with a red seal, on the floor by the coffee machine. Pip will give you 45 scrap and 1 spool of wire.",
      tag: "A white envelope with a red seal. Inside is a copy of a page of the Fortitude Accord, the paper soft from handling. Someone wrote on the envelope: old, but it still means something.",
      journal: "You brought Pip a copy of an Accord page from the 4th Precinct. Pip pinned it over the radio, next to the list of voices. It looks like a window up there.",
      done: "Pip lays the Accord page beside the radio and plays the burst slowly, following each line with a finger. The words on the page match the burst word for word, like a key sliding into its own lock. For a moment Pip says nothing at all. Then Pip thanks you, voice a little shaky. The archive is real, Pip says, and it is still running, somewhere out there in the dark.",
      after: "Pip decoded the third record: a message from Valen to Dr. Camila Reyes, sent hundreds of years ago. It says: “Hello, Camila. I was not sure you would ever see me.” Pip read it twice, very quietly, the way people read old letters. Pip says it is strange to feel sad and happy about the same sentence, but that is how it feels. Then Pip folds the paper carefully and keeps it close.",
    },
    "pip-fort-5": {
      title: "Gold Abyss Explorer pin",
      brief: "The last bursts keep drawing one shape: the Abyss Explorer, the little submarine from the old story. Pip thinks the archive is pointing at something, and wants a piece of that story close by while decoding. Pip says it would be like having the crew of the submarine in the room.\n\nStation 12's chief kept an Abyss Explorer pin by the brass pole. Station 12 is northwest of the cabin. The pin is a gold badge with a star, on a black leather fold. Pip will give you 60 scrap and 1 box of radio parts.",
      tag: "A gold badge with a star, on a black leather fold, the leather creased from years in a pocket. Stamped on the back: Abyss Explorer, seven miles down. It is a keepsake copy of a very old pin.",
      journal: "You brought Pip an Abyss Explorer pin from Station 12. Pip wore it to supper and decoded the last record before bed. I found Pip asleep at the radio with the pin still on.",
      done: "Pip pins the badge to the radio shelf, where the candlelight catches it, and plays the last burst slowly. Dot by dot, the picture rises like the submarine itself coming up from the deep. Then the dots change, and there are words. Pip copies them down without a sound. Pip thanks you, then turns the paper around so you can see it, as if it were too big to read alone.",
      after: "Pip decoded the fourth record: “We will not take Earth.” Every record ends with a number that counts up, like pages in a diary, and the newest number is from this year. That changes everything, Pip says. Someone, or something, is still adding records. Pip wants to find out who. There is a fresh page in Pip's notebook now, with one enormous question mark at the top and nothing else yet.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
