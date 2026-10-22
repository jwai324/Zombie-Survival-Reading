# Crossover Universes: Captain Leo and the Fortitude Chronicles

**Status: built (2026-10-17).** The owner's decisions are logged in
`DESIGN.md` under "Owner decisions: crossover universes". Sources: the `jwai324/Captain-Leo` repo
(the book text in `project/Captain_Leo.txt`), the `jwai324/The-Fortitide` repo (Book 1 in
`js/chapters.js`) and the owner's Notion page "Fortitude Chronicles — Series Bible".

## The one rule

**The current story is canon in every universe.** A universe adds a storyline on top. It never
edits, hides or contradicts a base text (notes, signs, journal, radio, crew talk, quests, How it
works). With the option off, the game is exactly today's game.

## The switch

| Decision | Answer |
|----------|--------|
| Where | Settings: **Universe: Off / Captain Leo / Fortitude**. One at a time, never both. |
| Stored | Per save slot, like `settings.tutorial`. Old saves read as Off. |
| Switching | Allowed any time. Each universe keeps its own crossover progress, so switching away and back loses nothing. Switching does not touch base progress. |
| Audience | The same teen players and rules as the base game (no gore in text, no on-page deaths, no profanity, never quizzed). |
| Ending | Both storylines stay open, like the River Convoy that never leaves. |
| Radio pace | The Leo knock and the Fortitude bursts come about every 3 days, beside (never instead of) the day's base broadcast. |

## What the crossover must respect (base facts)

Every crossover text is checked against these. They come from the base texts, not from the books.

- The Fall began as "some sickness across the river. Probably nothing." (Ruby's call in Dev's last
  shift list at Gas-N-Go, at every level). Alarms, sirens and running on that day are reading-level color, not base facts (level 6: Max and Mia's notes school-dead4 and police-dead4; level 5: radio-8 and the sirens in police-dead1 and grocery-dead3), and "the first week of the Fall" is the crossover's own line (Fortitude's fort-j4).
  It was months ago. **Both universes put the origin across the river.**
- The base texts never say what caused it. The crossover may explain it; the base texts stay silent.
- The town is a mid-size river town with a sun, a moon, birds, fish, a county and TV. The base texts never
  name Earth as a planet (the two 'earth' mentions are garden soil), so nothing needs reconciling;
  the Fortitude texts may say Earth freely and the Leo texts avoid it.
- People are never shown dying. Walkers are scary from outside, never wounds. The Hollises went
  north and are never lost. Tomas's father's fate is never stated. The convoy never leaves on screen.
- The crew rules hold: no lock answers, no key-to-stash ties, no revealing places on the map.

## Captain Leo: Mira-8

**Setting.** The river town is a colony town on **Mira-8**, the rocky twin next door to Mira-9.
About **200 years after Mission One**. Mira-8 is Earth-like because the colony seeded it with Earth
life (the Skip Drive was first tested on plants, mice and monkeys). Mira-9 hangs huge and pale in
the sky, white with slow swirling clouds; Mira-8 still has its own small moon.

**Why only kids came.** The Skip Drive works only on growing bodies, so every colonist arrived as a
child and grew up here. The grown-ups in town were born here or came as kids long ago. The player
can be either; the text never says.

**The Fall: the Gray.** Mira-8 once had a sky-forest like Mira-9's. It died long before the colony.
Colony miners across the river dug into old deep rock and brought up its spores: the Gray. The
Mirans had tried to warn the colony. Why the forest died stays open.

**Leo's crew are legends.** Leo, Camila, Koen, Reagan, Kaleb, Kennedy, Bolt, PIP and Dr. Patel lived
about 200 years ago and are history now: names in school lessons, on Founders' Day, on robot dogs.
**Sool**, the Miran from the book, is still alive and is the living link.

**Book canon to keep straight:** the Skip Drive folds space like paper; Mira-9 is about 50
light-years from Earth, with methane air; Mirans are cloud-people with three toes and three
fingers, deep blue eyes and a laugh like a chime, and they speak short, simple English ("Come. I
show you."); their roads are soft, grown like coral, with rest stops one mile apart; pools have
stones laid in patterns; glow rocks; warm stone arches over 1,000 years old; the sky-trees breathe
in carbon dioxide and breathe out methane; the counting signal became a three-note "come back"
knock; Leo's Mission Two list ends "10. ?".

### Leo v1: what ships

| Channel | What it carries |
|---------|-----------------|
| Sky | Mira-9 over the yard, day and night. Art only. |
| Radio | Some days, before the day's broadcast, a three-note knock comes through. Now and then a Miran voice (Sool) speaks a few short words. Never replaces a base broadcast. |
| Journal | June adds lines about the "second moon", the knock, Founders' Day. Never assumes a build or a find. |
| Crew talk | New topics: Pip was named after PIP, the ship's helper on Skip-One; June keeps a cloud-tree seed in a jar; Tomas on Koen, the builder; history the whole town learned in school. |
| Quest chain | **Tomas rebuilds a broken Bolt-model robot dog**, five quests long. Its own track beside the base quests. The real dog from Pip's fifth quest stays as it is. |
| Notes under the door | (owner, 2026-10-22) **Three notes from an unsigned writer**, each opening by itself on its own log on. Each hints harder than the last; note 3 says plainly that this is Mira-8. See "The notes under the cabin door" below. |

**The robot dog in play** (owner, 2026-10-17). Once the fifth quest is handed in, the robot dog
follows you in the yard and inside buildings, and rides along in the van (it does nothing on the
road). It is a **weak helper**: small zaps that slow walkers, not kill them fast, so you
still do most of the fighting. Walkers can bite it; too many bites and it **shuts down** (a robot,
so no gore: it sparks, sits and goes dark). A shut-down dog stays down for the rest of that run or
wave, and Tomas repairs it at the cabin for scrap. Bolt's book traits to keep: beeps (two for yes,
two for a laugh), a metal tail that wags, a nose that is really a chemistry tester.

Not in v1: found items (no new tagged loot; Tomas's five quest objects use the base quest path), new notes in buildings, a new place.

### The notes under the cabin door (owner, 2026-10-22)

The owner asked for notes that open by themselves on the player's next three log ons, about 200 words each. They
should hint at the universe, and by the end of note 3 it should be clear where you are. This is **Leo only** for now.

| Decision | Answer |
|----------|--------|
| A log on | The **first time the slot is opened on each real (calendar) day** (Continue on the title screen), using the device's local date. One note a day, in order, with no catch-up: a player who skips a week gets the next note, not two. |
| When | Only after the tutorial's yard part is done (`Tutorial.done("ready")`), so a note never covers the tutorial. Then the note opens first, then an unread day page, then the yard. |
| Length | **About 200 words at levels 4 and 5**, following the note range at every level (level 1 about 110, level 6 about 240). The same facts at every level. |
| Writer | **An unknown writer** who leaves notes under the cabin door and ends each one "Knock, knock, knock." They heard the knock as a kid and have answered it ever since. Who they are stays open (like the Accord archive). They are not Sool, who lives on Mira-9. |
| The arc | Note 1, "Count the Moons": two moons, the big pale one "listening", and the long trip every family here took as kids. Note 2, "What the Miners Found": the Gray, the miners, the dead sky-forest, the cloud-people's warning, the kid founders, Founders' Day. Note 3, "Where You Are": Mira-8, Mira-9, the Mirans, Captain Leo and Co-captain Camila on Skip-One about 200 years ago, the Skip Drive (kids only), the Come Back Knock. |
| Spoilers | **Nothing is held back.** June's ledger names Mira-8 on the first day page; the owner accepted that the notes may repeat what the ledger has already told. |
| Old saves | A save that already played Leo before the notes existed (day pages written in it) gets them as read: listed in the backpack, none opens by itself. A Leo save with no Leo day pages yet gets all three. |
| Reading again | The backpack lists the read notes ("Notes under the cabin door") while the universe is on. |
| Switching | Each universe has its own count (`save.xover[u].notes`, `noteDate`); switching away and back replays nothing. |

How it is built: facts in `WORLD.UNIVERSES.leo.notes` (`js/story-leo.js`, ids `leo-n1..3`), words in
`T.universe.leo.notes` (`js/content/levelN-leo.js`). The state is `State.xoverNoteDue(date)`,
`xoverNoteSeen(i, date, words)` and `xoverNotesRead()` in `js/xoverstate.js`. The log on is `logOn()` in
`js/main.js`, and the reader is `Backpack.xoverNote` and `renderXoverNotes` in `js/backpack.js`. Any universe whose
facts gain a `notes` list gets the same behavior with no engine change (Fortitude has none). Append notes, never
insert: saves store the count.

## Fortitude: Earth, hundreds of years after Book 4

**Setting.** The river town is on **Earth**, hundreds of years after Book 4 (owner, 2026-10-17).
Books 2 to 4 happened, but the game names **only Book 1 events**. Never mention the Marrow, the
Waiting, Wren, VESTA, Ilo, 300-year lifespans, Valen's fate or anything else from Books 2 to 4.

**Book 1 is ancient history.** Book 1 alone spans about 300 years, and the game sits hundreds of
years after Book 4, so everything in Book 1 is many centuries old. Texts treat it the way we treat
the distant past: school lessons, statues, museum copies, worn plaques. A Book 1 object found in
town (an Abyss Explorer pin, an Accord page) is an old replica or keepsake, never an original
carried by its owner. Nobody in town knew a Book 1 character. The shipyard ring is old; cryosleep
is old, proven technology, which is why a public Waiting Vault could exist at all.

**Book 1 characters are legends only:** Dr. Camila Reyes, Kennedy, Zoe, Ava, Patriya Nguyen,
Annabelle, Valen, Dr. Marcus Webb, Dr. Harper, President Osei. Named in lessons, plaques and old
papers, never heard or met. (The Book 1 glossary credits the Chaos Plan to "Sophia", but the text
gives it to Annabelle; use Annabelle.)

**The Fall: the Waiting Vault.** Across the river stood a public cryosleep vault where people slept
to skip ahead to a better future, the way Camila's team once did. The vault's timer and its cooling
failed together, like Patriya's pod that ran too warm for ten years, but for everyone at once. The
sleepers woke wrong, and the sickness spread from there. Why both failed stays open.

**Book canon to keep straight:** cryopods are silver tubes with blue light, and about 1 pod in 100
malfunctioned in Book 1; Indestructium is a black metal that glows faintly from inside and cannot
be bent, burned or broken; the tiny wormhole ("the tunnel") passes signals, not objects; the
Fortitude speak in mathematical bursts that make pictures, with no words for maybe, please, help,
together or friend, and names hide in the quiet background waves; Ava decoded it from ocean-wave
patterns; the Fortitude Accord was signed in New York; Mars terraforming began with Ava's
super-algae spores; the Abyss Explorer pins; "If you stop failing, you stop learning."

### Fortitude v1: what ships

| Channel | What it carries |
|---------|-----------------|
| Sky | **Judgment call:** a thin silver arc across the night sky, the old Indestructium shipyard ring in low orbit (Book 1), with Mars as a bright point. Art only. |
| Radio | Some days, short Fortitude-style bursts of numbers come through on the radio. Decoded, they are **old Accord records**: an automatic archive from Book 1 days, still broadcasting the Fortitude Accord, Valen's first "hello" and other Book 1 history. Who keeps it running stays open. Never replaces a base broadcast. |
| Journal | June adds lines about the shipyard ring, the Waiting Vault, the Book 1 legends (Dr. Reyes's team, Valen, the old saying, the Abyss Explorer) and Mars; the bursts reach the ledger through the radio broadcasts and Pip's quest lines. |
| Crew talk | 7 topics: Book 1 legends the town learned in school, the vault, Indestructium, the bursts; the Accord comes through the radio and Pip's quests. In Tomas's third topic (`tomas-fort-t3`, day 9, 2 stars and Mr. Reyes's door note `hardware-door` read), Tomas says Mr. Reyes of Reyes Hardware always told everyone his family goes back to Dr. Camila Reyes; after so many centuries nobody can prove it either way, Tomas likes the story, true or not, and the texts never confirm it. |
| Quest chain | **Pip decodes the bursts** the way Ava did: record and count the bursts, match a pod tag's numbers, match the pictures to the old history book and the words to an Accord page, then read the last record. Five quests long, its own track beside the base quests. |
| Keepsakes | A tag from a Waiting Vault pod, a copy of an Accord page, an Abyss Explorer pin: the story objects of Pip's track (see "How it works"), each with its tag at six levels. |

## Files

| File | What it holds |
|------|---------------|
| `js/story-leo.js`, `js/story-fortitude.js` | Facts: `WORLD.UNIVERSES[u]` (name, sky, `journal`, `radio`, pacing, `robotQuest`), `WORLD.ROBO` (Leo), and the crew topics and quests each universe appends to `CREW_TALK` and `QUESTS` with `universe: "<u>"` |
| `js/content/levelN-leo.js`, `levelN-fortitude.js` | Words at six levels: `T.universe[u].journal` / `.radio` / `.notes`, and the crew's words for the topics and quests, merged into `T.crew.talk` / `T.crew.quests` |
| `js/xoverstate.js` | Mixed into `ZSR.State` after `js/crewstate.js`: `universe()`, `universeDef()`, `save.xover`, `xoverLog(entry)` (the day page's crossover line and broadcast), Rivet's health (`roboHome`, `roboOn`, `roboBite`, `roboRepair`), `ZSR.xoverText` |
| `js/crewstate.js` | Topics and quests with `universe` show only in that universe; each universe's quests are a giver's own track (`nextStoryQuest(id, track)`; `offer` tries the base track first) |
| `js/robodog.js` | Rivet in the yard and in buildings (mixed into `ZSR.Interior`): follow, zap, bites, shutdown, repair words |
| `js/crossart.js` | Art: `roboDog`, `zapSpark` (`ZSR.CROSS_ART`), and `ZSR.Crossover.sky` (Mira-9; the ring and Mars) |
| `js/interior.js` | Draws the sky over the yard; a zapped walker's `slowT` / `slowMul` |
| `js/backpack.js`, `css/style.css` | The day page shows the crossover line under June's page and the broadcast after the base one (`.ledger-x`, `.radio-x`) |
| `js/main.js`, `index.html` | Settings: Universe (Off / Captain Leo / Fortitude), with a line on what each adds; the save slot shows its universe |
| `js/god.js` | God mode lists a universe's quests only while it is on |

## How it works, as built

- **The setting** is `settings.universe` per slot ("off" by default; read() fills it into old slots). It can change
  any time. Topics, quests, ledger lines, broadcasts, the sky and Rivet follow it at once; nothing is lost when it
  is switched away, because the save keeps every quest's state and each universe's own counts (`save.xover[u]`).
- **Ledger lines** ride on every `journalEvery`-th day page written while the universe is on (2), in order, until
  the list ends. **Broadcasts** ride on every `radioEvery`-th day the radio hears the news (3), in order, then
  repeat their last third like the base radio. Both are stored on the day's log entry (`entry.x = { u, journal,
  radio }`), so an old page reads the same whatever is on now.
- **Topics** with `universe` are skipped by `nextTopic` in any other universe; within it they come after any base
  topic that is ready, in list order.
- **Quests**: a crossover quest is its giver's own track (Tomas: Leo; Pip: Fortitude). One open on each track at
  once; `offer` gives the base quest when one can be offered, else the track's, else an errand. All base quest rules
  hold within the track (`tests/validate-world.js` groups by giver and track). Errands still start after the base
  quest 1.
- **Rivet** (Leo): home once `tomas-leo-5` is handed in. It follows you in the yard and in buildings (it turns up
  beside you when you walk in; on the road it is in the van, unseen). Every 1.8 s it zaps the nearest awake walker
  within 4.5 tiles in a clear line: 6 harm (a pistol does 12) and half speed for 1.6 s. A walker with Rivet in reach
  and you out of it bites Rivet on its own bite clock; 60 health in all (five bites from a plain walker, whose bite is 12; three from a brute). Shut down, it lies dark,
  stays home on trips, and Tomas fixes it for 20 scrap when you arrive home or a wave is cleared (only with the
  scrap). The practice walker in the tutorial is never zapped or biting it.
- **The sky** (yard only): Mira-9 to the northeast, a pale disk with turning clouds; or the shipyard ring, a thin
  silver arc highest to the north, and Mars low to the east-southeast. Both are fixed in the world and hidden behind
  anything standing in front.
- **The Fortitude keepsakes** (the pod tag, the Accord page, the Abyss Explorer pin) are the story objects of Pip's
  track, each with its tag at six levels, rather than extra stash loot: one tested path (quest objects) instead of
  a new one, and the decoding gives each a reason to be found.

## How the words are built

- Facts in their own files: `js/story-leo.js`, `js/story-fortitude.js`. Words at all six levels in
  their own files: `js/content/levelN-leo.js`, `js/content/levelN-fortitude.js`. Base files are not
  edited for crossover words.
- Crossover radio and journal entries live in their own lists (`WORLD.UNIVERSES[u].journal` / `.radio`), told
  in order by the universe's own count; append to them, never insert, like the base ones (saves store indexes).
- Each crossover text exists at all six levels and follows `docs/TEXT_GUIDE.md`.
- Size as written: about 2,600 to 3,900 words a level per universe (levels 4 to 6 measured), about a twentieth of
  the base game each, about a tenth for both together.
- June writes her ledger in the first person, but a line whose facts name her must say "June" (the validator), so
  the words bring her name in through someone talking to her.
- **The ongoing cost:** every later base story beat has to be checked against both universes.

## Tests

- `tests/validate-world.js`: the crossover quests by the base rules, within their track; a quest's `universe` is a
  `UNIVERSES` key.
- `tests/validate-text.js`: `T.universe[u]` at every level (one text per fact entry, the tag range x 1.6 for
  ledger lines, the lot range for broadcasts, the note range for the notes under the door, the speaker named); the topics' and quests' words with the crew's.
- `tests/validate-crew.js`: off adds nothing; each universe's ledger lines and broadcasts in order and paced; a
  day with the universe off keeps its count; Rivet's health, shutdown, repair and save; old saves get `xover`;
  topics and quests in order per universe; the notes under the door (one a real day, in order, no catch-up, words
  counted once, kept in the save, old saves get them as read, Continue calls `logOn()` after the tutorial); every crossover object waits on its spot and is walked onto; Rivet
  follows, zaps (the walker slows), is bitten, shuts down, is fixed, leaves when the universe goes off, and comes
  into a building; a whole play-through in each universe.
- `tests/validate-god.js`: god mode offers and jumps to each crossover quest in its universe.

## Open questions

- Fortitude: who keeps the Accord archive broadcasting (left open on purpose).
- Rivet's numbers (`WORLD.ROBO`) want a play-test: whether 6 harm every 1.8 s helps enough without carrying a wave.
- Rivet in the river (fishing) and on the road: not there now.
