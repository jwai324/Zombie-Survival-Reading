# Zombie Survival Reading

Drive the last Bookmobile down an endless zombie road. Reading is your superpower.
A comic-style survival game for grades 1 to 6 where every upgrade is paid for by reading.

## Play it

No install, no build step.

- **Double-click `index.html`.** It runs straight from the file.
- Or serve the folder with anything static: `npm start` (uses `http-server` on port 8080),
  `python3 -m http.server`, GitHub Pages, Netlify, or a Vercel static deploy.

Works on desktop (mouse + keyboard) and tablets (touch). Progress saves on the device.

## How it plays

1. **The road.** Top-down. Aim with the mouse or a finger, hold to fire. Move the van with
   the arrow keys, `A`/`D`, or the on-screen arrows. Zombies come from ahead and from both
   sides. Don't let them touch the van. `P` or `Esc` pauses.
2. **A road sign.** Once per road the action pauses for a one-sentence message and one
   question. Right answer, small scrap bonus.
3. **A safe haven.** A survivor needs you to read something: a note, a letter, a radio
   log, a map legend. Read it, answer three questions (detail, inference, vocabulary),
   then choose which road to take next. Right answers pay scrap.
4. **The garage.** Spend scrap on the van (armor, engine, spiked bumper, paint) and the gun
   (damage, fire rate, spread shot), or buy a repair.
5. Repeat forever. The score that matters is **miles survived**.

Reading level is set in Settings (1st through 6th grade), along with text size, a
"Read to me" button (browser speech), sound, aim assist, and screen shake.

## Project layout

```
index.html            all screens (title, settings, road HUD, road sign, haven, pause, game over)
css/style.css         comic-book styling
js/state.js           settings, best scores, lifetime stats, run checkpoint (localStorage)
js/upgrades.js        upgrade definitions, costs, derived van/gun stats  <- tune here
js/game.js            the road: spawning, shooting, collisions, difficulty table  <- tune here
js/haven.js           reading, questions, route choice, garage, road-sign pop-up
js/sprites.js         procedural comic drawing (van, zombies, road, bursts, fog, night)
js/audio.js           synthesized sound effects
js/speech.js          read-aloud via speechSynthesis
js/main.js            screen flow and wiring
js/content/gradeN.js  reading content, one file per grade
docs/CONTENT_GUIDE.md how to write passages, questions, and route choices
tests/                content validator and script syntax check
DESIGN.md             the design questions and the answers chosen
```

## Adding content

Open `js/content/gradeN.js`, copy an existing haven object, and edit it. Then run:

```
npm test
```

The validator checks ids, question counts, answer indexes, option counts per grade,
vocabulary words appearing in the passage, and effect keys and ranges. It warns on
passage length and sentence length outside the grade targets. See
`docs/CONTENT_GUIDE.md` for the world, tone, and calibration rules.

## Tuning

- Difficulty curve: `DIFF` and `ZOMBIE_TYPES` at the top of `js/game.js`.
- Upgrade costs and effects: `DEFS`, `REPAIR`, and `stats()` in `js/upgrades.js`.
- Reading rewards: `REWARD` at the top of `js/haven.js`.

## Privacy

Everything stays in the browser's `localStorage`. No accounts, no network calls other
than loading two Google Fonts (the game falls back to system fonts offline).
