# Zombie Survival: Design Decisions

This file records the questions a first pass needed answered, and the answers chosen.
Anything marked **Assumption** is a judgment call that can be changed cheaply.
Anything marked **Open** needs the owner's input before it is worth building.

## One-line pitch

You drive the last Bookmobile, an armored library van, down an endless road after the
Fall. You are the convoy's reader: at every safe haven someone hands you a radio log, a
supply list, a letter, a warning, and what you read decides what happens next. Reading
pays scrap. Scrap upgrades the van and the gun. Survive as many miles as you can.

## Questions and answers

### Audience

**Q: Who is the game for?**
Teens. The look is a grounded, realistic survival comic (heavy ink, muted palette,
halftone, aged paper, hazard amber), the tone is tense and hopeful, and nothing in the
game is cute. Reading is on the page only; there is no read-aloud. **Assumption:** PG. Walkers are a threat, not a joke and not a horror
show. No blood, no on-page deaths, no injuries described, no profanity.

**Q: Then why reading levels from 1st to 6th grade?**
Because reading level and interest level are different things. The content is "high
interest, low readability": a teen who reads at a 2nd grade level gets a tense radio
log written in six-word sentences, not a picture book. Only sentence length, passage
length, and vocabulary change with the grade. The reading level is set in Settings and
can be changed at any time; it takes effect at the next haven.

### Platform and tech

**Q: Where does it run?**
Browser. Desktop (mouse + keyboard) and tablet (touch). No install. Opening `index.html`
works, as does any static host (GitHub Pages, Netlify, a Vercel static deploy).

**Q: Engine or framework?**
None. Vanilla HTML, CSS, and JavaScript, Canvas 2D for the road, DOM for the reading
screens. No build step, no dependencies, no package install. **Assumption:** minimal
moving parts beats a toolchain. Anyone can edit it with a text editor.

**Q: How is the comic look done without an artist?**
Procedurally: thick ink outlines, flat muted fills, a halftone overlay, a vignette,
caption boxes, and burst words ("BLAM!", "SLAM!"). Fonts are Google Fonts (Oswald for
headings, Bangers for captions and bursts, Inter for reading text) with system
fallbacks, so the game still works offline. Every upgrade is visible on the van.

**Q: Where is progress saved?**
`localStorage`, on the device. Settings, best scores per reading level, lifetime
reading stats, and an exact bookmark of the current run: the road snapshot (clock,
modifiers, van position, walkers), the open road sign and whether it was answered,
or the haven step with every answer and purchase. "Continue" on the title screen
reopens that spot. The road autosaves every three seconds. No accounts, no server. **Open:** progress that follows a player
across devices needs a backend. Not worth it for a first pass.

### The reading

**Q: Where does reading happen?**
Everywhere text appears, but in two deliberate places:

1. **Safe havens** (the bulk of it). A survivor hands you a found document: a radio
   log, a supply list, a letter, a map legend, posted rules, a diary page, instructions
   for a pump. You read it, answer three comprehension questions (detail, inference,
   vocabulary), then make a route choice described in text, then upgrade.
2. **On the road** (quick hits). Once per road segment the action pauses for a one or
   two sentence message (a painted warning, a radio burst) with one question.

**Q: Typing or multiple choice?**
Multiple choice only. Grades 1 and 2 get three options, grades 3 to 6 get four. A wrong
answer shows a hint and allows one retry for half the reward, then reveals the answer.
Nothing punishes a wrong answer beyond the lost scrap.

**Q: Read-aloud?**
No. The first pass had a browser-speech "Read to me" button on every passage; the
owner asked for it to be removed. The module is in git history if it is ever wanted
back.

**Q: Can the player leave from anywhere?**
Yes. A Home button sits on the road HUD, the road-sign pop-up, the haven panel, the
pause menu, and the game-over screen. Leaving saves the exact spot, and Continue
returns to it: mid-road with the same walkers on screen, the same open sign in the
same answered state, or the same haven step (reading, a half-answered question,
the route result, the garage with purchases made). A wrecked van ends the run
instead of saving it.

**Q: How does reading connect to winning?**
Scrap is the only currency. Walker kills pay a little. Correct answers pay a lot
(roughly 3x the scrap of a whole road segment of shooting). The incentive is explicit:
reading well is the fastest way to a tougher van and a bigger gun.

### The game

**Q: Camera and controls?**
Top-down, road scrolls vertically, van near the bottom. Walkers come from ahead and
from both shoulders. Aim with the mouse or a finger, hold to fire. Slide the van across
the road with arrow keys, A/D, or on-screen buttons on touch. `P` or `Esc` pauses.

**Q: How does a run end?**
Van health hits zero. There is no win state. The headline score is **miles survived**,
with walkers downed and questions answered correctly as secondary stats. Best run is
kept per reading level.

**Q: Difficulty curve?**
Per segment: spawn rate up, walker health up, more sprinters and bruisers. Route
choices multiply this (a harder road pays more scrap). Scaling is in one table in
`js/game.js`. **Open:** the curve has been smoke-tested, not play-tested. Expect to
tune `DIFF` after a few real runs.

**Q: Walker types?**
Three for the first pass. Walker (slow, average), Sprinter (fast, fragile, hooded),
Bruiser (slow, tanky, hits hard). Later segments bias toward Sprinters and Bruisers.

**Q: Upgrades?**
Van: Armor Plating (max health), Engine Tune (speed, more miles per segment, faster
dodges), Ram Plow (damage to walkers that touch the van), Paint & Decals (cosmetic).
Gun: Heavier Rounds, Rate of Fire, Spread Shot. Field Repair is a consumable. Costs
rise per level.

**Q: Sound?**
Small synthesized effects via Web Audio (shots, hits, a thud, a chime for correct
answers). Mute in Settings. No music in the first pass.

**Q: Session length?**
A road segment is 45 to 75 seconds, a haven is 1 to 3 minutes of reading. A ten minute
session reaches 3 to 4 havens, which is a few hundred words at grade level.

### Content volume

8 haven passages and 8 road messages per grade, 48 passages total, shuffled so repeats
are spread out. A run that reaches 8 havens has seen everything for its grade once.
Adding content is a matter of appending an object to a grade file; the validator
(`npm test`) catches schema mistakes. See `docs/CONTENT_GUIDE.md`.

## What a second pass would add

- More content per grade (16+ passages) and story arcs that carry across havens.
- Per-player profiles and a dashboard of words read and accuracy.
- A boss walker every fifth haven.
- Sentence-level highlighting during read-aloud.
- Music and ambient sound.
