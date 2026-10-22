/* Reading level 4: the Fortitude (Earth, hundreds of years after Book 4) crossover universe. June's ledger lines and the radio (T.universe.fortitude), and the
   crew's words for this universe's topics and quests (merged into T.crew). Facts: js/story-fortitude.js.
   Design: docs/UNIVERSES.md; rules for the words: docs/TEXT_GUIDE.md. Shown only while Settings: Universe is on. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[4] = root.ZSR.TEXT[4] || { level: 4 });
  T.universe = T.universe || {};
  T.crew = T.crew || {};

  T.universe.fortitude = {
    journal: [
      { title: "A Scratch on the Sky", text: "Tonight I showed Pip the thin silver line across the sky. Pip thought it was a scratch on the window and rubbed at the glass with a sleeve. It is the old shipyard ring, built hundreds of years ago. They made it from a black metal called Indestructium. “June, someone drew on the night with a pencil,” Pip said." },
      { title: "The Vault Across the River", text: "Across the river stands the Waiting Vault. People slept there in cold pods to skip ahead to a better time. I never trusted it, not even before the Fall. Pip asked me why. “Because a person should live their days, not skip them,” I said. That is June's rule, and I stand by it. The hard days come with the good ones, and you need both to grow." },
      { title: "The Lesson Everyone Knows", text: "Every school on Earth teaches the story of Dr. Camila Reyes, who saw the Fortitude fleet first. Pip can name the whole team without a pause: Zoe, Kennedy, Ava, Patriya and Annabelle. I said that was hundreds of years ago. “June, it feels close,” Pip said. Some nights it does, like a story a neighbor told over the fence." },
      { title: "The First Week", text: "I tried to write down what I remember of the first week of the Fall. The alarms at the Waiting Vault rang across the river for two days. We heard them all over town, thin and endless. Then the sleepers walked out, and they were not right. I do not like to write about it. Tomas says June has earned a rest from that page, so I will stop there." },
      { title: "Nine Feet Tall", text: "Pip asked me what a Fortitude looks like. I described the picture of Valen in my old school book. Valen stood nine feet tall, with four arms and two big dark eyes. Pip went quiet, then asked if Valen was kind. I said Valen was the Fortitude who learned the words help, thank you and together. “Good answer, June,” Pip said." },
      { title: "Learning With Gloves On", text: "Tomas burned his hand on the van's engine today, not badly. I wrapped it in a cool, wet cloth. Then I told him the old saying from the story of the Fortitude. If you stop failing, you stop learning. Tomas thought about it for a while. He said, “June, I would rather learn with gloves on.” Fair enough." },
      { title: "A Bright Point Low", text: "On clear nights Mars shows as a bright point low in the sky. June's version, for the record: the Fortitude live there, on the world that was chosen for them. That way, Earth could stay ours. I told Pip so. Pip sat on the porch steps until supper. “June, I wonder if a Fortitude kid is looking back at us,” Pip said." },
      { title: "Going Down Anyway", text: "Pip found a picture of the Abyss Explorer, the little silver submarine that dove seven miles down. Its crew brought up the first piece of Indestructium. Pip studied that picture for an hour without a word. Then Pip announced that being brave is just going down anyway. I have heard worse rules to live by." },
    ],
    radio: [
      { title: "Jo and the Clicks", text: "This is Jo on 88.1, and tonight I am not alone on this channel. Listen under my voice. Hear that? Fast clicks, like a machine reading numbers. They have come every few days since the Fall. At first I thought my old transmitter was falling apart. It is not. Nobody knows who sends them. I will keep listening, and so should you. Jo out." },
      { title: "Counting Out Loud", text: "Jo here on 88.1. Last night I counted the clicks out loud, so you can follow along. 1, 2, 3, then 5, then 8. Then a pause, and the pattern starts again. It sounds like math, not talk. Whoever sends it is careful and patient. If anyone out there knows old codes, please listen tonight. Write down what you hear, and keep it safe." },
      { title: "Bursts That Make Pictures", text: "This is Jo on 88.1, reading from an old book I keep on my rooftop shelf. The book says the Fortitude talk in bursts of math that make pictures. Their language has no word for maybe, please, help, together or friend. Think about that for a second. Now listen to the bursts on 88.1 tonight. They sound just like that. I am not saying what it means. I am only saying it." },
      { title: "The Accord Archive", text: "Jo on 88.1, with something new. A listener stopped by today and said they remember the Accord Archive. It was a machine that kept the records of the Fortitude Accord. Nobody knows where it is now, or if it still runs. Maybe it is buried. Maybe it is humming away in some basement. Either way, the clicks came again tonight, right on time. Jo out." },
      { title: "Say Hello", text: "This is Jo, and the bursts are getting longer. Last week they lasted a few seconds. Tonight one ran for almost a minute. So I tried something new. I asked whoever sends them to say hello in plain words. I said it slowly, twice, and waited with my hand on the dial. Only clicks came back. Well, I tried. Jo on 88.1, signing off." },
      { title: "Good Company", text: "Jo on 88.1, late and quiet. I keep thinking about those clicks. A machine that keeps records for hundreds of years must have someone looking after it. Or it is very well built. I honestly do not know which answer I like better. Either way, it is good company on a quiet night. So if you are awake, listen in with me. Jo out." },
    ],
  };

  T.crew.talk = Object.assign(T.crew.talk || {}, {
    "june-fort-t1": {
      title: "Live Your Days",
      text: "June looks toward the river, where the Waiting Vault stands. She never trusted it. People slept there in cold pods to skip ahead to a better time. “A person should live their days, not skip them,” June says. Then she nods at the big bed in the cabin. It heals you fully, she says, but it takes time. Some things should not be skipped or rushed.",
    },
    "june-fort-t2": {
      title: "Stop Failing, Stop Learning",
      text: "June says her school taught an old saying: if you stop failing, you stop learning. It comes from the story of Dr. Camila Reyes and her team, hundreds of years ago. June has always liked it, because gardens teach the same thing. Then she makes it practical. A wrong key can jam a stash lock, she says. If that happens, a crowbar from the workbench pries it open.",
    },
    "tomas-fort-t1": {
      title: "Metal That Will Not Bend",
      text: "Tomas says the black metal in old reactor plates is Indestructium. It cannot be bent, burned or broken. Kennedy, the engineer on Dr. Camila Reyes's team, gave it that name. Tomas wishes he could build a van out of it. Until then, he says, build the Walls room. It makes the fence stronger and gives you and the van more health.",
    },
    "tomas-fort-t2": {
      title: "A Good Fix Is Slow",
      text: "Tomas tells you about the first fusion reactor in the old story. It ran for 10 seconds before a coil failed. Kennedy was burned, and the team learned to stop rushing. “A good fix is a slow fix,” Tomas says, wiping his hands on a rag. He has one more slow fix in mind. Once the Garage room is built, he says, the van comes home fixed for free.",
    },
    "tomas-fort-t3": {
      title: "A Famous Last Name",
      text: "Tomas grins when he talks about Mr. Reyes of Reyes Hardware. Mr. Reyes tells everyone who will listen that his family goes back to Dr. Camila Reyes. She lived hundreds of years ago, so nobody can prove it either way. Tomas does not mind at all. He likes the story, true or not, and he would never ask Mr. Reyes for proof. Then he gets practical. Reyes Hardware, he says, is the place to find lumber and nails.",
    },
    "pip-fort-t1": {
      title: "The Whole Team",
      text: "Pip can name Dr. Camila Reyes's whole team. Pip counts them off on their fingers: Zoe, Kennedy, Ava, Patriya and Annabelle. Valen was the Fortitude who answered their messages. Valen learned the words help, thank you and together. Pip thinks those are the best words anyone ever learned. Then Pip gets serious. Read every note to the end, Pip says, because some notes in town are old or wrong.",
    },
    "pip-fort-t2": {
      title: "Listening Like Ava",
      text: "Pip read that the Fortitude talk in bursts of math that make pictures. Long ago, Ava learned their language by listening to the patterns of ocean waves. Pip thinks that is amazing, because waves never hold still. Pip has been practicing on the wind in the trees. Once the Radio room is built, Pip says, Pip listens for strange bursts every few days. Pip keeps a pencil ready, just in case.",
    },
  });

  T.crew.quests = Object.assign(T.crew.quests || {}, {
    "pip-fort-1": {
      title: "Boom box with a tape deck",
      brief: "Pip wants to record the bursts on the radio and play them back slowly. Fast clicks are hard to count, Pip says, but slow ones might show a pattern.\n\nGas-N-Go is west of the cabin. An old boom box with a tape deck sits on the floor by the ice machine. It has two speakers, a dial and an antenna. Pip will give you 20 scrap and 1 box of books.",
      tag: "A boom box with two speakers, a dial and an antenna. A tape is still inside. Someone wrote on its label: road trip songs, side A.",
      journal: "You brought Pip a boom box from Gas-N-Go. Pip recorded the bursts over the road trip songs and played them back slowly all evening. I miss the songs a little.",
      done: "Pip sets the boom box beside the radio and records a burst. Then Pip plays it back slowly, very slowly. Each click becomes a dot, and Pip marks every dot on paper. The dots start to make a shape. Pip turns the paper around twice and grins. Pip thanks you and says this is the first real clue.",
      after: "Pip says the bursts are pictures, just like the old books said. Played slowly, one burst draws a sleeping pod, long and rounded. Pip wants something real to compare it with, side by side. Pip says a pod tag from the Waiting Vault would help. Every pod had a tag with a number on it. Pip has already cleared a spot on the radio shelf.",
    },
    "pip-fort-2": {
      title: "Tin with a pod tag",
      brief: "Someone brought a metal tag from a Waiting Vault pod to Mile 9 Pharmacy. Pip wants to compare its numbers with the bursts, line by line. Pip thinks the tag could be the key to the whole code.\n\nMile 9 Pharmacy is northwest of the cabin. A red tin with a white paper band lies on the floor by the pill bottle. The tag is inside the tin. Pip will give you 30 scrap and 1 medical kit.",
      tag: "A red tin with a white paper band. Inside is a cold metal tag stamped with a long number. The band says: Waiting Vault, pod tag, return to the front desk.",
      journal: "You brought Pip a pod tag from Mile 9 Pharmacy. Pip held it up to the radio and wrote numbers until the candle burned down. I lit another one.",
      done: "Pip lines up the tag's number with the numbers in the bursts, one digit at a time. It takes a long while. Then Pip sits back with wide eyes. The tag and the bursts are made the same way, Pip says. The bursts are not someone talking. They are records, kept by a machine. Pip thanks you twice, once for the tin and once for the answer.",
      after: "Pip decoded the first record. It says: “We acknowledge your intelligence.” Those were the first words the Fortitude ever sent to Earth, hundreds of years ago. Pip learned them in school, like everyone. Hearing them on the radio is different, Pip says. Pip says somewhere an old archive is still reading its records out loud.",
    },
    "pip-fort-3": {
      title: "History book about the Fortitude",
      brief: "Pip needs the old history book The Arrival of the Fortitude. Pip wants to match the pictures in the bursts to the drawings in the book. Pip says every picture needs a name.\n\nThe Public Library is north of the cabin. The book lies on the floor beside the giant globe. It is a thick blue book with folded page corners. Pip will give you 35 scrap and 1 box of books.",
      tag: "A thick blue book with folded page corners: The Arrival of the Fortitude. A library stamp inside says: most borrowed book, every year. The spine is cracked from use.",
      journal: "You brought Pip The Arrival of the Fortitude from the Public Library. Pip read it out loud at supper, and nobody minded. Tomas even asked for one more chapter.",
      done: "Pip turns the pages slowly, holding a burst drawing beside each picture. Halfway through, Pip stops. One drawing matches a burst: a crowd of people under umbrellas. The match is so close that Pip checks it three times. Then Pip thanks you and taps the page. Pip says the next record is ready to read.",
      after: "Pip decoded the second record. It is the Fortitude Accord, signed in New York on a rainy morning. That explains the umbrellas, Pip says. Pip says the Accord was the day two kinds of people agreed to share the stars. Then Pip reads the record again, more slowly, as if the words might change. They do not.",
    },
    "pip-fort-4": {
      title: "Copy of an Accord page",
      brief: "The 4th Precinct kept a copy of a page of the Fortitude Accord. It hung framed by the door, for luck. Pip wants to check the bursts against the real words.\n\nThe 4th Precinct is north of the cabin. The page is in a white envelope with a red seal. It lies on the floor by the coffee machine. Pip will give you 45 scrap and 1 spool of wire.",
      tag: "A white envelope with a red seal. Inside is a copy of a page of the Fortitude Accord. Someone wrote on the envelope: old, but it still means something.",
      journal: "You brought Pip a copy of an Accord page from the 4th Precinct. Pip pinned it over the radio, next to the list of voices. It looks like it belongs there.",
      done: "Pip reads the Accord page out loud while the burst plays slowly. The words on the page match the burst word for word. Pip goes very still, then grins. The archive is real, Pip says, and it is still running. Pip thanks you and holds the page up so the whole yard can see it.",
      after: "Pip decoded the third record: a message from Valen to Dr. Camila Reyes. It says: “Hello, Camila. I was not sure you would ever see me.” Pip read it twice, very quietly. Pip says some messages wait a long time for someone to hear them. This one waited hundreds of years, and Pip is glad it did not wait for nothing.",
    },
    "pip-fort-5": {
      title: "Gold Abyss Explorer pin",
      brief: "The last bursts keep drawing one shape: the Abyss Explorer, the little submarine from the old story. Pip wants to hold a piece of that story.\n\nStation 12's chief kept an Abyss Explorer pin by the brass pole. Station 12 is northwest of the cabin. The pin is a gold badge with a star, on a black leather fold. Pip will give you 60 scrap and 1 box of radio parts.",
      tag: "A gold badge with a star, on a black leather fold. Stamped on the back: Abyss Explorer, seven miles down. It is a keepsake copy of a very old pin.",
      journal: "You brought Pip an Abyss Explorer pin from Station 12. Pip wore it to supper and decoded the last record before bed. The pin stayed on all night.",
      done: "Pip pins the badge to the radio shelf and plays the last burst slowly. Dot by dot, the picture comes in: the little submarine, diving. Then the dots change, and there are words. Pip writes them down without saying a thing. Then Pip thanks you and holds up the paper so you can read it too.",
      after: "Pip decoded the fourth record: “We will not take Earth.” Every record ends with a number that counts up. The newest number is from this year. Pip says someone, or something, is still adding records. Pip wants to find out who. There is a new list on the wall now, with one big question mark at the top.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
