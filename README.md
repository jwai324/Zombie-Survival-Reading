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
   Walls room makes it stronger. Holes never close on their own: stand at a gap and press
   E (1 scrap each) or fix them all from the cabin menu. Set traps with T and R. The
   base is the only place the game saves.
2. **Map.** A fixed city of 15 places. Only a few are known at first; the notes you read
   and the Radio room reveal the rest. Pick a destination, see the route, drive.
3. **Road.** Top-down driving. Aim with the mouse, hold to fire, slide with A and D.
4. **Building.** The note at the door tells you what is inside and where. Inside, first
   person: W A S D to move, mouse to look, click to fire, E to read notes and to open and
   close doors (walkers cannot open them), B for the backpack (notes and medical kits).
   Items sit on shelves and floors, and each has a tag you read as you pick it up. The
   locked cache room holds the best items and opens only once you have read the note that
   says how. Every building also has a locked **stash** whose key is hidden in a *different*
   building: one note leads to a second, and the second says where the key is and which
   stash it opens (the keys form a ring around the town). Walls carry signs and graffiti you
   read by walking up to them. Higher reading levels place more notes in each building,
   some of them wrong or out of date. Go back in from the map and the building is exactly
   as you left it.
   Four more guns lie on the floor of four buildings, different ones in every save:
   double pistols, a machine gun, a heavy machine gun, and a bow and arrow. Walk over one
   to pick it up; bring it home to keep it. 1 to 5, Q or the mouse wheel switch guns.
5. **Home again.** Cargo is unloaded, a day passes, the crew eats one food, the game
   saves, and you read the day's page: a recap, June's journal, and (once the Radio room is
   built) a broadcast from Jo or one of the town's voices. In the yard, each outdoor room
   (Garden, Farm, Well, Water, Power, Radio, Lab) has a lot with a painted sign: walk up to
   it to read what it is, what the next level needs, and why it is locked. Build rooms with items plus scrap, upgrade the van and its gun, mod your guns
   (damage, range, fire rate, accuracy) in the Weapons tab, craft traps:
   each one is a short typing round at the garage workbench (the first time teaches
   home-row finger placement; stages progress from single keys to sentences). Repairs
   are instant and bring the van back to full.

Death (wrecked van, down inside a building, overrun in the yard) reloads the last save.
Up to four players keep their own labeled saves, picked on the title screen.

## Project layout

```
index.html              all screens
css/style.css           comic-book styling; every size in rem so Huge text (1 inch) scales everything
js/world.js             THE FACTS: items, base rooms, interior templates, the yard, map locations, the key ring, notes
js/story.js             story facts inside buildings: trail and dead-end notes, wall signs, stash keys
js/story-home.js        story facts at home: June's journal, the radio, item tags, the yard lot signs
js/content/levelN*.js   THE WORDS at reading level N (1..6): levelN.js (how it works, rooms, typing),
                        levelN-places1.js and -places2.js (every building), levelN-home.js (journal, radio, tags, lots)
js/state.js             settings, the base save, the in-memory trip, room effects
js/interior.js          first person: raycaster, walkers, items, notes, caches, the yard and its waves
js/sprites3d.js         textures and sprites for first person, and the 3D guns in hand
js/game.js              the road (top-down drive between map locations)
js/map.js               the city map and route finding
js/base.js              the cabin build menu (rooms, garage, traps, stock, fence repair, hover tips)
js/typing.js            the workbench typing game (finger lesson, stages, timer, retry)
js/bench.js             the garage workbench scene behind the typing game
js/backpack.js          the backpack (medical kits, notes) and the note reader
js/sprites.js           road drawing (van, walkers, scenery)
js/upgrades.js          van and van-gun upgrades (the road)
js/weapons.js           guns carried on foot: stats, mods, where each one is hidden
js/audio.js             synthesized sound effects
js/main.js              screen flow
docs/GAME_SPEC.md       the design as agreed
docs/TEXT_GUIDE.md      how to write the six reading levels from the facts
docs/STORY.md           the people, the story threads, the key ring, and every building map
tests/                  world validator, text validator, script syntax check, word counter
```

## Editing content

- **Change a fact** (where an item is, a code, who wrote a note): edit `js/world.js`, then
  update the six level files so the words still carry the fact. `npm test` checks that
  every level has every note and that numbers and revealed place names survive.
- **Change the words only:** edit the `js/content/levelN*.js` files. Keep to the calibration
  table in `docs/TEXT_GUIDE.md`. `node tests/count-words.js` shows words per file; every
  level must keep at least four times its pre-expansion reading (`npm test` checks).
- **Change a story fact** (a trail note, a sign, a key, a journal day, a broadcast): edit
  `js/story.js` or `js/story-home.js`, then the six levels. See `docs/STORY.md`.
- **Add a location:** add it to `LOCATIONS`, `NOTES`, and `ROADS` in `js/world.js`, pick a
  template, then write its texts at all six levels.

## Tuning

- Walkers inside buildings: `SETTINGS.walkersPerLocation` in `js/world.js`.
- Waves at the base: `DEFENSE` in `js/world.js` (fence strength, calm length, wave mix, counts).
- Road difficulty: `DIFF` and `ZOMBIE_TYPES` in `js/game.js`.
- Base rooms, recipes, and effects: `BASE_ROOMS` in `js/world.js`.
- Van and van-gun upgrades: `js/upgrades.js`.
- Guns on foot (damage, fire rate, range, spread, noise, pierce, mod prices, which danger
  levels each one can be hidden at): `js/weapons.js`. How each sits in your hands:
  `POSES` in `js/sprites3d.js`.

## Privacy

Everything stays in the browser's `localStorage`. No accounts, no network calls other than
loading three Google Fonts (the game falls back to system fonts offline).
