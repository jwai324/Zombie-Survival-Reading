# Zombie Survival: notes for anyone building on this

**This game will grow much larger.** The owner plans more places, a bigger city map, more roads,
guns, rooms and story. Build every change so it still holds at 2 to 3 times today's size:

- Derive counts and bounds from the data (`LOCATIONS`, `ROADS`, `WEAPONS`, `BASE_ROOMS`); don't
  hardcode "15 places", "5 guns", "3 levels" or the 1000 x 700 board.
- Where a fixed limit is unavoidable, put it in one named constant and tag it with a `SCALE:` comment.
- Split big content by appending files (`levelN-places3.js`, `landmarks3.js`), not by growing one file.
- Old saves must keep working. Never rename or remove a place id, never reorder a place's
  item, cache or stash spots, and append journal and radio entries instead of inserting them.

Read `docs/CREW.md` before changing June, Tomas, Pip, their quests or the dog.

Read `docs/SCALING.md` before adding a place, a road, a gun, a room, a level or a walker kind,
or before touching the map's size. It lists the add-a-place checklist, the save-compat rules, the
limits the current city already sits near, and every `SCALE:` spot (`grep -rn "SCALE:" js tests`).

## Working rules

- No build step, no dependencies: plain browser JS in `js/`, loaded by `<script>` tags in `index.html` (order matters).
- Facts live in `js/world.js`, `js/story.js`, `js/story-home.js`, and for the crew at home base
  `js/story-crew.js` and `js/story-quests.js`. Words live in `js/content/levelN*.js` at all
  six reading levels. Change a fact and you change six texts. See `docs/TEXT_GUIDE.md`.
- `npm test` runs every validator and must pass before a push.
- Record owner decisions and judgment calls in `DESIGN.md`. The agreed design is `docs/GAME_SPEC.md`.
- Teen audience: no gore in reading text, no on-page human deaths, no profanity. Walker ART may
  show blood and exposed ribs, all behind `SETTINGS.walkerGore` (owner, 2026-10-15). Reading is
  useful, never quizzed.
