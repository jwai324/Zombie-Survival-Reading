# Zombie Survival Reading: Design Decisions

This file records the questions a first pass needed answered, and the answers chosen.
Anything marked **Assumption** is a judgment call that can be changed cheaply.
Anything marked **Open** needs the owner's input before it is worth building.

## One-line pitch

You drive the last Bookmobile down an endless zombie road. Reading is your superpower:
survivors at each safe haven need you to read for them, and they pay you in scrap to
upgrade the van and the gun. Survive as many miles as you can.

## Questions and answers

### Platform and tech

**Q: Where does it run?**
Browser. Desktop (mouse + keyboard) and tablet (touch). No install. Opening `index.html`
works, as does any static host (GitHub Pages, Netlify, a Vercel static deploy).

**Q: Engine or framework?**
None. Vanilla HTML, CSS, and JavaScript, Canvas 2D for the road, DOM for the reading
pop-ups. No build step, no dependencies, no package install. **Assumption:** the
priority is minimal moving parts and something a parent can edit with a text editor.
A framework would buy nothing here and would add a toolchain to maintain.

**Q: How is the comic look done without an artist?**
Procedurally: thick black outlines, flat saturated fills, a halftone dot overlay,
comic caption boxes ("MEANWHILE..."), and burst words ("POW!", "POOF!"). Fonts are
Google Fonts (Bangers for headings, Nunito for reading text) with system fallbacks,
so the game still works offline.

**Q: Where is progress saved?**
`localStorage`, on the device. Settings, best scores, lifetime reading stats, and a
run checkpoint taken at each safe haven ("Continue" on the title screen). No accounts,
no server. **Open:** if you want progress to follow a child across devices, that
needs a backend. Not worth it for a first pass.

### The audience and the reading

**Q: Who is the player?**
A child in grades 1 to 6, probably playing on a parent's laptop or a tablet. The
grade is chosen in Settings and can be changed any time. Each grade has its own
content bank calibrated by word count, sentence length, and vocabulary
(see `docs/CONTENT_GUIDE.md`).

**Q: Where does reading happen?**
Everywhere text appears, but in two deliberate places:

1. **Safe havens** (the bulk of it). A survivor hands you something to read: a note,
   a letter, a radio log, a map legend, a diary page, a poster. You read it, answer
   three comprehension questions (detail, inference or main idea, vocabulary), then
   make a choose-your-own-adventure route choice described in text, then upgrade.
2. **Road signs** (quick hits). Once per road segment the action pauses for a one
   or two sentence message with one question. Right answer gives a small bonus.

**Q: Typing or multiple choice?**
Multiple choice only. Grades 1 and 2 get three options, grades 3 to 6 get four. A
six-year-old should not be typing. A wrong answer shows a hint and allows one retry
for half the reward, then reveals the answer. Nothing punishes a wrong answer beyond
the lost reward, so reading stays fun rather than scary.

**Q: Read-aloud?**
Yes, via the browser's built-in speech synthesis. A "Read to me" button on every
passage and question. No audio files to ship. **Assumption:** this matters most for
grades 1 and 2 and for emerging readers, and it costs nothing.

**Q: How does reading connect to winning?**
Scrap is the only currency. Zombie kills pay a little. Correct answers pay a lot
(roughly 3x the scrap of a whole road segment of shooting). The incentive is explicit:
reading well is the fastest way to a tougher van and a bigger gun.

### The game

**Q: Camera and controls?**
Top-down, road scrolls vertically, van near the bottom. Zombies come from ahead and
from both roadside edges. Aim with the mouse or a finger, hold to fire. Move the van
across the road with arrow keys, A/D, or on-screen buttons on touch. `P` or `Esc`
pauses. **Assumption:** a top-down view is the only one where "zombies from
different sides" reads clearly on a small screen.

**Q: How does a run end?**
Van health hits zero. There is no win state. The headline score is **miles survived**,
with zombies defeated and questions answered correctly as secondary stats. Best run
is kept on the device.

**Q: Difficulty curve?**
Per segment: spawn rate up, zombie health up, more runners and brutes. Route choices
multiply this (a harder road pays more scrap). Scaling is in one table in
`js/game.js` so it can be tuned without touching logic.

**Q: Zombie types?**
Three for the first pass. Walker (slow, average), Runner (fast, fragile), Brute (slow,
tanky, hits hard). Road segments later in a run bias toward Runners and Brutes.

**Q: Upgrades?**
Van: Armor (max health), Engine (speed, so more miles per segment, and faster lane
changes), Bumper (ramming damage), Paint (cosmetic color and decals). Gun: Damage,
Fire Rate, Spread (extra bullets per shot). Repair kits are a consumable. Costs rise
per level. Every upgrade is visible on the van sprite.

**Q: Is it violent?**
Cartoon only. Zombies are goofy, green, confused, and "poof" into smoke when hit.
No blood, no injured people, no screaming. Grades 1 and 2 content avoids anything
spooky; grades 5 and 6 may be mildly eerie. **Assumption:** parents will decide
whether "zombies" are fine for their kid; the game keeps the tone light.

**Q: Sound?**
Small synthesized effects via Web Audio (shots, poofs, crunch, a chime for correct
answers). Mute toggle in settings. No music in the first pass.

**Q: Session length?**
A road segment is 40 to 75 seconds, a haven is 1 to 3 minutes of reading. A ten
minute session reaches 3 to 4 havens, which is a few hundred words at grade level.

### Content volume

8 haven passages and 8 road signs per grade, 48 passages total, shuffled so repeats
are spread out. A run that reaches 8 havens has seen everything for its grade once.
Adding content is a matter of appending an object to a grade file; the validator
(`npm test`) catches schema mistakes.

## What a second pass would add

- More content per grade (16+ passages) and themed story arcs across havens.
- Per-child profiles and a parent dashboard of words read and accuracy.
- A boss zombie every fifth haven.
- Sentence-level highlighting during read-aloud.
- Music.
