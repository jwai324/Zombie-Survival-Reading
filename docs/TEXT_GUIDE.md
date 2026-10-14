# Text Guide (six reading levels)

Every player-facing in-world text exists at six reading levels in `js/content/` (five
files per level, see Schema). The facts come from `js/world.js` (`NOTES`, `BASE_ROOMS`,
`ITEMS`, `LOCATIONS`, `KEYS`), `js/story.js` (extra notes, signs, keys),
`js/story-home.js` (`JOURNAL`, `RADIO`, `ITEM_TAGS`, `YARD_LOTS`), `js/story-crew.js`
(`CREW_TALK`, `CREW_TIPS`, `CREW_REPORTS`, `ERRANDS`) and `js/story-quests.js` (`QUESTS`, `DOG`).
A level file changes the words, never the facts. Run `npm test` after editing.

## Audience

The game is for teens. The reader is a teen who reads at the given level. "High
interest, low readability": tense, grounded survival writing in short, simple sentences
at the low levels; the same world in fuller sentences at the high levels. Never cute,
never a picture book, never talking down. No gore, no on-page deaths, no profanity.

## Calibration

Notes got longer and more numerous in the reading expansion (2026-10-13): every level now
carries at least four times the in-world reading it had before (`npm test` enforces it; the
crew's words count toward it like every other in-world text).

| Level | Note (words) | Max sentence | Sign | Tag | Lot sign | Journal / radio | Dead-end notes per building |
|-------|--------------|--------------|------|-----|----------|-----------------|-----------------------------|
| 1 | 65 to 130 | 9 | 6 to 22 | 10 to 24 | 20 to 48 | 25 to 55 | 2 |
| 2 | 80 to 120 | 10 | 8 to 26 | 14 to 30 | 30 to 62 | 35 to 72 | 2 |
| 3 | 110 to 160 | 14 | 10 to 32 | 18 to 36 | 40 to 82 | 50 to 95 | 2 |
| 4 | 150 to 210 | 18 | 12 to 40 | 22 to 44 | 55 to 100 | 70 to 125 | 3 |
| 5 | 190 to 260 | 22 | 15 to 46 | 26 to 52 | 70 to 120 | 90 to 150 | 3 |
| 6 | 230 to 320 | 26 | 18 to 56 | 30 to 62 | 85 to 140 | 110 to 185 | 4 |

Vocabulary: level 1 one or two syllables, sight words, present tense, and always complete
sentences (see "Level 1: whole thoughts" below); level 2 simple past is
fine; level 3 a few compound sentences; level 4 richer vocabulary, paragraphs; level 5
figurative language, cause and effect; level 6 sophisticated vocabulary, voice, subtext.

Door notes run about 75 percent of the note range; the main note (the one that opens the
cache) may run up to 20 percent over it, since it also carries a route by landmark. "Sign"
covers wall signs and graffiti;
"Tag" covers item tags and key tags. How it works paragraphs follow the same sentence limits;
three to seven paragraphs at every level (one of them is about the crew, see "The crew's words"),
and the `controls` list (one line per control group, "Head: text") is written at the level too.

Dead-end notes are placed by reading level (`minLevel` in `js/story.js`): `dead1` and `dead2`
(the lock decoy) at every level, `dead3` from level 4, `dead4` at level 6. A level file writes only
the notes its level places. Higher readers get more to sort through, including decoys: notes
that look useful but are wrong or out of date. Judging what matters is part of reading.

## What every text must do

Facts live in `js/world.js` (structure: items, rooms, layouts, the key ring), `js/story.js`
(the extra notes, signs and keys in every building) and `js/story-home.js` (journal, radio,
item tags, yard lots). The `facts` array of each is a checklist. Every fact must be present
at every level, in words a reader at that level can use. `npm test` checks numbers, people
(see `PEOPLE` in `tests/validate-text.js`) and place names against the facts.

- Who wrote it (name), because the player meets these people across notes.
- Where things are, in words that match the building, since the player will walk there.
  Every building has four landmarks (named in `js/layouts.js`, one per corner), rooms with
  their own signs, and walls with readable signs. Door notes name at least two landmarks and
  may use left and right as seen walking in. Inside a building a reader may be facing any
  way, so the main note and the trail notes steer by landmarks, rooms and signs ("beside the
  tire tower", "in the break room", "under the PHARMACY sign"), never "left of" or "right of";
  each names at least one landmark (`npm test` checks).
- How to open the cache, when the note has `unlocks`, exactly as `WORLD.LOCKS` works it, and
  what a mistake costs. The answers are rolled per save, so the words carry placeholders that
  the game fills in: `{code}` `{codeSpoken}` `{move1}` `{move2}` `{moves}` `{pick}` `{button}`, and
  in decoys `{decoyCode}` `{decoyMoves}` `{decoyMove1}` `{decoyMove2}` `{decoyPick}` `{decoyButton}`.
  Copy each placeholder from the facts exactly, braces and all; never write a real code. Write
  around them so the sentence reads well whatever they become ({moves} is "lift, then pull";
  {pick} is "top drawer" or "red key"; {button} is a color: "press the {button} button").
  The warning is part of the fact: the reader must learn that a wrong code sets off the alarm,
  a wrong drawer is a deadly trap, a wrong move jams the lock (and a crowbar opens it), and so on.
- The lock decoy (`dead2`, every level) gives a wrong answer from a placeholder and, later in
  the note, a hint that it is out of date. A careful reader catches it; a skimmer pays.
- Which other place to try, when the note has `reveals`, with a direction (north,
  east, downtown, the hills) so the player can find it on the map.
- `trail1` says where `trail2` is; `trail2` says where the key is, what it looks like, names
  the stash (its `stashName`) and the place it opens, and warns what a wrong key does there.
  This note is the only place that ties a key to its stash: the key's own name and tag say
  how it looks, never what it opens, so the player has to remember or reread the note.
- Decoys read as believable; they are allowed to be wrong.

Door notes also give the walker count and rough positions. Keep numbers exact.

See `docs/STORY.md` for the people and the five story threads, and `js/layouts.js` for the
building maps (landmarks, rooms, note spots, signs, the stash and the key).

## Level 1: whole thoughts

Level 1 is short, not chopped. Every sentence is a complete sentence with a subject and a verb
("There were five walkers when Ruby counted.", not "Five walkers then."). Say why and what
next: join ideas with because, so, then, but, when. Use the full name of a thing the first time
("medical kit", not "med kit"). Say who is talking, where things are, and what to do, in that
order of need. If a fact needs two short sentences to be clear, use two; the note can run long.
Read every level 1 note aloud: if a first grader would ask "what does that mean?", rewrite it.

## The crew's words (`levelN-crew.js`)

June, Tomas and Pip talk in a comic speech bubble in the yard and the cabin (the yard keeps
running while it is open), ask favors on a short card, and thank you on it. Their words are
`T.crew` at every level; the facts are `js/story-crew.js` and `js/story-quests.js`, and the design
is `docs/CREW.md`. Pronouns at every level: June "she", Tomas "he", Pip "they/them", the dog "it".
The player is "you". A he or she word after Pip's name, in a sentence that names Pip and no other
person, is an error (it can only be Pip, or the dog); one in the next sentence, when that sentence
names nobody, gets a warning. An unnamed man or woman beside Pip would set it off: name them, or
give them a sentence of their own.

| Kind | Key in `T.crew` | One per | Length |
|------|-----------------|---------|--------|
| Talk | `talk[id] = { title, text }` | every `CREW_TALK` topic and mood id | text: Lot sign range |
| Tip | `tips[crew][tip]` | every tip id of each crew member in `CREW_TIPS` | Tag range |
| Report | `reports[key]` | every `CREW_REPORTS` key | Tag range |
| Story quest | `quests[id] = { title, brief, tag, journal, done, after }` | every `QUESTS` id (the dog quest has no `tag`) | brief: Journal range; done and after: Lot sign range; tag and journal: Tag range |
| Errand | `errands[id] = { title, brief, done }` | every `ERRANDS` id | brief and done: Tag range |
| The dog | `dog = { ask, named, pet }` | every `DOG.facts` key | Tag range |

Talk and errand titles are 2 to 6 words; a quest title, the object's name, is 1 to 6 ("Binoculars").
In words, by level (from the Calibration table):

| Level | Talk, quest done and after | Quest brief | Tips, reports, tags, journal lines, errands, dog |
|-------|----------------------------|-------------|--------------------------------------------------|
| 1 | 20 to 48 | 25 to 55 | 10 to 24 |
| 2 | 30 to 62 | 35 to 72 | 14 to 30 |
| 3 | 40 to 82 | 50 to 95 | 18 to 36 |
| 4 | 55 to 100 | 70 to 125 | 22 to 44 |
| 5 | 70 to 120 | 90 to 150 | 26 to 52 |
| 6 | 85 to 140 | 110 to 185 | 30 to 62 |

Where each one shows, so it reads well there:

- **The bubble** (E at a crew member; the yard keeps running): their report, then a tip, then a
  topic or a quest's payoff (`after`), one after another under their name.
- **The card** (E again; the yard waits): a quest or errand `brief` under its `title` ("I'll do
  it" / "Not now"), a `done` under its title with the reward line, the dog's `ask` and `named`.
- **The backpack** (Crew section): the `title`, the `brief` again ("Read it again"), a quest's
  `done` again once it is handed in. A quest title also runs inside the game's own lines ("give
  June the bag of sunflower seeds", "June asked you to find: Bag of sunflower seeds", a toast).
- **Elsewhere**: a quest `tag` when you pick the object up in a building; its `journal` line on the
  day page under June's journal; Pip's `wave` tip also as a toast before a wave; the dog's `pet`
  in its own bubble. Talk titles are kept for the crew files and not shown.

Every fact is in the words, as everywhere: numbers, people and places are checked. Beyond that:

- **Say who is talking.** Every talk text, tip, quest brief, thanks (`done`) and payoff (`after`),
  and errand brief and thanks names its speaker ("June says ..."), because the bubble shows a
  report, a tip and a topic one after another, and the backpack shows a brief on its own. Each of
  those texts must stand alone.
- **Level 1 in a bubble** is still whole sentences (see "Level 1: whole thoughts"): a subject and a
  verb in every sentence, every text ending with a period, a question mark or an exclamation mark.
  A bubble is not a place for fragments.
- **Talk is story and mood plus one useful thing.** The useful thing (a rule, a number, a place to
  try) is in the facts; keep it exact.
- **A quest brief says where**, so the reader can walk there: the place by name, its direction
  from the cabin as the facts give it ("east of the cabin"), the room sign as it is painted, in
  capitals at every level (SEAFOOD, STAFF ONLY: "parts" in "engine parts" sends nobody to the
  PARTS room), and the landmark by its name word for word ("fish tank"; "the" may change). Never
  "left of" or "right of" (inside, a reader may face any way). A street, if you name one, must be
  on the real route from the cabin to that place. The dog quest's brief says Pip's treats bring
  the dog along. The reward is promised the way the facts promise it, so it agrees with the card's
  "Reward:" line: "20 scrap", and each item's count with its noun ("1 seed packet", "two bags of
  soil": a digit, or a number word up to ten).
- **A quest title is the object's name** ("Bag of sunflower seeds", "Rosa's jar of beans"), because
  the game runs it inside other lines ("give June the bag of sunflower seeds"): no "the", "a" or
  "an" at the start, no end mark, and not starting with a person's name, a whole place name or a
  word in capitals (the game lowercases the first letter) unless the first word is a possessive
  with a straight apostrophe ("Rosa's ...", never "Rosa’s ..."). The dog quest's title is free ("A
  dog for Pip").
- **The crew never** give a lock answer, name a stash, or name a place the player may not know
  yet: crew words name only the places their facts name, the places known at the start, for a
  quest the places of the giver's earlier quests, and for a topic the place its `when` sent you
  to (a note read there, a quest done there). A topic's title may name what its text may.
- **People**, the same way: a crew text names the people its facts name (for a quest, the facts
  of any of its texts and of the giver's earlier quests), the crew, and the people of the cabin's
  wall notes (the Hollis family).
  Anyone else gets a warning: the player may not have heard of them yet (a person out in town
  comes up no earlier than June's journal brings them up; see `js/story-crew.js`).
- **Nobody is harmed on the page.** No gore and no bite ("bitten", "infected": both errors); nobody
  dies; the crew are hurt off-screen ("got hurt", never more; words of death and wounds get a
  warning to look again); the dog is never hurt. No profanity, here or in any other text.

Placeholders are filled by the game. A text may use only the ones the engine fills for it, and
must use every one its facts carry. Copy them exactly, braces and all: the game fills only
`{name}`, so any other brace (`{ dog }`, `{{dog}}`, a lone `{`) would show as it is, and is an error.

| Text | Placeholders |
|------|--------------|
| Tips | June: `hungry` none, `food` `{food} {days}`, `ready` `{room}`, `build` `{room} {needs}`, `heal` `{hp}`. Tomas: `van` `{hp} {max} {cost}`, `vanFree` `{hp} {max}`, `fence` `{holes} {cracks}`, `cabin` `{broken}`, `crowbar` and `fine` none. Pip: `wave` `{size} {sides}`, `keys` `{keys}`, `walkers` `{days}`, `radio` none |
| Reports | `fence` `{fixed} {scrap}`, `fenceFree` `{fixed}`, `cabin` `{fixed} {scrap}`, `cabinFree` `{fixed}`, `hurt` `{who} {cost}`, `late` `{item}`, `heal` `{hp}` |
| Errand brief and done | `{count} {item} {days} {reward}` |
| Quest brief and done | `{reward} {dog}` |
| Talk and quest `after` | `{dog}` |
| Dog `named` and `pet` | `{dog}` |
| Titles, quest tags, journal lines, dog `ask` | none (shown as written) |

- `{item}` is the item's name as the game spells it ("Box of nails"), which reads wrong after a
  number: give it as a label, the way the facts do ("2 of these: Box of nails"), never
  "{count} {item}".
- `{dog}` is the dog's name once Pip's card has named it, and "the dog" before that. Use it only
  where the dog is home (a topic whose `when` has `dog: true`, the dog quest's thanks and payoff,
  the dog's `named` and `pet` lines), and start a sentence with it only in `named` and `pet` (it
  would read "the dog" with no capital).
- What they become: `{size}` "a small wave", "a big wave" or "no wave"; `{sides}` "the back
  fence", "the back fence and the fence by the farm" (one to four sides), or "nowhere" with no
  wave; `{cost}` "a medical kit", or the food it took ("2 food", less when the pantry is short);
  `{needs}` a list that may end with scrap ("2 Lumber, 1 Box of nails and 20 scrap"); `{reward}`
  a list ("30 scrap, 2 Lumber and 1 medical kit"); `{keys}` "1 stash key" or "3 stash keys";
  `{room}` a room's name ("Garden"); `{who}` a crew member's name; `{item}` an item's name; the
  rest are numbers. An errand's `{days}` is its deadline when offered and the days left when the
  brief is read again from the backpack (it can be 0 or 1). Write around them so the sentence
  reads well whatever they become. A count that can be 1 goes where no plural hangs on it, or
  before a noun the game mends ("1 holes" reads "1 hole").

How it works, at every level, has a crew paragraph: June, Tomas and Pip by name; walk up to one
and press E to talk (the yard keeps running); the favors they ask (E again to answer, bring the
thing home, talk to hand it over); their trust stars; Tomas fixes fence holes in the calm and you
still pay the scrap; in a wave they hide in the office closet, and a walker that gets in there
costs a medical kit, or food. The fence is never "patched" (that word stays banned with the fence);
June still "patches you up". The controls list's E line says E talks to the crew.

`node tests/validate-text.js` holds the crew's words to all of the above. Until a level has any
crew words it only warns how many are missing; once it has some, every missing text is an error,
and so are the How it works and E-line rules. `node tests/validate-text.js 3 --crew=strict` lists
everything level 3 still needs; `--crew=present` checks only what is written (for drafting).
`CREW_STRICT=1`, or `CREW_WORDS_REQUIRED` in the validator, makes every level strict.

## Schema

Each level is five files, loaded in this order (`index.html`):

- `js/content/levelN.js`: `level`, `howto`, `controls`, `base` (rooms, traps, bench), `typing`.
- `js/content/levelN-places1.js`: locations gasngo, grocery, hardware, pharmacy, autoshop,
  radioshack, garden.
- `js/content/levelN-places2.js`: locations police, school, firehouse, hospital, watertower,
  lumberyard, mall, library.
- `js/content/levelN-home.js`: `yard`, `journal`, `radio`, `tags`, `recap`.
- `js/content/levelN-crew.js`: `crew` (talk, tips, reports, quests, errands, dog).

More words for the same level go in a new part file (`levelN-places3.js`), loaded by `index.html`
after the others; the validator reads every `levelN-*.js` part it finds. A second crew part
(`levelN-crew2.js`) adds to what is there instead of replacing it:
`T.crew.talk = Object.assign(T.crew.talk || {}, { ... })`.

```js
// levelN-places1.js (places2 is the same shape)
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[3] = root.ZSR.TEXT[3] || { level: 3 });
  T.locations = T.locations || {};
  Object.assign(T.locations, {
    gasngo: {
      blurb: "One sentence for the map tooltip.",
      door: { title: "Short title", text: "The door note.\n\nParagraphs separated by blank lines." },
      notes: {
        "gasngo-counter": { title: "...", text: "..." }, // the main note (spot 1)
        "gasngo-trail1": { title: "...", text: "..." },
        "gasngo-trail2": { title: "...", text: "..." },
        "gasngo-dead1": { title: "...", text: "..." }, // plus dead2.. as the level places them
      },
      signs: { "gasngo-sign1": { title: "Sign or graffiti, 1 to 5 words", text: "..." } }, // all four
      key: { name: "What the key looks like, 2 to 6 words", tag: "What its tag says." },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);

// levelN-home.js
(function (root) {
  const T = (root.ZSR.TEXT[3] = root.ZSR.TEXT[3] || { level: 3 });
  T.yard = { lots: { garden: { title: "Garden plot", empty: "...", built: ["level 1", "level 2", "level 3"] } } }; // + farm, well, water, power, radio, lab
  T.journal = [{ title: "...", text: "..." }]; // one per JOURNAL entry, same order
  T.radio = [{ title: "...", text: "..." }]; // one per RADIO entry, same order; name the speaker
  T.tags = { fuel: ["tag one", "tag two"] }; // every item
  T.recap = { haul: "{items} {scrap}", nothing: "", notes: "{notes}", keys: "{keys}", food: "{food}", hungry: "", next: "{room} {needs}", ready: "{room}" };
})(typeof globalThis !== "undefined" ? globalThis : this);

// levelN-crew.js (keys: the ids in js/story-crew.js and js/story-quests.js)
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[3] = root.ZSR.TEXT[3] || { level: 3 });
  T.crew = {
    talk: { "june-t1": { title: "...", text: "June ..." }, "june-m1": { title: "...", text: "June ..." } }, // every topic and mood
    tips: { june: { food: "June ... {food} ... {days} ..." }, tomas: { fine: "Tomas ..." }, pip: { walkers: "Pip ... {days} ..." } },
    reports: { fence: "Tomas ... {fixed} ... {scrap} ...", hurt: "... {who} ... {cost} ..." }, // every CREW_REPORTS key
    quests: { "june-1": { title: "Bag of sunflower seeds", brief: "June ...", tag: "...", journal: "...", done: "June ...", after: "June ..." } }, // the dog quest: no tag
    errands: { "june-e1": { title: "...", brief: "June needs {count} of these within {days} days: {item}. ... {reward}.", done: "June ..." } },
    dog: { ask: "Pip ...", named: "... {dog} ...", pet: "{dog} ..." },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
```

Titles are 2 to 6 words. `found` (where the note was) and `facts` live in the story files,
not here. Note texts are keyed by the note id.
