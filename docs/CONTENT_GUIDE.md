# Content Guide

How to write reading content for Zombie Survival. Each grade lives in
`js/content/gradeN.js`. Run `npm test` after editing to validate the schema.

## Audience

The **game** is for teens. The **reading level** is switchable from grade 1 to grade 6.
That means every passage is "high interest, low readability": the subject matter is
grounded survival fiction a 14-year-old would read on purpose, and only the sentence
length, word choice, and passage length change with the grade. A grade 1 passage about
a locked gate uses five-word sentences. It does not become cute, and it never talks
down to the reader. Think of the reader as a teen who reads at that level, not a
small child.

## World

- **Setting:** a realistic post-outbreak America, months after "the Fall." Overcast
  skies, empty highways, stalled cars, boarded storefronts, hand-painted warnings,
  camps built from school buses and shipping containers. A grounded survival comic:
  tense, quiet, hopeful in small ways. Never goofy. Never gory.
- **The player:** drives the Bookmobile, an armored library van that runs supplies and
  messages between camps. The player is the convoy's reader. Many survivors they meet
  read poorly, or the documents are torn, water-stained, or half-burned, and what the
  player reads decides what the camp does next: which road, what is safe, who is
  still out there.
- **The walkers:** slow, relentless, silent except for a low moan. Survivors call them
  "walkers." The fast ones are "sprinters," the big ones are "bruisers." They are a
  danger, not a joke, and not a horror show: when one is put down it drops and is
  gone. No blood, no bites described, no bodies described.
- **Recurring crew (use them, add others freely):**
  - Ruby, 19, the mechanic. Runs the garage at every stop. Blunt, reliable, says
    little.
  - Doc Lin, the medic. Dry humor, tired, kind.
  - Jo, the older radio operator. Keeps the logs and the convoy's memory.
  - Max and Mia, 15, twins who scout ahead and draw the maps.
  - Rook, the convoy's dog, a scarred shepherd mix who hears walkers first.
- **Tone:** grounded, tense, hopeful. Real stakes without gore: supplies run low, a
  bridge is out, the radio goes quiet and comes back, someone is missing and is found.
  No on-page deaths, no injuries described in detail, no profanity. PG rating.
  Humor is dry and comes from character, never from slapstick.

## What a haven is

At each haven a host hands the player something to read, then asks three questions,
then the player makes a route choice. The thing to read should be a **found document
from the world** whenever possible: a radio log with timestamps, a supply list, a
warning spray-painted on a wall, a letter left for someone, a map legend, the rules
posted at a gate, a diary page, instructions for a generator or a water pump, a
newspaper clipping, a wanted poster. A short story told by the host is also fine.
Vary the types across the eight passages in a grade.

Haven names to draw from (do not repeat within a grade): Overpass Camp, Gas-N-Go,
Old Lighthouse, Library Fort, Drive-In, School Bus Wall, Water Tower, Fire Station,
Mile 9 Diner, Mountain Lodge, Boat Dock, Mall Rooftop, Radio Tower, Greenhouse, Train
Yard, Ranger Station, Quarry Gate, Hospital Annex, Stadium Gate, Toll Plaza.

## Grade calibration

| Grade | Passage words | Max sentence length | Options per question | Notes |
|-------|---------------|---------------------|----------------------|-------|
| 1 | 35 to 55 | 7 words | 3 | One or two syllable words. Sight words. Present tense. One short paragraph. |
| 2 | 60 to 90 | 10 words | 3 | Simple past tense fine. One or two paragraphs. |
| 3 | 100 to 140 | 14 words | 4 | Two paragraphs. A few compound sentences. One or two vocabulary words in context. |
| 4 | 140 to 180 | 18 words | 4 | Two or three paragraphs. Inference questions. Richer vocabulary. |
| 5 | 180 to 230 | 22 words | 4 | Cause and effect, figurative language, character motivation. |
| 6 | 230 to 280 | 26 words | 4 | Theme, author's purpose, multi-step inference. Sophisticated vocabulary. |

Road signs are one or two sentences, well under the grade's sentence limit, and one
question with three options at every grade. They are things seen or heard on the
road: a spray-painted warning on an overpass, a radio burst from Jo, a hand-lettered
sign on a fence, a note taped to a stalled car.

## Questions

Three per haven, in this order:

1. **detail**: answerable by finding a line in the text.
2. **inference** (or main idea / sequence): requires understanding, not matching.
3. **vocab**: "What does the word *X* mean in this passage?" The word must appear in
   the passage and be guessable from context.

Rules:
- Exactly one correct option. Distractors must be plausible but clearly wrong given
  the text.
- Options are short (one to six words) and roughly the same length so length is not a
  tell.
- Vary the position of the correct answer across questions.
- Every question has a `hint` of one sentence that points to where in the text to look,
  without giving the answer away.

## Route choices

Each haven ends with a `choice`: a prompt and 2 or 3 options. Each option has a
`label` (2 to 5 words), a `desc` (one sentence, grade-appropriate, states the tradeoff
in plain words), `effects`, and a `result` (one or two sentences shown after choosing).

Effects must be balanced. A harder road pays more. Allowed keys:

| Key | Type | Range | Meaning |
|-----|------|-------|---------|
| `zombies` | number | 0.6 to 1.6 | Spawn rate multiplier for the next segment |
| `runners` | number | 0.5 to 2.0 | Runner frequency multiplier |
| `brutes` | number | 0.5 to 2.0 | Brute frequency multiplier |
| `length` | number | 0.7 to 1.3 | Segment length multiplier |
| `scrap` | integer | -30 to 60 | Immediate scrap change |
| `hp` | integer | -25 to 30 | Immediate van health change |
| `fog` | boolean | | Next segment is foggy (short visibility) |
| `night` | boolean | | Next segment is dark (headlights only) |
| `crates` | integer | 0 to 4 | Supply crates on the next road (drive over for scrap) |

Good pattern: one safe option (`zombies: 0.8`, maybe `length: 1.1`), one risky option
(`zombies: 1.4`, `scrap: 30` or `crates: 3`), optionally one odd option (`fog: true`,
`night: true`, `hp: 10`). Make the description honest about the tradeoff so the choice
is a reading comprehension exercise in itself.

## Schema

```js
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.CONTENT = root.ZSR.CONTENT || {};
  root.ZSR.CONTENT[3] = {
    grade: 3,
    havens: [
      {
        id: "g3-overpass-camp",       // unique, lowercase, "gN-" prefix
        place: "Overpass Camp",       // haven name in the caption box
        host: "Jo",                   // who hands you the text
        intro: "Jo slides a water-stained page across the table. \"Radio log from the Fort. I can't make out half of it. You read it.\"",
        kind: "log",                  // note | letter | log | map | diary | recipe | poster | rules | story | sign | list | manual | warning
        title: "Fort Radio Log, Day 41",
        text: "Paragraph one.\n\nParagraph two.",
        questions: [
          { type: "detail", q: "...", options: ["a", "b", "c", "d"], answer: 2, hint: "..." },
          { type: "inference", q: "...", options: ["a", "b", "c", "d"], answer: 0, hint: "..." },
          { type: "vocab", word: "fence", q: "What does the word \"fence\" mean here?", options: ["a", "b", "c", "d"], answer: 1, hint: "..." }
        ],
        choice: {
          prompt: "Which way to the next town?",
          options: [
            { label: "The ridge road", desc: "Short and steep, and the walkers gather where the cars stalled on the hill.", effects: { zombies: 1.3, scrap: 25 }, result: "The engine strains on the grade. You pass a line of stalled cars with their doors open." },
            { label: "The river road", desc: "Flat and long, and the fog comes off the water by late afternoon.", effects: { zombies: 0.8, length: 1.2, fog: true }, result: "The river road is quiet. Rook stands at the window and does not sit down." }
          ]
        }
      }
    ],
    roadSigns: [
      { text: "Spray paint on the overpass: BRIDGE OUT. USE MILL ROAD.", q: "Which road should you use?", options: ["The bridge", "Mill Road", "The overpass"], answer: 1 }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
```

The wrapper function is required so the file works both in the browser (classic
`<script>` tag, no module loader, so it runs from `file://`) and in Node for the
validator.
