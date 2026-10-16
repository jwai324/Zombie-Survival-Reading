# Growing the Game

The owner plans to make the city and the game much larger: more places, more roads, a bigger map,
more guns, items, rooms and story. Today's sizes are a starting point, not a design limit.
This file lists where the current size is baked in, what breaks first, and how to add things
without breaking old saves. In the code these spots carry a `SCALE:` comment (`grep -rn "SCALE:" js tests`).

**Rule for every change:** build for N places, not for 15. Before you hardcode a count, a
coordinate bound, a list of ids or a "first half / second half" split, ask whether it still
holds at 40 places. If it doesn't, derive the value from the data, or put it in one named
constant with a `SCALE:` comment.

## Today's size (2026-10-15)

| Thing | Now | Where |
|-------|-----|-------|
| Places | base + 15 buildings + River Landing (17 `LOCATIONS`) | `js/world.js` |
| Roads / junctions / side streets | 23 / 1 (`frog`) / 19 | `js/world.js`, `js/streets.js` |
| City board | 1000 x 700 map units, places at x 80..880, y 180..610 | `js/map.js` `MW`/`MH` |
| Key ring | one closed ring of 15 | `js/world.js` `KEYS` |
| Guns on foot | pistol + 4 hidden, slots 1-5, pole on 6 | `js/weapons.js`, `js/interior.js` |
| Base rooms / plots | 11 rooms x 3 levels, 10 yard plots | `js/world.js` |
| Yard | 55 x 68 tiles (3,740), 210 fence segments | `js/world.js` `YARD` |
| Walker kinds | 6 (walker, runner, brute, lanky, armored, screamer), 7 themed places, 15 walker rules in 14 buildings | `js/world.js` `WALKER_TYPES`, `WALKER_THEMES`, `NOTES[id].walkers` |
| Walkers at once | up to 14 a building, 40 in an alarm; a heavy yard wave is 7 + day + waves held, with no cap | `SETTINGS.walkersPerLocation`, `ALARM.cap`, `DEFENSE.manyCount` |
| Reading levels | 6 | `js/content/`, `index.html`, tests |
| Journal / radio | 30 entries each | `js/story-home.js` |
| Crew | 3 crew, 22 spots, 30 topics and 16 moods, 15 story quests, 11 errands, 1 dog | `js/story-crew.js`, `js/story-quests.js` |
| Tutorial | 5 yard steps and the ready card, 6 screen cards (map, road, door, building, lock, river) | `js/tutorial.js` `YARD_STEPS`, `CARDS` |
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

- With 17 places they take about 5 s and 9 s.
- Doubling the places makes them about 4 to 16 times slower.
- When `npm test` gets slow, sample the pairs (all pairs touching changed places, plus a fixed
  random set) behind a flag, and keep the full sweep for CI.
- `validate-engine` is the slowest validator (about 55 s of npm test's 95 s on the shared build
  container). It enters every building `SPAWN_TRIPS` (6) times on days 1 and 40, walks a walker from
  every wreck spot in the yard (349 today: it grows with yard plots and room levels), and renders
  every kind in every state. More places, rooms or kinds make it slower; sample there first.

### Walkers on screen

Every walker on foot is a live 3D model (`js/walker3d.js`), drawn into its own canvas whenever it
looks different. A near full-detail figure costs 2-4 ms on a software canvas (about 0.8 ms at lod 1,
0.35 ms at lod 2), so frame time, not memory, limits crowds. The measurements and the reasons are in
`DESIGN.md` ("Walkers v2").

- The `LIVE_NEAR` (3) nearest full-detail walkers redraw every frame they change; the rest take turns
  under `LIVE_RENDERS_MAX` (10) redraws a frame, each at most every `FAR_EVERY` (2) frames, at
  `FAR_LOD` 1 detail. More walkers on screen mean slower animation for the far ones, not slower frames.
- `LIVE_MAX_PX` (320) caps a render's height; nearer pictures are scaled up.
- Bigger crowds go in the governor (`LIVE_LEVELS`, `js/interior.js`): a row below for cheaper
  settings, a row above for a faster target machine. Re-run the pinned A/B before raising
  `LIVE_NEAR`, `LIVE_RENDERS_MAX` or `LIVE_MAX_PX`.
- `ALARM.cap` (40) is the most walkers a building holds while its alarm rings, so it is a frame-time
  knob too; validate-world wants it at least the biggest `walkersPerLocation` + 6.
- A heavy yard wave has no cap (`DEFENSE.manyCount`: 7 + day + waves held). A heavy wave of 30 measured
  1.05x the old sprites' render time because most of it is far away (lod 2); dozens near you at once
  through one breach is the case to watch.
- `FALLEN_MAX` (24) and `BLOOD_MAX` (200) in `js/interior.js`, `ROAD_FALLEN_MAX` (24) and
  `ROAD_PARTICLE_CAP` (400) in `js/game.js` cap the downed and the blood; past them the oldest go (the
  road skips a hit's blood instead).
- Walker3D's colour-string table (`CC_N`, 16384) holds every colour the six kinds use at every light
  and fog step (about 4,000 to 7,000). More kinds and variants need more; validate-art's
  `WALKER_COLOURS` (6000) fails first.

### Fixed counts in code

| Count | Where | What to do when it grows |
|-------|-------|--------------------------|
| 4 landmarks, one per corner | `js/building.js`, `js/layouts.js` legend, `tests/validate-world.js` | Fine for bigger buildings. Multi-wing buildings need a new legend and a new note rule. |
| Note spots 1..7 | `js/layouts.js`, `tests/validate-world.js` | Raise the limit in both. |
| Gun slots 1..5, pole on 6 | `js/interior.js` keys, `tests/validate-weapons.js`, how-to text at all 6 levels, `index.html`, `main.js`, `base.js`, `building.js`, `river.js` | A 6th gun collides with the pole. Move tools to their own key or cycle-only, and rewrite the control text. |
| 3 levels per base room | `js/state.js` (`maxBaseLevel`, `Math.min(level, 3)`), `js/base.js`, tests | Derive from `BASE_ROOMS[k].levels.length`. |
| Danger 1..5 | `js/map.js` pips and "of 5", `js/base.js` gun hint, `js/weapons.js` bands | Add a `MAX_DANGER` constant before adding danger 6. |
| Walkers per building, capped at 14 | `SETTINGS.walkersPerLocation`, number words in `tests/validate-world.js` | Door notes promise the day-1 count, so changing the formula breaks notes. Every walker rule must fit every count up to `RULE_DAYS` (validate-world R6, R7). |
| A room build's strength, one per level | `DEFENSE.buildHp` (index 0: not built) | A fourth room level needs a fourth entry; validate-world wants `levels + 1` entries, rising. |
| Radio reveal 3, then all (99) | `BASE_ROOMS.radio`, `js/state.js` `upgradeRoom` | "All" reveals every building at once, which is not much fun with 40 places. Make it stepped. |
| "Fifteen keys" | `js/story.js`, Reyes' note at all 6 levels, `level6.js` how-to | Reword to "a key for every stash" so it doesn't need editing. |
| Journal repeat window | `js/state.js` (`floor(len/3)`) | Fine. The "21 to 30 repeat" comments in `story-home.js` go stale. |

### Content files and load order

- **Place text:**
  - `levelN-places1.js` holds the first 7 buildings and `-places2.js` the next 8.
  - Add `-places3.js` and so on rather than growing the files. Each one merges into `T.locations` by id.
  - Every new file needs a `<script>` tag in `index.html`. `validate-text.js` finds the new file itself and reports an error if the tag is missing.
- **`levelN.js` must load before its part files:** it assigns `ZSR.TEXT[n] = {...}` and would wipe anything loaded before it.
- **Landmark art:** split the same way (`landmarks1.js`, `landmarks2.js`). Add `landmarks3.js`
  and so on. These tests have hardcoded file lists that also need the new file:
  - `tests/validate-art.js` (`ART_FILES`)
  - `tests/validate-engine.js` (`WANT`)
  - `tests/validate-world.js`
  - `tests/validate-streets.js`
  - `tests/validate-text.js`
- **Fact files:** `js/layouts.js`, `js/world.js` and every `js/story*.js` the page loads are the facts.
  The validators take that list from `index.html` in page order, so a split fact file
  (`story-quests2.js`) is checked like the rest once it has a script tag.
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
- **Tutorial card ids are stored in each slot's settings** (`settings.tutorial`): append, never rename
  or remove (see "The tutorial" below).
- **Walker kind ids are permanent.** `save.met` (the day each kind was first met: the crew's told-once
  tips) keys on them, and so do a trip's building snapshots, the 3D and road looks, the themes and the
  mixes. Add a kind; never rename or remove one. An unknown id is a plain walker everywhere.
- **Room ids are permanent** for the yard too: `save.builds` (each room build's strength left; no key
  = whole, 0 = wrecked) keys on them. `upgradeSave` drops a key for a room with no plot or not built,
  and a value that is not a number from 0 to the build's strength.
- **Keep every `z` tile in a layout.** Walker rules name a building's `z` tiles by reading-order index
  (`NOTES[id].walkers`, `z: [1]`), so moving or removing one shifts what a rule points at (validate-world
  R4 checks each anchor still sits in its zone, by the landmark its note names).

## Add a place: the checklist

1. `js/world.js` `LOCATIONS`: id, x/y, type, danger, `template` (= id), items, cache, cacheName,
   stash, stashName, and `known` only if it is a starting place.
2. `js/world.js` `LOCKS[id]`. Panel coordinates refer to the layout grid.
3. `js/world.js` `KEYS`: insert into the ring. Two entries change, and so do both neighbours' key notes.
4. `js/world.js` `NOTES[id]`: the door note and the main note (`unlocks`, `reveals`). Add the new id
   to another note's `reveals` so it can be found. The door note's walker count is "at least" the
   day-1 `walkersPerLocation`.
5. `js/world.js` `ROADS`. A building needs at least 2 roads to get its own drive; with 1 road it
   sits at the road's end, like River Landing. At most 4 roads (see lanes above). Add `JUNCTIONS`
   for corners with no place.
6. `js/streets.js`: `STREET_NAMES["a|b"]` for each new road, keyed in `ROADS` order. Add
   `SIDE_STREETS` to keep at least 0.7 per road. `SURFACE` is optional.
7. `js/layouts.js` `LAYOUTS[id]`:
   - a grid with E, L, Q, n, y, the i/c/k counts, landmarks 1-4, `spots` 2-7 and `signs`
   - `z` walker anchors only where a walker rule names a spot (step 10), at least
     `walkerSpawn.minSteps` from the door, and `walkerZones` for every zone a rule names (every zone
     must be named by some rule)
   - the palette
   - new `LAYOUT_ART` keys, with their art in a `js/landmarksN.js` file
8. `js/story.js` `STORY[id]`:
   - trail1 and trail2 (trail2 `reveals` the place its key opens)
   - dead1 to dead4 (minLevel 1, 1, 4, 6)
   - one sign per layout sign, and the key
   - Redo the trail2 and key of the building whose key now points here.
9. Text at all six levels (`T.locations[id]`): blurb, door, every note at or below that level,
   signs, key. Reread neighbouring notes for street names and compass words.
10. Walkers. Every other walker starts at random, so only texts that say where walkers stand need a
    rule: give `NOTES[id].walkers` one for each door note, note or graffiti that puts walkers somewhere
    ("one by the robot", "two in the truck bay", "most near the back"), naming it in `says` (the fields
    are defined above `NOTES` in `js/world.js`). A text that puts a walker by a landmark ("one by the
    robot") gets `near` with the landmark's exact name: the rule's walkers then start within `ring` (3)
    steps of the landmark's footprint, doors shut, inside the zone, so the zone must hold floor within
    `ring` steps of that landmark; its z anchor must still stand within `walkerSpawn.near` (5) tiles of
    the landmark and in the zone (R4), and marks the rule's room. validate-world (R1-R8) checks: a
    position word (in, by, at, along, near, to the ...) needs a rule; "most" needs a `share` over 0.5; an
    `exact` "one by the X" needs a zone that covers the floor round X (`RULE_BY` 2); every rule has room
    for its count on every day up to `RULE_DAYS`. Give every rule's zone floor out of earshot of the door
    (at least `Interior.HEAR` + 0.5 tiles from the start in a straight line): validate-engine errs on a
    walker that starts within `HEAR`. Optional: a kind of its own in `WALKER_THEMES[id]` (validate-world
    then wants it the likeliest after the plain walker there on day 5).
11. A new `type` needs an entry in each of:
    - `js/map.js` `TYPE_LABEL` and roof colours
    - `js/sprites.js` `ROOF` and the lot art
12. An outdoor place (like River Landing) follows `RIVER` in `js/world.js`, `js/river.js` and the
    river special cases in `js/streets.js`, `js/map.js` and `js/state.js`. If there will be more
    than one, generalise those `type === "river"` checks into an `outdoor` handler first.
13. Check:
    - the gun danger bands
    - door-note walker counts against `walkersPerLocation`, and where the texts put walkers against
      the place's rules
    - the radio key-ring tips (`js/story-home.js`, checked by hand)
    - the counts in `README.md` and `docs/GAME_SPEC.md`
14. Decide the old-save migration (see above).
15. `npm test`.

## Walkers

The kinds are data (`WALKER_TYPES` in `js/world.js`, one row each); every mix, menu, look and test
reads `Object.keys(WALKER_TYPES)`, so nothing in the code says "six". The design is
`docs/GAME_SPEC.md` ("Walkers"), the decisions and the measured budget `DESIGN.md` ("Walkers v2").

### `SCALE:` spots for walkers

| Spot | Now | Where | What it limits |
|------|-----|-------|----------------|
| `WALKER_TYPES` | 6 kinds | `js/world.js` | Every list reads its keys; the first key stays `walker` (the fallback); ids are permanent |
| `ALARM.cap` | 40 | `js/world.js` | Walkers in a building while its alarm rings (a frame-time knob); at least the biggest `walkersPerLocation` + 6 |
| `DEFENSE.buildHp` | 0, 120, 180, 260 | `js/world.js` | A room build's strength by level; one entry per room level |
| `DEFENSE.breachRange` | 8 tiles | `js/world.js` | How far outside the fence a hole draws walkers from (walking distance); tuned for the 55 x 68 yard |
| `SETTINGS.walkerSpawn` | minSteps 6, gap 3, groupGap 1.5, ring 3, near 5 | `js/world.js` | Building spawn spacing, tuned for 30-42 wide interiors: `ring` steps round a rule's z anchor, or round the landmark's footprint for a `near` rule; `near` tiles at most from an anchor to its rule's landmark (validate-world R4) |
| `HEAR` (with `HEAR_SPRINT`) | 6 tiles (9 sprinting) | `js/interior.js`, on `Interior` | A sleeping walker this near you in a straight line wakes, through walls; a building's walkers start at least `HEAR` + 0.5 tiles from the door where there is room (`planWalkers`), and validate-engine errs on one within `HEAR`. Raising it needs every rule's zone to hold floor that far out |
| `FALLEN_MAX`, `BLOOD_MAX` | 24, 200 | `js/interior.js` | Downed walkers and blood drops at once (the oldest go) |
| `LIVE_MAX_PX`, `LIVE_STEP`, `LIVE_SPARE` | 320 px, 32 px, 8 | `js/interior.js` | The tallest live render; the step a live canvas grows and shrinks by; spare canvases kept |
| `LOD_PX` | 160, 64 px | `js/interior.js` | On-screen heights for full and mid detail (shorter: a silhouette) |
| `LIVE_NEAR`, `FAR_EVERY`, `LIVE_RENDERS_MAX` | 3, 2, 10 | `js/interior.js` | The redraw budget ("Walkers on screen" above) |
| `LIVE_LEVELS` | 8 governor rows | `js/interior.js` | Add a row below for bigger crowds, above for faster machines |
| `K_MIN`, `K_MAX` | 0.6, 1.6 | `js/walker3d.js` | Perspective inside one figure |
| `CC_N` | 16384 | `js/walker3d.js` | Colour strings kept; keep it a few times what a busy scene uses |
| `ENV_MAX` | 24 | `js/walker3d.js` | Fit-envelope points kept per kind |
| `ROAD_PARTICLE_CAP`, `ROAD_FALLEN_MAX` | 400, 24 | `js/game.js` | Road dust, sparks and blood; downed road walkers |
| `breachChanged` | one search out to `breachRange` round each hole | `js/yard.js` | Runs on every hole change (about 0.5 ms); its arrays (two Int32Arrays that swap, so nothing is made per change) are one entry per yard tile; it resets `pathT` only for the walkers the change touches (below) |
| `pickWreckTarget` | one yard search a pick | `js/yardwreck.js` | A wrecker picks once inside and again only when its target falls, never every frame |
| `WALKER_FILES` | `walker3d.js`, `walker3d-looks.js` | `tests/validate-art.js` | Add `walker3d-looks2.js` and on here |
| `WALKER_OPS` | 600, 350, 160 | `tests/validate-art.js` | Canvas calls one figure may make at lod 0 / 1 / 2 (563 / 304 / 116 today) |
| `WALKER_H_MAX` | 1.3 tiles | `tests/validate-art.js` | The tallest box (capped at 0.98 under a ceiling) |
| `WALKER_COLOURS` | 6000 | `tests/validate-art.js` | Colours 3,000 random draws may use (`CC_N` holds 16384) |
| `ROAD_OPS` | 360 | `tests/validate-art.js` | Canvas calls one road walker, standing or downed (253 today) |
| `SPAWN_TRIPS` | 6 | `tests/validate-engine.js` | Fresh visits per building on days 1 and 40 (about 5 ms each) |
| `RULE_DAYS` | 120 | `tests/validate-world.js` | Walker rules are checked for every count up to this day (the count stops growing by day 33 today) |

### Walker paths: the hooks and the re-path bursts

A path search that fails walks every tile it can reach, so at 2-3x the yard and the waves, who
searches and when matters more than how fast one search is.

- **`PathBlock(z, goal)`** (a mode hook, `js/interior.js`'s header) returns tile indices this walker's
  search treats as solid (the yard: every hole but the nearest one in range), `null` (nothing extra),
  or `true`: there is no way to that goal at all, so the core runs neither the path search nor the
  `Barrier` search and the walker claws `nearestFence`. The yard answers `true` for a walker outside
  the fence with no hole in range (or no holes) whose goal is inside the fence (never the practice
  walker). A new mode with a closed perimeter should answer `true` the same way rather than let its
  walkers flood-fill the outside every 0.4 s.
- **`breachChanged`** resets `pathT` only for a walker on the fence line, a walker outside whose nearest
  hole in range changed, a walker whose path steps on a hole that opened or closed, and every walker
  the first time its arrays are made. Everyone else keeps their own re-path clock, so a wave's
  searches stay spread over frames.
- **Still a burst:** a cabin door or window broken or forced (`js/house.js`), and a door opened or shut
  by you or the crew (`js/interior.js`, `js/crew.js`), reset every walker's `pathT`, so every walker
  searches in the same frame and their clocks stay in step after. Walkers outside the fence skip their
  search now, so it costs less; resetting only the walkers whose path crosses that door or window is
  the fix when bigger waves need it. Measurements: `DESIGN.md` ("Walkers v2", the yard).
- `nearestFence` keeps the parsed fence keys (`FENCE_KEYS`, one entry per fence tile ever seen).

### Add a walker kind: the checklist

1. `js/world.js` `WALKER_TYPES`: append one row (the first key stays `walker`): `name`, `hp`, `speed`,
   `r` (under 0.5: it must fit a one-tile doorway), `bite`, `reach`, `fenceDps`, `scrap` (whole),
   `knock`, `scream`; `mix: { building(danger, day), yard(day, heavy) }`; `road: { speed, r, dmg, scrap,
   reach, w: [base, perN], armor }` (`armor` only if shots should glance off its gear on that share of
   hits). validate-world wants it in some building by day 10 and on the road, and keeps a danger-1
   place on day 1 and a small wave on day 1 plain walkers only.
2. Where else it comes from, each optional: `RIVER.walkerMix` (`[weight, from day]`; missing: never at
   the river), `ALARM.mix` (missing: its building weight), `WALKER_THEMES` (a place of its own).
   validate-world wants every themed kind the likeliest after the plain walker at its place on day 5,
   so a new kind that weighs a lot at danger 3+ may need a theme's multiplier raised.
3. Its 3D look: `Walker3D.addType(id, def)` in `js/walker3d-looks.js`, or a new `js/walker3d-looks2.js`
   once that file is big (a `<script>` tag after `walker3d-looks.js` and before `interior.js`, and an
   entry in `WALKER_FILES` in `tests/validate-art.js`, `WANT` in `tests/validate-engine.js` and
   `ENGINE` in `tests/validate-crew.js`). It needs a box (height at most `WALKER_H_MAX`, width matching
   `r`), a gait (stride, `turnRate`, `clawRate`), a fall style (`crumple`, `tree`, `fold`, `kneel` or
   `tumble`), its lod 0 / 1 / 2 parts within `WALKER_OPS`, a look with gore off, and variants by seed if
   any. validate-art fails for a kind with no look; until then it draws as a walker.
4. Its road look: a `ZOMBIE_LOOK` row in `js/sprites.js`, one variant per 3D variant, with the same
   skin, shirt and hair colours as the 3D look (validate-art checks).
5. A crew tip, if it gets one (told once, after it is first met): a tip in `CREW_TIPS` (`js/story-crew.js`),
   its rule in `js/crewstate.js` (`metOnce` on `save.met`, and a place in `URGENT`), the contract lists
   (`CONTRACT_TIPS` and `TIP_VARS` in `tests/validate-world.js`, `TIP_VARS` in `tests/validate-crew.js`,
   `CREW_TIP_VARS` in `tests/validate-text.js`, the tips table in `docs/CREW.md`), and its words at six
   levels (merged into the crew member's tips with `Object.assign`, as `levelN-crew2.js` does).
6. Text: in-world the word is "walker". The kind's `name` shows only in god mode. A note that names a
   kind ("a big one") must match the place's mix or a rule's `type`.
7. A figure with more parts costs every frame it is drawn near: if `WALKER_OPS` must rise, re-run the
   A/B in `DESIGN.md` ("Walkers v2").
8. `npm test`. God mode's Spawn walker, the title screen, the alarm, the waves, the river and the road
   pick the new kind up from the table.

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
  yard and every quest building (`tests/validate-crew.js`, about 16 of npm test's 95 seconds); it
  grows with the number of quests.

## The tutorial

June's first-run tutorial (`js/tutorial.js`, `docs/GAME_SPEC.md`) is data-driven too: `YARD_STEPS` (the
yard's basics, in order) and `CARDS` (every card, what it pictures, the HUD button it rings, what the
arrow points at), with the words in `js/content/level1-tutorial.js` (level 1 only).

- **Card ids are stored in saves** (`settings.tutorial`, per slot). Append; never rename or remove one
  (an old save would show the renamed card again, or keep a dead id). Saves store ids, not places, so
  reordering `YARD_STEPS` changes only the card order (the walk card's words introduce June, so it
  stays first).
- **A new screen** (a new kind of place, a new menu that needs teaching): a `CARDS` entry, its words
  (`title`, `text`, its keys named as capitals), and one `Tutorial.enter("<id>")` or
  `Tutorial.first("<id>", next)` where the screen opens. `tests/validate-engine.js` fails if a
  non-yard card has no such call in `js/main.js` or `js/building.js`, and `tests/validate-text.js` if
  its words are missing. It shows once to every save, old ones included.
- **A new yard step stops every save at home until it is done,** veterans too, and the yard holds its
  waves until then. To teach veterans something new gently, add a screen card instead. A new step needs
  a completion the tutorial can see (polled in `tick`, or a `Tutorial.note(id)` from the event) and a
  "cannot be done" fallback so it is never a dead end (as `talk` and `computer` mark themselves when
  there is no crew or no computer); the liveness test in `tests/validate-engine.js` must still pass.
- **The words never go stale:** no digits, no place names, no crew names or crew count (the validator
  errors on digits and places), so a bigger city, more crew or more guns leave them true.
- `SCALE:` spots: `LIST_SHOWN` (the checklist's rows; today 6 rows for 6 entries, at the limit: a new
  yard step makes the list a window around the current row), the practice walker's spawn search cap (it
  stops a few steps out, so a bigger yard costs nothing), and the arrow's path search (one search over
  the yard twice a second, about 3,740 tiles today; past about 10,000 tiles, cap it at 60 steps).

## Refactors worth doing before the next big jump

These are ordered by payoff. None is needed until the matching limit is hit.

1. **A migration step for reveals** (replay `reveals` from the backpack and the Radio). Without it,
   every new place is invisible to existing players until they reread a note.
2. **Derive board size from the data** (or make it one shared constant used by the map, the CSS, the
   tests and the scenery).
3. **Move the pole off key 6** before adding a sixth gun.
4. **Sample the slow sweeps** (route pairs in the streets and drive tests; building spawn trips and
   wreck spots in the engine test): `npm test` is about 95 s today.
5. **Cull road scenery and the minimap** to the route's area once drive start-up or frame time
   shows it.
6. **Per-level lazy loading of text** once the content files pass a few MB.
