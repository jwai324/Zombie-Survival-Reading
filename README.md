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
   sometimes a few walkers and sometimes a lot, from two sides or from every side.
   Walkers claw through the fence; the Walls room makes it stronger. Holes never close on
   their own: stand at a gap and press E (1 scrap each) or fix them all from the cabin menu.
   Set traps with T and R. The base is the only place the game saves.
   **What you build is what you see:** every room has its own plot in the yard, a staked lot
   with its name on a sign until it is built, then a bigger build at each level (a carport,
   then a shed, then a workshop; rain barrels, then a tank on a stand, then a water tower).
   The Walls level is the fence itself (pickets, braced planks, corrugated metal, concrete
   and razor wire) and the armor on the cabin. The van in the driveway shows its armor,
   plow, engine gear and paint; the gun in your hands shows heavier rounds, rate of fire and
   spread.
2. **Map.** A fixed city of 15 places, with named streets and side streets. Only a few
   places are known at first; the notes you read and the Radio room reveal the rest. Pick a
   destination: the route is drawn and "The way there" lists it in words.
3. **Road.** Top-down driving. Aim with the mouse, hold to fire. The road does not show the
   route: before every junction, side street and parking lot a sign says where each lane
   goes, and A and D (or the arrows, or the side buttons) change lanes. Your usual lane goes
   straight; move right to turn right; a turn lane opens on the far left to turn left. Be in
   your lane before the white stop line. A wrong turn or a missed lot sends you back to where
   you set out (damage, scrap and kills stay). The minimap in the corner shows where you are
   and flags where you are going.
4. **Building.** The note at the door tells you how many walkers wait inside and where the
   things are, by landmark: every building has four, one in each corner (the tire tower, the
   fire truck, the giant globe). Inside, first person: W A S D to move, mouse to look, click
   to fire, E to read notes and to open and close doors (walkers cannot open them), B for the
   backpack, M (or the Map button) for a map of the parts you have seen. The locked cache room
   holds the best items and opens only once you have read the note inside, which also gives
   the way there. Go back in from the map and the building is exactly as you left it; what you
   have explored is kept once you are home.
5. **Home again.** Cargo is unloaded, a day passes, the crew eats one food, the game
   saves. Build rooms with items plus scrap, upgrade the van and the gun, craft traps:
   each one is a short typing round at the garage workbench (the first time teaches
   home-row finger placement; stages progress from single keys to sentences). Repairs
   are instant and bring the van back to full.

Death (wrecked van, down inside a building, overrun in the yard) reloads the last save.
Up to four players keep their own labeled saves, picked on the title screen.

## Project layout

```
index.html              all screens
css/style.css           comic-book styling; every size in rem so Huge text (1 inch) scales everything
js/layouts.js           THE BUILDINGS: one floor plan per place, its four landmarks, wall decor, palette
js/world.js             THE FACTS: items, base rooms, the yard and its plots, map locations, roads, notes
js/streets.js           street names, side streets, lanes and decisions for a route, road text fallback
js/content/levelN.js    THE WORDS: all in-world text at reading level N (1..6)
js/state.js             settings, the base save, the in-memory trip, room effects, explored maps
js/interior.js          first-person engine: raycaster, low see-over tiles, roofs, floors and ceilings,
                        props, walkers, shooting, HUD plumbing
js/building.js          building mode: layouts, landmarks, decor, items, notes, cache, the M map
js/yard.js              yard mode: plots and their builds per level, fence by Walls level, traps, waves
js/sprites3d.js         first-person textures and sprites, the registration API, the gun, the yard van
js/decor.js             wall decor faces (signs, posters, lockers, notice boards ...)
js/landmarks1.js        landmark art: gas station, grocery, hardware, pharmacy, auto shop, electronics, garden
js/landmarks2.js        landmark art: precinct, school, fire station, hospital, water tower, lumber, mall, library
js/yardart.js           yard art: every plot at every level, fence and cabin by Walls level
js/game.js              the road: world-space drive, lanes, signs, turns, wrong-way restarts, minimap
js/map.js               the city map, street names, side streets, "The way there"
js/base.js              the cabin build menu (rooms, garage, traps, stock, fence repair, hover tips)
js/typing.js            the workbench typing game (finger lesson, stages, timer, retry)
js/bench.js             the garage workbench scene behind the typing game
js/backpack.js          the backpack (medical kits, notes) and the note reader
js/sprites.js           road drawing (van, walkers, scenery, lanes, signs, lots)
js/upgrades.js          van and gun upgrades
js/audio.js             synthesized sound effects
js/main.js              screen flow
docs/GAME_SPEC.md       the design as agreed
docs/TEXT_GUIDE.md      how to write the six reading levels from the facts
tests/                  world, text, streets, drive, engine and art validators, script syntax check
```

## Editing content

- **Change a fact** (where an item is, a code, who wrote a note): edit `js/world.js`, then
  update the six level files so the words still carry the fact. `npm test` checks that
  every level has every note, that numbers and revealed place names survive, and that each
  note names the building's landmarks.
- **Change a building:** edit its floor plan in `js/layouts.js` (the legend is at the top).
  The notes describe positions, so a moved room can make a note lie: `npm test` checks
  reachability, landmarks in their corners, and that the facts still name them; read the
  notes for that place again after any move.
- **Change the words only:** edit `js/content/levelN.js`. Keep to the calibration table in
  `docs/TEXT_GUIDE.md`.
- **Add a location:** add it to `LOCATIONS`, `NOTES`, and `ROADS` in `js/world.js`, give it a
  street name (and side streets if you like) in `js/streets.js`, draw its floor plan and
  landmarks in `js/layouts.js` (and their art), then write its texts at all six levels.

## Tuning

- Walkers inside buildings: `SETTINGS.walkersPerLocation` in `js/world.js`.
- Waves at the base: `DEFENSE` in `js/world.js` (fence strength, calm length, wave mix, counts,
  how many sides a wave comes from).
- Road difficulty: `DIFF` and `ZOMBIE_TYPES` in `js/game.js`; lane and junction geometry:
  `GEOM` in `js/streets.js`.
- Base rooms, recipes, and effects: `BASE_ROOMS` in `js/world.js`; what each level looks like
  in the yard: `BUILDS` in `js/yard.js`.
- Van and gun upgrades: `js/upgrades.js`.

## Privacy

Everything stays in the browser's `localStorage`. No accounts, no network calls other than
loading three Google Fonts (the game falls back to system fonts offline).
