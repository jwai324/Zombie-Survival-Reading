# Zombie Survival

Run the last working van out of a boarded-up cabin at the edge of town. Drive to the gas
station, the grocery, the hardware store, the precinct, the hospital. Read the notes the
people before you left. Clear the walkers, open the locked rooms, bring back what the base
needs, and hold the fence when the waves come.

A grounded survival-comic game for teens. Reading is never quizzed; it is useful. The
reading level is switchable from 1st to 6th grade and changes every note, sign, and
instruction in the game without changing the facts.

## Play it

No install, no build step, no dependencies.

- **Double-click `index.html`.** It runs straight from the file.
- Or serve the folder with anything static: `npm start` (uses `http-server` on port 8080),
  `python3 -m http.server`, GitHub Pages, Netlify, or a Vercel static deploy.

Buildings and the yard are first person and need a keyboard and mouse. The map and the
road also work on touch.

## The loop

1. **Home base, cabin defense.** First person in the yard. Time runs in phases: calm
   (nothing at the fence; go inside to build, or leave in the van) and waves that are
   sometimes a few walkers and sometimes a lot. Walkers claw through the fence; the
   Walls room makes it stronger. The base is the only place the game saves.
2. **Map.** A fixed city of 15 places. Only a few are known at first; the notes you read
   and the Radio room reveal the rest. Pick a destination, see the route, drive.
3. **Road.** Top-down driving. Aim with the mouse, hold to fire, slide with A and D.
4. **Building.** The note at the door tells you what is inside and where. Inside, first
   person: W A S D to move, mouse to look, click to fire, E to read notes and open doors,
   B for the backpack. Items sit on shelves and floors. The locked cache room holds the
   best items and opens only once you have read the note that says how.
5. **Home again.** Cargo is unloaded, a day passes, the crew eats one food, the game
   saves. Build rooms with items plus scrap. Upgrade the van and the gun in the garage.

Death (wrecked van, down inside a building, overrun in the yard) reloads the last save.

## Project layout

```
index.html              all screens
css/style.css           comic-book styling; every size in rem so Huge text (1 inch) scales everything
js/world.js             THE FACTS: items, base rooms, interior templates, the yard, map locations, notes
js/content/levelN.js    THE WORDS: all in-world text at reading level N (1..6)
js/state.js             settings, the base save, the in-memory trip, room effects
js/interior.js          first person: raycaster, walkers, items, notes, caches, the yard and its waves
js/sprites3d.js         textures and sprites for first person
js/game.js              the road (top-down drive between map locations)
js/map.js               the city map and route finding
js/base.js              the cabin build menu (rooms, garage, stock)
js/backpack.js          the backpack and the note reader
js/sprites.js           road drawing (van, walkers, scenery)
js/upgrades.js          van and gun upgrades
js/audio.js             synthesized sound effects
js/main.js              screen flow
docs/GAME_SPEC.md       the design as agreed
docs/TEXT_GUIDE.md      how to write the six reading levels from the facts
tests/                  world validator, text validator, script syntax check
```

## Editing content

- **Change a fact** (where an item is, a code, who wrote a note): edit `js/world.js`, then
  update the six level files so the words still carry the fact. `npm test` checks that
  every level has every note and that numbers and revealed place names survive.
- **Change the words only:** edit `js/content/levelN.js`. Keep to the calibration table in
  `docs/TEXT_GUIDE.md`.
- **Add a location:** add it to `LOCATIONS`, `NOTES`, and `ROADS` in `js/world.js`, pick a
  template, then write its texts at all six levels.

## Tuning

- Walkers inside buildings: `SETTINGS.walkersPerLocation` in `js/world.js`.
- Waves at the base: `DEFENSE` in `js/world.js` (fence strength, calm length, wave mix, counts).
- Road difficulty: `DIFF` and `ZOMBIE_TYPES` in `js/game.js`.
- Base rooms, recipes, and effects: `BASE_ROOMS` in `js/world.js`.
- Van and gun upgrades: `js/upgrades.js`.

## Privacy

Everything stays in the browser's `localStorage`. No accounts, no network calls other than
loading three Google Fonts (the game falls back to system fonts offline).
