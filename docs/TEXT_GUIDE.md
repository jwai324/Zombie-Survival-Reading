# Text Guide (six reading levels)

Every player-facing in-world text exists at six reading levels in
`js/content/level1.js` through `level6.js`. The facts come from `js/world.js`
(`ZSR.WORLD.NOTES`, `BASE_ROOMS`, `ITEMS`, `LOCATIONS`). A level file changes the words,
never the facts. Run `npm test` after editing.

## Audience

The game is for teens. The reader is a teen who reads at the given level. "High
interest, low readability": tense, grounded survival writing in short, simple sentences
at the low levels; the same world in fuller sentences at the high levels. Never cute,
never a picture book, never talking down. No gore, no on-page deaths, no profanity.

## Calibration

| Level | Note length (words) | Max sentence | Vocabulary |
|-------|---------------------|--------------|------------|
| 1 | 30 to 50 | 7 | one or two syllables, sight words, present tense |
| 2 | 45 to 75 | 10 | simple past is fine |
| 3 | 70 to 110 | 14 | a few compound sentences |
| 4 | 100 to 140 | 18 | richer vocabulary, two paragraphs ok |
| 5 | 130 to 180 | 22 | figurative language, cause and effect |
| 6 | 160 to 220 | 26 | sophisticated vocabulary, voice, subtext |

Door notes may run shorter (about 60 percent of the range). How it works paragraphs
follow the same sentence limits; three to six paragraphs at every level, and the
`controls` list (one line per control group, "Head: text") is written at the level too.

## What every note must do

A note's `facts` array in `js/world.js` is a checklist. Every fact must be present in
the text at every level, in words a reader at that level can use:

- Who wrote it (name), because the player meets these people across notes.
- Where things are, in words that match the building (front, back, left, right,
  near the counter, in the storeroom), since the player will walk there.
- How to open the cache, when the note has `unlocks`. The text must make clear that
  the reader can now open that door (a code, a key location, a trick).
- Which other place to try, when the note has `reveals`, with a direction (north,
  east, downtown, the hills) so the player can find it on the map.

Door notes also give the walker count and rough positions. Keep numbers exact.

## Schema

```js
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[3] = {
    level: 3,
    howto: ["paragraph", "paragraph", "paragraph"],
    controls: ["Road: ...", "Inside and in the yard: ...", "E does it all: ...", "Traps in the yard: ...", "Backpack: ...", "Workbench: ...", "Map: ..."],
    base: {
      intro: "One or two sentences shown at the top of the base screen.",
      rooms: {
        walls: { desc: "What the room does, in this level's words.", next: ["what level 1 adds", "what level 2 adds", "what level 3 adds"] },
        // garage, power, water, garden, radio, medbay, archive, well, farm, lab
        // a level with `requires` in the world file must name those rooms in its `next` text
      },
      traps: { spike: { desc: "key letter, damage, uses, what unlocks it" }, blast: { desc: "..." } },
      bench: { intro: "One or two sentences shown at the workbench." },
    },
    typing: {
      fingers: ["3 to 4 paragraphs: home row (A S D F / J K L ;), the bumps on F and J, thumbs on space, reach and return, eyes on the screen"],
      words: ["lowercase a-z words from the game's world; 40+; length by level (L1 3-4 ... L6 5-9)"],
      phrases: ["lowercase 2-4 word phrases, no punctuation; 20+"],
      sentences: ["Capital first letter, period at the end, letters/spaces/commas only; 16+; word count by level"],
    },
    locations: {
      gasngo: {
        blurb: "One sentence for the map tooltip.",
        door: { title: "Short title", text: "The door note.\n\nParagraphs separated by blank lines." },
        notes: { "gasngo-counter": { title: "Short title", text: "..." } },
      },
      // every location id except base
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
```

Titles are 2 to 6 words. `found` (where the note was) and `facts` live in the world
file, not here. Note texts are keyed by the note id from the world file.
