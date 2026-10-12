# Content Guide

How to write reading content for Zombie Survival Reading. Each grade lives in
`js/content/gradeN.js`. Run `npm test` after editing to validate the schema.

## World

- **Setting:** a cartoon road trip across a post-zombie America. Farms, small towns,
  deserts, mountains, a coast. Always daytime-bright and colorful unless a route choice
  says otherwise.
- **The player:** drives the Bookmobile, the last van full of books. The player is the
  only person around who reads well, which is why survivors need them.
- **The zombies:** goofy, green, slow-thinking "Shamblers." They moan "Brrrains?" but
  mostly bump into things. They are never gruesome. When hit they POOF into green smoke.
- **Recurring crew (use them, add others freely):**
  - Captain Ruby, the mechanic who runs the garage at every haven. Blunt, kind.
  - Doc Lin, the medic. Loves puns.
  - Biscuit, a brave scruffy dog.
  - Grandpa Joe, who runs the radio and tells long stories.
  - Max and Mia, twins who draw maps of the roads.
- **Tone:** funny, brave, hopeful. Reading is a superpower. No blood, no injured
  people, no death. Grades 1 and 2 avoid anything spooky. Grades 5 and 6 may be mildly
  eerie (a foggy road, a creaky lighthouse) but never scary.

## What a haven is

At each haven a host hands the player something to read, then asks three questions,
then the player makes a route choice. The thing to read should be a **real document
from the world** whenever possible: a note, a letter, a map legend, a radio log, a
diary page, a recipe, a poster, a list of rules, instructions for a machine, a
wanted poster, a comic strip retold in words. A short story told by the host is also
fine. Vary the types across the eight passages in a grade.

Haven names to draw from (do not repeat within a grade): Red Barn, Gas-N-Go, Old
Lighthouse, Library Fort, Drive-In Theater, School Bus Camp, Water Tower, Fire Station,
Moon Diner, Mountain Lodge, Boat Dock, Mall Rooftop, Radio Tower, Greenhouse, Train
Yard, Mini-Golf Castle, Ranger Station, Bakery, Toy Shop, Zoo Gate.

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
question with three options at every grade.

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
(`zombies: 1.4`, `scrap: 30` or `crates: 3`), optionally one quirky option (`fog: true`,
`hp: 10`). Make the description honest about the tradeoff so the choice is a reading
comprehension exercise in itself.

## Schema

```js
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.CONTENT = root.ZSR.CONTENT || {};
  root.ZSR.CONTENT[3] = {
    grade: 3,
    havens: [
      {
        id: "g3-red-barn",            // unique, lowercase, "gN-" prefix
        place: "Red Barn",            // haven name in the caption box
        host: "Farmer Pat",           // who hands you the text
        intro: "Farmer Pat waves you into the barn. \"Our goat ran off. Can you read the note she left?\"",
        kind: "note",                 // note | letter | log | map | diary | recipe | poster | rules | story | sign | list
        title: "A Note From Gus",
        text: "Paragraph one.\n\nParagraph two.",
        questions: [
          { type: "detail", q: "...", options: ["a", "b", "c", "d"], answer: 2, hint: "..." },
          { type: "inference", q: "...", options: ["a", "b", "c", "d"], answer: 0, hint: "..." },
          { type: "vocab", word: "fence", q: "What does the word \"fence\" mean here?", options: ["a", "b", "c", "d"], answer: 1, hint: "..." }
        ],
        choice: {
          prompt: "Which way to the next town?",
          options: [
            { label: "The hill road", desc: "It is steep and short, and Shamblers like hills.", effects: { zombies: 1.3, scrap: 25 }, result: "You climb the hill. The engine groans but the view is worth it." },
            { label: "The river road", desc: "It is flat and long, and the fog rolls in at noon.", effects: { zombies: 0.8, length: 1.2, fog: true }, result: "The river road is quiet. Too quiet. Biscuit sniffs the fog." }
          ]
        }
      }
    ],
    roadSigns: [
      { text: "Radio: \"The bridge is out. Turn at the red barn.\"", q: "Where should you turn?", options: ["At the bridge", "At the red barn", "At the river"], answer: 1 }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
```

The wrapper function is required so the file works both in the browser (classic
`<script>` tag, no module loader, so it runs from `file://`) and in Node for the
validator.
