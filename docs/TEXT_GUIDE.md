# Text Guide (six reading levels)

Every player-facing in-world text exists at six reading levels in `js/content/` (four
files per level, see Schema). The facts come from `js/world.js` (`NOTES`, `BASE_ROOMS`,
`ITEMS`, `LOCATIONS`, `KEYS`), `js/story.js` (extra notes, signs, keys) and
`js/story-home.js` (`JOURNAL`, `RADIO`, `ITEM_TAGS`, `YARD_LOTS`). A level file changes the
words, never the facts. Run `npm test` after editing.

## Audience

The game is for teens. The reader is a teen who reads at the given level. "High
interest, low readability": tense, grounded survival writing in short, simple sentences
at the low levels; the same world in fuller sentences at the high levels. Never cute,
never a picture book, never talking down. No gore, no on-page deaths, no profanity.

## Calibration

Notes got longer and more numerous in the reading expansion (2026-10-13): every level now
carries at least four times the in-world reading it had before (`npm test` enforces it).

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
three to six paragraphs at every level, and the `controls` list (one line per control group,
"Head: text") is written at the level too.

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

## Schema

Each level is four files, loaded in this order (`index.html`):

- `js/content/levelN.js`: `level`, `howto`, `controls`, `base` (rooms, traps, bench), `typing`.
- `js/content/levelN-places1.js`: locations gasngo, grocery, hardware, pharmacy, autoshop,
  radioshack, garden.
- `js/content/levelN-places2.js`: locations police, school, firehouse, hospital, watertower,
  lumberyard, mall, library.
- `js/content/levelN-home.js`: `yard`, `journal`, `radio`, `tags`, `recap`.

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
```

Titles are 2 to 6 words. `found` (where the note was) and `facts` live in the story files,
not here. Note texts are keyed by the note id.
