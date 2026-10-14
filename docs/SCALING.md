# Growing the Game

The owner plans to make the city and the game much larger: more places, more roads, a bigger map,
more guns, items, rooms and story. Today's sizes are a starting point, not a design limit.
This file lists where the current size is baked in, what breaks first, and how to add things
without breaking old saves. In the code these spots carry a `SCALE:` comment (`grep -rn "SCALE:" js tests`).

**Rule for every change:** build for N places, not for 15. Before you hardcode a count, a
coordinate bound, a list of ids or a "first half / second half" split, ask whether it still
holds at 40 places. If it doesn't, derive the value from the data, or put it in one named
constant with a `SCALE:` comment.

## Today's size (2026-10-14)

| Thing | Now | Where |
|-------|-----|-------|
| Places | base + 15 buildings + River Landing (17 `LOCATIONS`) | `js/world.js` |
| Roads / junctions / side streets | 23 / 1 (`frog`) / 19 | `js/world.js`, `js/streets.js` |
| City board | 1000 x 700 map units, places at x 80..880, y 180..610 | `js/map.js` `MW`/`MH` |
| Key ring | one closed ring of 15 | `js/world.js` `KEYS` |
| Guns on foot | pistol + 4 hidden, slots 1-5, pole on 6 | `js/weapons.js`, `js/interior.js` |
| Base rooms / plots | 11 rooms x 3 levels, 10 yard plots | `js/world.js` |
| Reading levels | 6 | `js/content/`, `index.html`, tests |
| Journal / radio | 30 entries each | `js/story-home.js` |
| Crew | 3 crew, 22 spots, 30 topics and 16 moods, 15 story quests, 11 errands, 1 dog | `js/story-crew.js`, `js/story-quests.js` |
| Danger | 1..5 | `LOCATIONS[].danger`, `js/map.js` pips |

## What breaks first

### Already at the limit

The current city sits close to three hard test limits:

| Limit | Now | Ceiling | Where |
|-------|-----|---------|-------|
| Longest drive | 137 s | 150 s | `tests/validate-streets.js` |
| Shortest lane window | 2.53 s | 2.5 s | `GEOM.winMin` |
| Tightest turn arc | 99 px | 95 px | `MIN_ARC` |

Any new road, and any place pushed further out, will likely trip one of them. Decide on purpose
whether the ceiling moves (a longer drive is a design choice) or the geometry changes.

### The board is a fixed 1000 x 700 box

`MW`/`MH` in `js/map.js` and the canvas and `aspect-ratio: 10/7` in `index.html` and
`css/style.css` fix the board's size. `clampView`, `fitAll`, label edge penalties and font
scaling all assume it. `tests/validate-streets.js` also requires side streets inside
20..980 / 20..680.

- **Denser city in the same box:** labels, icons (24 map units) and badges start to overlap.
  This option is cheap and works up to a point.
- **Bigger box:** turn `MW`/`MH` into values derived from the bounds of `LOCATIONS`, or keep
  them as constants and change them together with the canvas, the CSS aspect ratio, the test
  bounds and the hand-drawn scenery below. Drives get longer because road seconds scale with
  map distance (`GEOM.minScale`). Revisit `SETTINGS.tripMaxSeconds` and the drive-time ceiling.
- **Hand-drawn scenery is in map units:**
  - The river curve is drawn twice with the same points, in `js/map.js` and `js/sprites.js`.
    The `sprites.js` copy assumes the river lies west of x = 140.
  - The hills, the `DISTRICTS` labels and the compass sit at fixed coordinates.
  - All of these must move if the board grows.
- **Districts and regions:** if the city outgrows one screen, the map may need regions or
  chunks. Nothing in the code supports that yet.

### The road graph

- **Lanes:**
  - A decision point gets one lane per road out, plus the place's own drive.
  - `ourLeft(n)` in `js/streets.js` fits at most 4 lanes on our half of the road.
  - So a building can have at most 4 roads (Reyes Hardware already has 4), and a bare junction at most 5.
  - A busier corner needs a wider road (`GEOM.half`) or a split into two junctions.
- **Routing:**
  - `Streets.route` is Dijkstra with a linear-scan minimum, and it rebuilds the graph on every call.
  - That is fine for hundreds of nodes. Past that, cache the graph and use a heap.
  - `js/map.js` has a fallback copy, used only when Streets is not loaded.
- **Scenery:**
  - `buildScenery` in `js/game.js` lays props along every road in the city, not just the route.
  - The minimap draws every road each frame, with no culling.
  - Both costs grow with total city size. Cull to the route's bounding box when drives start to stall.
- **Note text is tied to routes:**
  - A note that names a street must name one on the shortest route to a place it reveals; `tests/validate-text.js` checks this.
  - A new road can change shortest routes and fail old notes at all six levels.
  - Compass words in notes ("east of here") are not checked at all. Reread neighbouring notes after moving a place.

### Tests scale as O(N²) or worse

`validate-streets` and `validate-drive` drive every ordered pair of places at two speeds.

- With 17 places they take about 5 s and 8 s.
- Doubling the places makes them about 4 to 16 times slower.
- When `npm test` gets slow, sample the pairs (all pairs touching changed places, plus a fixed
  random set) behind a flag, and keep the full sweep for CI.

### Fixed counts in code

| Count | Where | What to do when it grows |
|-------|-------|--------------------------|
| 4 landmarks, one per corner | `js/building.js`, `js/layouts.js` legend, `tests/validate-world.js` | Fine for bigger buildings. Multi-wing buildings need a new legend and a new note rule. |
| Note spots 1..7 | `js/layouts.js`, `tests/validate-world.js` | Raise the limit in both. |
| Gun slots 1..5, pole on 6 | `js/interior.js` keys, `tests/validate-weapons.js`, how-to text at all 6 levels, `index.html`, `main.js`, `base.js`, `building.js`, `river.js` | A 6th gun collides with the pole. Move tools to their own key or cycle-only, and rewrite the control text. |
| 3 levels per base room | `js/state.js` (`maxBaseLevel`, `Math.min(level, 3)`), `js/base.js`, tests | Derive from `BASE_ROOMS[k].levels.length`. |
| Danger 1..5 | `js/map.js` pips and "of 5", `js/base.js` gun hint, `js/weapons.js` bands | Add a `MAX_DANGER` constant before adding danger 6. |
| Walkers per building, capped at 14 | `SETTINGS.walkersPerLocation`, number words in `tests/validate-world.js` | Door notes promise the day-1 count, so changing the formula breaks notes. |
| Radio reveal 3, then all (99) | `BASE_ROOMS.radio`, `js/state.js` `upgradeRoom` | "All" reveals every building at once, which is not much fun with 40 places. Make it stepped. |
| "Fifteen keys" | `js/story.js`, Reyes' note at all 6 levels, `level6.js` how-to | Reword to "a key for every stash" so it doesn't need editing. |
| Journal repeat window | `js/state.js` (`floor(len/3)`) | Fine. The "21 to 30 repeat" comments in `story-home.js` go stale. |

### Content files and load order

- **Place text:**
  - `levelN-places1.js` holds the first 7 buildings and `-places2.js` the next 8.
  - Add `-places3.js` and so on rather than growing the files. Each one merges into `T.locations` by id.
  - Every new file needs a `<script>` tag in `index.html`. `validate-text.js` finds the new file itself and warns if the tag is missing.
- **`levelN.js` must load before its part files:** it assigns `ZSR.TEXT[n] = {...}` and would wipe anything loaded before it.
- **Landmark art:** split the same way (`landmarks1.js`, `landmarks2.js`). Add `landmarks3.js`
  and so on. These tests have hardcoded file lists that also need the new file:
  - `tests/validate-art.js` (`ART_FILES`)
  - `tests/validate-engine.js` (`WANT`)
  - `tests/validate-world.js`
  - `tests/validate-streets.js`
  - `tests/validate-text.js`
- **Size:** one game load parses every level file. At 3 to 4 times today's content, think about
  loading only the active reading level (the files are already per level).

## Old saves must keep working

Players have saves in `localStorage`. `upgradeSave` in `js/state.js` only fills in fields that are
missing. Growth rules:

- **Never rename or remove a place id.** `loc`, `known`, `keys`, `backpack[].locId` and
  `weapons.where` all key on it. Retire a place by hiding it, not by deleting it.
- **Never reorder `items` / `cache` / `stash` arrays, and never move `i`/`c`/`k` spots in an
  existing layout.** Old saves record what was taken by reading-order index (`"i0"`, `"c1"`), so
  a reorder silently gives back or takes away the wrong things.
- **Append journal and radio entries; never insert them in the middle.** `log[]` stores indices into them.
- **Re-wiring `KEYS` changes what keys already in old saves open.** Insert a new place into the
  ring next to places a save is unlikely to have reached, and accept the edge case. Or migrate it.
- **New places don't reach old saves by themselves.**
  - `known` is never recomputed, so a note an old save has already read won't reveal a place added later.
  - A Radio room an old save has already built won't reveal it either.
  - Add a migration step that replays `reveals` from the backpack and the Radio reveal. Give it a
    version bump so it runs once.
- **Guns are rolled once per save.** New buildings never get one of the existing guns in an old
  save. A new gun needs a `Weapons.upgradeSave` roll; check that it avoids buildings that already hold one.
- **Editing a lock spec** (pattern, options or the order of variants) changes that place's answer in
  existing saves. New places are safe: answers hash from (seed, place id).
- **A yard grid change needs `YARD.version` bumped,** or the fence and the traps land on the wrong tiles.
- **Bump `version` (now 3) when a migration must run once,** and branch on it in `upgradeSave`.

## Add a place: the checklist

1. `js/world.js` `LOCATIONS`: id, x/y, type, danger, `template` (= id), items, cache, cacheName,
   stash, stashName, and `known` only if it is a starting place.
2. `js/world.js` `LOCKS[id]`. Panel coordinates refer to the layout grid.
3. `js/world.js` `KEYS`: insert into the ring. Two entries change, and so do both neighbours' key notes.
4. `js/world.js` `NOTES[id]`: the door note and the main note (`unlocks`, `reveals`). Add the new id
   to another note's `reveals` so it can be found.
5. `js/world.js` `ROADS`. A building needs at least 2 roads to get its own drive; with 1 road it
   sits at the road's end, like River Landing. At most 4 roads (see lanes above). Add `JUNCTIONS`
   for corners with no place.
6. `js/streets.js`: `STREET_NAMES["a|b"]` for each new road, keyed in `ROADS` order. Add
   `SIDE_STREETS` to keep at least 0.7 per road. `SURFACE` is optional.
7. `js/layouts.js` `LAYOUTS[id]`:
   - a grid with E, L, Q, n, y, the i/c/k counts, landmarks 1-4, `spots` 2-7 and `signs`
   - the palette
   - new `LAYOUT_ART` keys, with their art in a `js/landmarksN.js` file
8. `js/story.js` `STORY[id]`:
   - trail1 and trail2 (trail2 `reveals` the place its key opens)
   - dead1 to dead4 (minLevel 1, 1, 4, 6)
   - one sign per layout sign, and the key
   - Redo the trail2 and key of the building whose key now points here.
9. Text at all six levels (`T.locations[id]`): blurb, door, every note at or below that level,
   signs, key. Reread neighbouring notes for street names and compass words.
10. A new `type` needs an entry in each of:
    - `js/map.js` `TYPE_LABEL` and roof colours
    - `js/sprites.js` `ROOF` and the lot art
11. An outdoor place (like River Landing) follows `RIVER` in `js/world.js`, `js/river.js` and the
    river special cases in `js/streets.js`, `js/map.js` and `js/state.js`. If there will be more
    than one, generalise those `type === "river"` checks into an `outdoor` handler first.
12. Check:
    - the gun danger bands
    - door-note walker counts against `walkersPerLocation`
    - the radio key-ring tips (`js/story-home.js`, checked by hand)
    - the counts in `README.md` and `docs/GAME_SPEC.md`
13. Decide the old-save migration (see above).
14. `npm test`.

## The crew

The crew at home base is data-driven (`docs/CREW.md`): a fourth crew member, more topics, more
quests or errands need facts and words, not engine changes, within these limits.

- **Ids are permanent.** Topic, mood, quest and errand ids are stored in saves (`crew.heard`,
  `crew.quests`, `crew.errand`, `crew.read`). Append; never rename, reorder within a giver (quests
  are offered in array order) or remove one.
- **A new crew member** needs posts (checked by `tests/validate-crew.js` at every room level), a
  `crewart.js` look (the art validator fails without one), tips for every tip id the engine knows,
  and room in the shelter (`CREW_RULES.shelter`: three tiles today; more crew than tiles share them).
  `upgradeSave` fills its save fields in old saves.
- **Quest spots** are fixed tiles beside a landmark, at most `QUESTS_PER_PLACE` (2) per building
  (`tests/validate-world.js`). Moving a landmark or redrawing a room means rechecking the spots and
  rewriting those briefs at six levels. A gun that lands on a quest tile takes the next tile.
- **Errands** need their item on some place's restocking shelves; offers skip items no known place
  stocks.
- **A new item** needs `one` and `many` count forms in `WORLD.ITEMS` (`tests/validate-crew.js`
  checks), used for rewards and the build tip.
- **The yard.** Posts are hand-placed tiles: moving a plot, the van or a cabin room means
  rechecking them (`npm test` does).
- `SCALE:` spots: `CREW_RULES.stars` (one entry per star), `requestsPerCrew` (one errand slot in the
  save), the `crew.read` list, the dog's trail lengths (`js/crew.js`, `js/building.js`), the walker
  look-ahead for Pip's tip (`js/crewstate.js`), `QUESTS_PER_PLACE`, and the How it works paragraph
  bound (`tests/validate-text.js`).
- `npm test` drives a full play-through of every story quest on the real facts and the crew in the
  yard and every quest building (`tests/validate-crew.js`, about 10 of npm test's 46 seconds); it
  grows with the number of quests.

## Refactors worth doing before the next big jump

These are ordered by payoff. None is needed until the matching limit is hit.

1. **A migration step for reveals** (replay `reveals` from the backpack and the Radio). Without it,
   every new place is invisible to existing players until they reread a note.
2. **Derive board size from the data** (or make it one shared constant used by the map, the CSS, the
   tests and the scenery).
3. **Move the pole off key 6** before adding a sixth gun.
4. **Sample route pairs in the streets and drive tests** once `npm test` passes about 30 s.
5. **Cull road scenery and the minimap** to the route's area once drive start-up or frame time
   shows it.
6. **Per-level lazy loading of text** once the content files pass a few MB.
