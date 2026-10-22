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
| Crew | 3 crew, 22 spots, 42 topics (30 base, 12 crossover) and 16 moods, 25 story quests (15 base, 10 crossover), 11 errands, 1 dog | `js/story-crew.js`, `js/story-quests.js` |
| Tutorial | 5 yard steps and the ready card, 6 screen cards (map, road, door, building, lock, river) | `js/tutorial.js` `YARD_STEPS`, `CARDS` |
| Danger | 1..5 | `LOCATIONS[].danger`, `js/map.js` pips |

## What breaks first

### Already at the limit

The current city sits close to three hard test limits:

| Limit | Now | Ceiling | Where |
|-------|-----|---------|-------|
| Longest drive | 137 s | 150 s | `tests/validate-streets.js` |
| Shortest lane window | 2.96 s (what `tests/validate-streets.js` prints) | 2.5 s | `GEOM.winMin` |
| Tightest turn arc | 108 px (99 before the corners were shaped for the angled camera, 2026-10-17) | 95 px | `MIN_ARC` |

Any new road, and any place pushed further out, will likely trip one of them. Decide on purpose
whether the ceiling moves (a longer drive is a design choice) or the geometry changes.

Corners are shaped so the angled camera turns through them comfortably (`Streets.cornerSpin`, 2026-10-17): an
uncomfortable corner's stop line moves back (up to `GEOM.backMax` 1100) and its arc widens, and the van brakes by the
turn's sharpness (`COMFORT.sharpTo` 135 deg: a sharper turn brakes as for 135, and further where its road is too
short, down to `minBrake` 0.3). `tests/validate-streets.js` checks every right-way turn again with every road 30%
shorter (the denser-city check): today's corners hold at 0.7 of their length; at 0.5 the Frog Lane corner goes 7% past
comfort even braked to 0.35. Corner shapes are memoised once per corner, way in and van speed (`cornerMemo`, a few
hundred entries today).

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
  - The river's course is one copy, `Streets.RIVER` in `js/streets.js` (quadratic curves in map units, half its
    width, its bank in px). The road (`Draw.riverBand`), the city map, the places' drives (a drive turns away from
    the river: `GEOM.riverClear`) and what grows or stands by the road (`Draw.inRiver`, `Draw.riverEdge` in
    `js/sprites.js`) all read it. More water on a bigger map: more curves there.
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
  - `buildScenery` in `js/game.js` looks at the city's roads, side streets, corners and lots once against the drive's
    track (every `SCENERY_STEP`) and lays props only along the stretch of each road within `SCENERY_REACH` of it (the
    camera's reach). On a city with 2 and 3 times the roads a drive's start costs the same (0.9 ms mean over the 272
    routes, against 2.0 / 6.9 / 18.2 ms when it walked every road; `tests/validate-scenery.js` "roadside").
  - The minimap draws every road each frame, with no culling.
  - `Draw.cityRoads` (js/sprites.js) filters every road for each ground square the angled view draws.
  - These two still grow with total city size. Cull them to the view when they start to show.
  - The angled view's plants do not: they are made a 512 square at a time as the view reaches it, and each square
    looks only at the roads filed in its bucket (`VEG_BUCKET`). On synthetic cities 1x, 2x and 3x as wide the same
    drive makes the same squares in the same time (`tests/validate-scenery.js`).
- **Note text is tied to routes:**
  - A note that names a street must name one on the shortest route to a place it reveals; `tests/validate-text.js` checks this.
  - A new road can change shortest routes and fail old notes at all six levels.
  - Compass words in notes ("east of here") are not checked at all. Reread neighbouring notes after moving a place.

### Tests scale as O(N²) or worse

`validate-streets` and `validate-drive` drive every ordered pair of places at two speeds.

- With 17 places they take about 5 s and 90 s (validate-streets checks the road's two van speeds, the river and the
  corners' comfort; validate-drive drives every route on the angled camera at both engines, draws the sign on every
  frame of every route at the slowest, and draws the road in its night, fog, sign, minimap and title screen checks;
  validate-drive's comfort section drives 63 routes that cover every turn, a set that grows with the corners, not the
  routes: `COMFORT_ALL=1` drives all of them). `tests/validate-scenery.js` takes about 55 s.
- validate-drive's "walkers blocked" drives a fixed sample of routes (one in 17) with walkers coming
  (`--all-walkers` drives every route, about 5.5 min); `tests/validate-balance.js` drives 7 balance cells at 6 seeds
  (about 10 s, `CELLS` and `SEEDS`, and its pop-in trips), and `npm run balance` the whole matrix (5,184 trips, about
  3 min on 4 cores: 3 routes a danger on 6 days, so it grows with the dangers and days, not the places).
- Doubling the places makes them about 4 to 16 times slower.
- When `npm test` gets slow, sample the pairs (all pairs touching changed places, plus a fixed
  random set) behind a flag, and keep the full sweep for CI.
- `npm test` takes about 4.5 min on a 4-core box: validate-drive about 90 s (the slowest), validate-scenery and
  validate-engine about 55 s each, validate-art about 30 s, validate-crew about 25 s, validate-balance about 10 s, the
  rest a few seconds each.
  `validate-engine` enters every building `SPAWN_TRIPS` (6) times on days 1 and 40, walks a walker from
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
- The crew, the dog and Rivet are live figures in the same pool (`prop.fig`, `js/interior.js` `figSprite`): they
  count against `LIVE_RENDERS_MAX`, `LIVE_NEAR` and `LIVE_LEVELS` with the walkers, and the governor counts frames
  with only the crew on screen. A crew member up close costs about 14 to 18% more render (a wide 3D picture); a much
  bigger crew wants the drawn area reported so the transparent part is not pasted.
- `FALLEN_MAX` (24) and `BLOOD_MAX` (200) in `js/interior.js`, `ROAD_FALLEN_MAX` (24) and
  `ROAD_PARTICLE_CAP` (400) in `js/game.js` cap the downed and the blood; past them the oldest go (the
  road skips a hit's blood instead).
- Walker3D's colour-string table (`CC_N`, 32768) holds every colour the six kinds use at every light
  and fog step (about 4,000 to 7,000). More kinds and variants need more; validate-art's
  `WALKER_COLOURS` (6000) fails first.

### The road camera (angled, every drive)

Every drive uses it (the flat, top-down road camera went on 2026-10-17: `DESIGN.md`, "every drive on the angled
camera"). Its limits all grow with how far the view sees (`Persp.cfg.far`, 3600 units) and with how many walkers a drive brings (`ROAD_DANGER`). Measured
headless on software WebGL (pessimistic; compare, do not read as a real PC's times), 1280 x 800, Engine Tune 0,
draw ms median / 95th percentile (2026-10-16): with the drive's own walkers a straight draws in 15.3 / 23.7 and the
junction turn in 13.1 / 21.6; with 10 walkers kept ahead of the van, 16.1 / 27.2 and 18.6 / 30.0 (the walkers
catch up with the braking van, so their pictures are bigger; the ground costs the same). A turn wants about twice
a straight's new ground squares. With 25 walkers on screen the walkers alone take about 6 ms a frame at dpr 1 and
11 ms at dpr 2, so on a software renderer their governor steps down a row. `ZSR.Persp.frameStats` (`ms`, `groundMs`, `worldMs`,
`walkersMs`, `squaresMade`) and `ZSR.Persp.walkerStats` show a frame's cost on a real machine.

Since 2026-10-17 the corners, each place's own building and the scenery are built for every route, and checked with
every route put on the angled camera in memory (`DESIGN.md`, "every drive on the angled camera"). On a CPU-drawn
canvas the scenery governor cuts a frame by about 30% (river to mall at night: 51.9 to 37.0 ms median); at its
richest row it costs what the scenery cost before. `frameStats` also carries `scenery` (the governor's row), `gapMs`
(the smoothed frame interval), `plants`, `props`, `vegSquares` and `vegMade`; `ZSR.PerspBuild.stats` a frame's
buildings and parts.

| Spot | Now | Where | What it limits |
|------|-----|-------|----------------|
| `SCENERY_REACH`, `SCENERY_STEP`, `SCENERY_CLEAR` | `cfg.far` + 600, 400, 600 units | `js/game.js` | A drive's roadside is laid along the roads within reach of its track (looked at every step); a prop keeps clear of what lies a little further out. A bigger `cfg.far` reaches further |
| `FOG` | near 60, far 760 units | `js/perspective.js` | In fog the view sees `far` (ground squares, plants, props and walkers drawn only that far: fog days draw less) and things fade into it from `near`; walkers still come from `cfg.far` |
| `NIGHT_BEAM` | reach 2050 units | `js/perspective.js` | The headlights' beam laid on the ground (about halfway from the old road's 520 to the haze); the dark is one screen-sized layer, drawn again only when what it shows moves |
| `EDGE_STEP`, `SIGN_GAP` | 120 units, 14 px | `js/game.js` | The road's edges are found on the screen this often along it (out to the haze) to keep the sign and the lane hint off it |
| `SIGN_ROOM`, `SIGN_NARROW_W`, `SIGN_GLIDE` | 160 px, 700 px, 0.8 window widths a second | `js/game.js` | Only a window under 700 px wide, or with under 160 px right of its middle, has the sign across the top; on any other the sign stands at the right, at least 160 px wide, gliding after the road's edge (never leaping) and over it for a moment in a bend. validate-drive draws it every frame of every route at 1280 x 800 |
| `PERSP` (`range`, `keepUp`) | 2600, 900 units | `js/game.js` | How far shots fly and how near a walker keeps up with the van (both tied to `cfg.far`) |
| `ROAD_DANGER`, `ROAD_LATE`, `ROAD_LATE_DAY` | 6 rows (danger 0 to 5); day 10 | `js/game.js` | The road's walkers by danger: how often (`spawns`, 1.4 x `DIFF`'s later on), in how big groups, how far ahead and how near the road, how hard they keep up beside the van; each row's `early` numbers on day 1, its own from `ROAD_LATE_DAY`. A danger past the last row takes the last: a new danger 6 needs a row, and `npm run balance` has no target for it (the flat target is frozen at dangers 0 to 5, days 1, 3, 5, 7, 10 and 20) |
| `ROAD_OPEN`, `VERGE` | 0.5 of `cfg.far`; 40 to 140 units past the shoulder | `js/perspective.js` | A walker from down the road that would come nearer than this steps out of the verge's thicket instead (and onto the road: `Game.stepOut`), so none fades in on the open road in plain view; validate-balance holds the share that does to 5% |
| `Upgrades` `ram` | 4, then 28 + 12 a level | `js/upgrades.js` | The Ram Plow's damage to a walker that touches the van: matched to the old road's worth on the angled one (DESIGN.md "Walkers and balance"); a sixth level or tougher walkers change how many touches it takes |
| `DIFF.minInterval` | 0.6 s | `js/game.js` | The shortest average gap between walkers, after night and the row's `spawns` (0.77 s at danger 5 on day 20 today, so it does not bind yet) |
| `GROUP_SPREAD` | 160 units | `js/game.js` | A group's walkers come within this of its first |
| `ROAD_WALKERS_MAX` | 40 | `js/game.js` | The most walkers on the road at once (a group may pass it by a few): no new one comes until some go; today's drives peak about 18 with a player shooting, 33 with nobody shooting |
| `KEEP` (`fade`, `band`, `bandMin`, `shove`, `shoveMin`) | 400 units, 0.8 s, 60 units, 0.8, 60 units/s | `js/game.js` | The keep-up carry by where a walker is (none ahead of the nose, over 0.8 s of the van's drive to beside it) and the shove off the nose; tied to the van's size and speed |
| `SPAWN_TRIES`, `SPAWN_CLEAR` | 6 spots, 30 units | `js/game.js` | A new walker's spot is checked against every building part on the drive (`solidLots`: 37 today) and the river, and its line to the van against them; the most spots tried a spawn |
| `BLOCK_PASSES`, `WALK_ROUND`, `WALK_MEMORY`, `WALK_STUCK` | 3; 0.4, 2, 1 s | `js/game.js` | Walkers are put out of building parts (each lot's circle checked first, so a bigger city costs a walker one check a lot) and the river every step, then walk along the wall; more parts that touch may need more passes |
| `ROAD_STEP`, `MAX_FRAME_DT`, `STEP_SLACK` | 1/60 s, 0.1 s, 2% | `js/game.js` | The road runs `stepsIn(dt, ROAD_STEP)` steps a frame (1 at 60 fps, 6 at 10; a step may run 2% long, so a browser's 16.6 to 16.8 ms frames run one, as the balance run's do), each over every walker and shot; below 10 fps a frame still counts only 0.1 s (slow motion) |
| `PERSP` corners (`brake`, `brakeIn`, `brakeOut`, `look`, `nose`) | 0.75, 150, 300, 300, 50 units | `js/game.js` | `brake`, `brakeIn`, `look`, `lookRamp`, `camW` and `camPace` are mirrored in `Streets.CAM`, which shapes every corner for them: change both together (validate-drive checks they match) |
| `GEOM.backMax`, `COMFORT` (`sharpTo`, `minBrake`, `spin`) | 1100 units; 135 deg, 0.3, 43 deg/s | `js/streets.js` | How far a stop line moves back for comfort, where braking by sharpness bottoms out (just past today's sharpest turn, 133), the comfort target the corners are shaped for |
| `Persp.minAspect`, `Persp.maxFov` | 1.25, 90 deg | `js/perspective.js` | A window narrower than 1.25 to 1 sees as wide as a 1.25 window; the tallest view (portrait phones) |
| `planBrake` | one 4-unit walk of a turn path a turn | `js/game.js` | Runs once when a turn is committed to; grows with a turn path's length |
| `DRIVE_STEP` | 1/240 s | `js/game.js` | The drive's steps a frame (4 at 60 fps) |
| `cfg.far` | 3600 units | `js/perspective.js` | How far the view sees: ground squares, plants, props and walkers a frame, where walkers come from |
| `NEAR_PX`, `FADE_IN` | 6 px a unit, 0.5 s | `js/perspective.js` | Nothing nearer the camera is drawn; a new walker's fade-in at the edge of the view |
| `VEG_CELL`, `VEG_IDLE` | 512 units; 240 frames | `js/perspective.js` | A square of plants is made the first time the view reaches it and let go once unused this long (a longer drive has more squares, not more plants a frame) |
| `VEG_STEP`, `VEG_BUCKET`, `keyOf` | 120 units; 2048 units; 32768 each way | `js/perspective-art.js` | The plants' spot grid (one seeded spot a cell: density), the roads' buckets a square looks in, how far from the origin a square's key reaches (about 16.7M units at 512) |
| `PROP_CELL`, `LOD_AT`, `LOD_BAND` | 512 units; 0.35; 300 units | `js/perspective.js` | Props filed by square (world and ground squares); far props fade to a simpler look from 35% into the haze band over 300 units |
| `SCENERY_BUDGET_MS`, `SCENERY_LEVELS` | 25 ms (40 fps); 5 rows | `js/perspective.js` | The scenery governor's one budget (the real frame interval) and its rows, richest first; it never sets the walkers' rows. While the page's own draw is under `SCENERY_OWN` (45%) of the interval its rows down are a trial, undone if even the thinnest did not speed the frames up (a browser capped at 30 fps) |
| `RES_LEVELS`, `RES_SLOW_MS`, `RES_FAST_MS` | 100 / 80 / 65 / 50%; 36 ms; 20 ms | `js/perspective.js` | The resolution governor: the road's canvas and the card's ground drawn at a share of their device px, a row down after 2 s over 36 ms (over a 30 fps cap's 33.3), up after 10 s under 20 ms; kept on this computer (`localStorage` `zsr-road-res`, not in god mode) |
| `ROAD_DPR_MAX` | 1.5 | `js/game.js` | The road canvas and the minimap are drawn at no more device px a CSS px than this (only 175% and 200% screen scaling go past it); the road canvas is then drawn at the resolution governor's share of that (`RES_LEVELS`) |
| `TILE`, `LIVE_BUDGET_MS` | 62.5, 4 ms | `js/perspective.js` | See "Walkers" below |
| `BUDGET` | 7 ms | `js/perspective-gl.js` | Ground squares drawn a frame, by what each size has been costing |
| `TILE_SLOW_MS` | 40 ms | `js/perspective-gl.js` | Past this real frame interval (smoothed), a frame draws at most 2 x 40 / interval squares (at least 1, and a hole near the van): a square's upload costs the card more than `BUDGET` sees |
| `KEEP`, `KEEP_VIEWS`, `SPARE` | 360 squares (a floor); 1.9; 48 | `js/perspective-gl.js` | Squares kept on the card: `keepFor` keeps 1.9 times the most a view of this window needs, never under 360 (365 at 1280 x 800, 415 at 1920 x 1080, 529 at 2560 x 1080; peak memory 228, about 270 and about 340 MB). A view needs about 190 to 250 on a 16:9 or 16:10 window, about 320 at 21:9 and more than 360 at 32:9, plus a few dozen drawn ahead; a view that needs more than `KEEP` keeps its own squares and `SPARE` more (memory grows with it: about 300 MB at 5120 x 1300). Do not lower `KEEP` under about 300: a maximized 1080p window would draw squares again every frame. A bigger `cfg.far` needs more |
| `AHEAD_SECS`, `FRESH` | 0.35, 0.7, 1.1 s; 30 frames | `js/perspective-gl.js` | The views ahead whose squares are drawn in the frame's one work list (after the holes and the near squares; `AHEAD_BUDGET` is gone), never pushing off one used this recently; their squares on the card are kept every frame |
| `PREP_BUDGET`, `PREP_HOLES`; `PREP_SECS` | 24 ms, 60 ms; 1 s | `js/perspective-gl.js`; `js/game.js` | Squares drawn a frame while the van waits at its door for its first view, and the most it waits |
| `LANDMARK_SEEN` | 2.4 x `cfg.far` | `js/perspective-buildings.js` | How far past the haze a landmark (the Water Tower) is drawn as a silhouette |
| `DETAIL_PX`, `PROP_PX`, `FINE_PX` | 70, 170, 50 px | `js/perspective-buildings.js` | How wide a building must be on the screen before its windows and signs, then its props, are drawn; the props and fine details fade in over 50 px more |
| `PROP_CLEAR`, `FOOT` | 10 units; wreck 108 x 54, barrier 72 x 20 | `js/perspective-art.js` | Trees and bushes keep off the drive's wrecks and barriers (their footprints as drawn in js/perspective.js): a new standing prop kind needs its footprint here |
| `NEAR` | 420 units | `js/perspective-buildings.js` | Things within this of a building's parts are sorted against them part by part (more and bigger buildings: more to sort) |
| `TOWER_TOP` | 352 units | `js/perspective-buildings.js` | The Water Tower's antenna tip: the camera sees nothing higher than itself (about 340 units on a small window, 357 at 1280 x 800), so nothing should stand taller |
| `PerspBuild.ROWS` | 17 rows | `js/perspective-buildings.js` | One building per place id; a later file adds rows (see the add-a-place checklist) |

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
  - `tests/validate-crew.js` (`ENGINE`)
  - `tests/validate-drive.js` (its script list at the top)
  - `tests/validate-scenery.js` (its script list at the top)
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
  tips) keys on them, and so do a trip's building snapshots, the 3D looks, the themes and the
  mixes. Add a kind; never rename or remove one. An unknown id is a plain walker everywhere.
- **Room ids are permanent** for the yard too: `save.builds` (each room build's strength left; no key
  = whole, 0 = wrecked) keys on them. `upgradeSave` drops a key for a room with no plot or not built,
  and a value that is not a number from 0 to the build's strength.
- **Paint looks are append-only.** `upgrades.paint` is the index of the `PAINT_LOOKS` look a save
  wears and `upgrades.paintOwned` the indexes it bought (an older save at paint k is filled to own 0
  to k). Reordering or removing a look repaints old vans and changes what they own; add a look at the
  end (see "Still 3D models" below).
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
12. Its building on the angled road: a row for the new id in `js/perspective-buildings.js` `ROWS`, or in an
    appended `js/perspective-buildings2.js` (`Object.assign(ZSR.PerspBuild.ROWS, { ... })` with the pieces in
    `ZSR.PerspBuild.kit`, loaded after `js/perspective-buildings.js` in `index.html` and in the script lists of
    `tests/validate-drive.js` and `tests/validate-scenery.js`). `build(b, L)` lays out its parts in the lot's own
    frame: the front wall at `L.F`, everything inside the lot, nothing low where the van parks, its name on a
    `sign(..., { name: true })` under about Z 170, nothing taller than `TOWER_TOP` (only a landmark should come
    near it). Optional: `ground` (`surface`, `stripes`, `extra`) and `landmark`. validate-drive fails for a place
    without a row, then drives to it on the angled camera and checks it parked. A new landmark picture it reuses goes
    in a `js/landmarksN.js` file, which also joins those script lists. The place's drive points down the widest gap
    between its roads and turns away from the river by itself (`Streets.RIVER`, `GEOM.riverClear`); validate-streets
    fails if a drive or lot lies in the water, or if a turn at its corner cannot be made comfortable. The building's
    parts standing on the ground and at least 30 tall block walkers (`PerspBuild.solids`); give a part
    `solid: false` if walkers should pass under or through it (an awning). validate-drive "walkers blocked" puts a
    walker in every part and checks it comes out.
13. Its walkers on the road come by its `danger` (`ROAD_DANGER` row in `js/game.js`). A new place at an existing
    danger needs nothing more; if the drives to it are much longer or shorter than that danger's others, run
    `npm run balance -- --by route` and look at its routes. A new danger needs its own row (a danger past the last
    row takes the last).
14. An outdoor place (like River Landing) follows `RIVER` in `js/world.js`, `js/river.js` and the
    river special cases in `js/streets.js`, `js/map.js` and `js/state.js`. If there will be more
    than one, generalise those `type === "river"` checks into an `outdoor` handler first.
15. Check:
    - the gun danger bands
    - door-note walker counts against `walkersPerLocation`, and where the texts put walkers against
      the place's rules
    - the radio key-ring tips (`js/story-home.js`, checked by hand)
    - the counts in `README.md` and `docs/GAME_SPEC.md`
16. Decide the old-save migration (see above).
17. `npm test` (and `npm run balance` if the place changes how dangerous drives are).

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
| `CC_N` | 32768 | `js/walker3d.js` | Colour strings kept; keep it a few times what a busy scene uses |
| `ENV_MAX` | 24 | `js/walker3d.js` | Fit-envelope points kept per kind |
| `buildEnv` | one envelope walking and one running (`envRun`, half the samples) a kind | `js/walker3d.js` | Runs once per kind as the page loads (about 10 ms a kind on a desktop); a kind's running gait is `RUN_GAIT` blended in by `st.run` |
| `ROAD_PARTICLE_CAP`, `ROAD_FALLEN_MAX` | 400, 24 | `js/game.js` | Road dust, sparks and blood; downed road walkers (on the angled drive each downed walker also keeps a pooled picture) |
| `TILE` | 62.5 road units | `js/perspective.js` | A Walker3D tile on the angled drive (on-foot size against the van, whose roof is `VAN_Z` 50); hit circles stay the road's `r` |
| `LIVE_BUDGET_MS` | 4 ms | `js/perspective.js` | The angled drive's walker renders and pictures a frame (smoothed) before its walker governor steps a row down the interiors' `LIVE_LEVELS` |
| `breachChanged` | one search out to `breachRange` round each hole | `js/yard.js` | Runs on every hole change (about 0.5 ms); its arrays (two Int32Arrays that swap, so nothing is made per change) are one entry per yard tile; it resets `pathT` only for the walkers the change touches (below) |
| `pickWreckTarget` | one yard search a pick | `js/yardwreck.js` | A wrecker picks once inside and again only when its target falls, never every frame |
| `WALKER_FILES` | `walker3d.js`, `walker3d-looks.js`, `walker3d-crew.js` | `tests/validate-art.js` | Add `walker3d-looks2.js` / `walker3d-crew2.js` and on here |
| the script lists | the angled drive's draw files, page order | `tests/validate-drive.js` and `tests/validate-scenery.js` (top) | Add `walker3d-looks2.js` and on there too, after `walker3d-looks.js` (and a new `landmarksN.js` or `perspective-buildingsN.js` in page order) |
| `WALKER_OPS` | 600, 350, 160 | `tests/validate-art.js` | Canvas calls one figure may make at lod 0 / 1 / 2 (563 / 304 / 116 today) |
| `WALKER_H_MAX` | 1.3 tiles | `tests/validate-art.js` | The tallest box (capped at 0.98 under a ceiling) |
| `WALKER_COLOURS` | 6000 | `tests/validate-art.js` | Colours 3,000 random draws may use (`CC_N` holds 32768) |
| `ROAD_OPS` | 60 | `tests/validate-art.js` | Canvas calls one of the road's flying bits (a drop, a splat, dust, a spark) may make |
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
   entry in `WALKER_FILES` in `tests/validate-art.js`, `WANT` in `tests/validate-engine.js`,
   `ENGINE` in `tests/validate-crew.js` and the script list at the top of `tests/validate-drive.js`, after
   `js/walker3d-looks.js`: without it the angled drive's draw test draws the new kind as a plain walker). It needs a box (height at most `WALKER_H_MAX`, width matching
   `r`; on the angled drive it runs toward `RUN_GAIT` as it keeps up with the van, and validate-art's section R
   holds that at full size too), a gait (stride, `turnRate`, `clawRate`), a fall style (`crumple`, `tree`, `fold`, `kneel` or
   `tumble`), its lod 0 / 1 / 2 parts within `WALKER_OPS`, a look with gore off, and variants by seed if
   any. validate-art fails for a kind with no look; until then it draws as a walker.
   On the road it is the same figure, seen from the road camera's height (the old top-down road looks,
   `ZOMBIE_LOOK`, went with the flat camera on 2026-10-17: there is no second look to make).
4. A crew tip, if it gets one (told once, after it is first met): a tip in `CREW_TIPS` (`js/story-crew.js`),
   its rule in `js/crewstate.js` (`metOnce` on `save.met`, and a place in `URGENT`), the contract lists
   (`CONTRACT_TIPS` and `TIP_VARS` in `tests/validate-world.js`, `TIP_VARS` in `tests/validate-crew.js`,
   `CREW_TIP_VARS` in `tests/validate-text.js`, the tips table in `docs/CREW.md`), and its words at six
   levels (merged into the crew member's tips with `Object.assign`, as `levelN-crew2.js` does).
5. Text: in-world the word is "walker". The kind's `name` shows only in god mode. A note that names a
   kind ("a big one") must match the place's mix or a rule's `type`.
6. A figure with more parts costs every frame it is drawn near: if `WALKER_OPS` must rise, re-run the
   A/B in `DESIGN.md` ("Walkers v2").
7. `npm test`. God mode's Spawn walker, the title screen, the alarm, the waves, the river and the road
   pick the new kind up from the table.

## People and animals in 3D (the crew, the dogs, the farm's animals)

- `js/walker3d.js` `CC_N` 32768: colour strings walkers and people share (people about double them).
- People: `Walker3D.addHuman` looks in `js/walker3d-crew.js`; a new crew member is an appended `walker3d-crew2.js`
  (and `tests/validate-art.js` `WALKER_FILES`). `CREW_OPS` [700, 400, 200] and `CREW_COLOURS` 6000 there hold the
  canvas calls and colours. A look's envelope samples about 400 poses at page load (about 27 ms a look).
- `WALKER_FIXTURE` in `tests/validate-art.js` is the walkers' recorded draw-call hash: re-record it
  (`--record-walkers`) only when walker art changes on purpose.
- Animals: `js/beast3d.js` (`CC_N` 16384, `ENV_MAX` 24, `BLOB_MAX` 12 ellipsoids a fur body joins, `POSE_ENV_STEPS`:
  how finely a quick loop like the wingbeat is sampled for the fit); looks in `js/beast3d-looks.js` (the dog, Rivet) and
  `js/beast3d-looks2.js` (the goat, the hen), appended `beast3d-looks3.js` ... next; new poses are appended to `POSES`
  (old indices never move). `tests/validate-art.js` `BEAST_FILES`, `BEAST_OPS` [450, 320, 170] (the goat uses 393 at
  detail 0), `BEAST_H_MAX` 0.7 (the goat's box is 0.66), `BEAST_COLOURS` 5000 with `BEAST_RANDOM_DRAWS` 1200 a kind, and
  a hash fixture of the dog's and Rivet's draws (re-record only when their art changes on purpose).
- Yard models: `js/yardmodels.js` `YARD_OPS` [500, 260, 120] canvas calls a model may make at each detail (a model may set
  its own: the two water tanks do); a new prop's model goes in an appended `yardmodels3.js`, registered by its sprite's
  art name, with every opts set it is placed with in `def.opts` (validate-art draws them all, whole, cracked and wrecked).
- The farm's hens and goats are live figures in the walkers' pool (`js/yard.js` `ANIMALS`: speed, rest, what they do at
  rest; `b.flock` puts them up): a new farm animal is a row there, a Beast3D look in an appended `beast3d-looks3.js` and
  its sprite art for the fallback. A full farm adds five figures to the pool (three hens, two goats): they count against
  `LIVE_RENDERS_MAX`, `LIVE_NEAR` and `LIVE_LEVELS` like the crew, each redrawn at most every `ANIMAL_EVERY` (4) frames
  (`fig.every`; looking over the pens is the yard's one view at the owner's 25% bar, so a bigger farm may want it
  higher). Beast3D reports the box it drew in and only that is pasted; Walker3D does not yet (the crew and walkers paste
  their whole pictures). The engine tests that load Beast3D list
  `beast3d-looks2.js` too (validate-engine `WANT`, validate-crew `ENGINE`, validate-drive, validate-scenery).

## Still 3D models (the van, the yard's props, signs, plaques and porch)

`js/model3d.js` draws models of convex parts; `js/van3d.js` is the van on it; `js/modelsprite.js`
stands models in the first-person view (`this.models`, one instance each: kind, position, turn,
scale, footprint, tiles, `mesh()`, and an optional `core`: the model-unit box a moved eye maps the old
picture through; a model with parts sticking out past its body, like the van's plow wings and mirrors,
passes one).

A prop with a turn (`rot`) whose art `js/yardmodels.js` has is drawn as that model (`Interior.modelProps`, run at the
end of `dressYard`; a model that will not build leaves its prop the sprite, said once). A new yard prop: its sprite art
name, a model in an appended `js/yardmodels3.js` with `def.opts` listing every opts set it is placed with (the lot
sign's board widths at Large and Huge are listed there), and the placer gives it its turn (`plotFrame.prop` does: the
plot's front plus `o.turn`). A full yard stands about 38 prop models, 11 to 17 in view; a model out of the view costs
one circle test, and `modelHides` / `modelCovers` ask only the strips over a column (40 to 100 strips a frame standing,
up to about 470 walking close past builds).

### `SCALE:` spots for models

- `js/model3d.js` `MAX_V` 64 (corners a face or a decal may have), `MESH_KEEP` 128 (built models
  kept: every look x gear x dents of the van is one, and every yard model's look and damage), `COLOURS_MAX` 8192 (colour
  strings kept).
- `js/modelsprite.js` `MODEL_KEEP_PX` (256 x 256: a picture this small is kept while its model is out of view) and
  `MODEL_POOL_PX` (6M px, 24 MB: every model picture together; past it the longest unused go). A yard two or three
  times bigger (100 or more prop models) keeps its far props' small pictures within it.
- `js/yard.js` `LOT_SIGN_FOOT` 3: a lot sign's solid width in its front row (a narrower lot gets one).
- `js/modelsprite.js`:
  - `MODEL_MARGIN` 0.16 rad drawn past each side of the view (small turns need no redraw);
  - `MODEL_STRIP` 8 columns a strip spans at most;
  - `MODEL_DRIFT_PX` 12, `MODEL_ANGLE_MIN` 2 and `MODEL_ANGLE_MAX` 10 degrees: the step round a
    model that redraws it (the owner's "about 10 degrees", finer for a big picture);
  - `MODEL_LOD_PX` [80, 32] px: on-screen heights for detail 0 and 1;
  - `MODEL_STEP` 64 px canvas growth, `MODEL_SPARE` 2 spare canvases;
  - `MODEL_RENDERS_MAX` 2 redraws a frame and `MODEL_MAX_PX` 640 on the governor's starting row;
    `MODEL_LEVELS` has one row per `LIVE_LEVELS` row (validate-engine checks the counts match). Many
    models in view (the yard's props) mean more redraws waiting: watch the walk-round redraw count
    and the `modelStats` probe before raising the cap;
  - `MODEL_RUNS` 8 opaque runs kept per picture column and `MODEL_OPAQUE` 200 (the alpha that hides
    what is behind; the contact shadow's does not): the picture's outline, read back once per redrawn
    picture and only when a walker stands behind it, for its health bar and to skip drawing a walker
    the model hides. A model with more parts stacked in one column may want more runs.
- `tests/validate-art.js` `VAN_OPS` [1450, 700, 350]: the most canvas calls the van may make at
  detail 0 / 1 / 2 from any view with all its gear (the road draws it every frame; Convoy Red from above
  is at 1447, 6 of them the gun's middle barrel's root). A new decal or gear piece must fit, or go to
  detail 0 only. `VAN_DECAL_AREA` (the smallest decal area on the roof and the back doors) and
  validate-engine's `ROAD_DECAL` 1.5% (the share of the van a look's decal must cover from the road
  camera, bare and under full armor) and `ROAD_DECAL_TOP` 1% (with every upgrade at its top: Olive Drab
  is least at 1.1%) hold every look readable from behind. The upgrade tests read every bound from
  `Upgrades.DEFS[k].max`, so a new level that draws nothing new fails.

### Add a paint look

1. Append a row to `PAINT_LOOKS` in `js/upgrades.js` (name, body, roof, trim, bumper, rims, decal,
   decalA, decalB, cost, tier). `DEFS.paint` reads its `max` and `costs` from the rows.
2. A new decal kind: its designs in `js/van3d.js` `DECALS` (both sides, the hood, the roof, the
   back and the front, its front part over the bumper since the grille and lamps leave little paint; validate-art reads the kinds from `Van3D.DECAL_KINDS`), a branch in `js/sprites.js` `decal()`
   (the map icon), a branch in `js/base.js` `paintChip` (the Garage swatch; without one it shows a plain
   band), words in `js/base.js` `DECAL_WORDS`, and the kind in `tests/validate-world.js` `DECALS`.
   The look's name is appended to `tests/validate-world.js` `SAVED_LOOKS` (looks are pinned to their
   index: any price is allowed, but never insert or reorder).
3. The paint card is a row of pictures: past about ten looks it wants a second row or a scroll.

## The crossover universes

`docs/UNIVERSES.md`. A third universe is facts and words, not engine work: a `js/story-<u>.js` that adds
`WORLD.UNIVERSES[<u>]` (and its topics and quests with `universe: "<u>"`), six `js/content/levelN-<u>.js`, and a
button in Settings (`#universe-seg`, js/main.js `UNIVERSE_NOTE`). Limits:

- **Saves store indexes**: `entry.x` keeps a universe's ledger line and broadcast by index, and `save.xover[u]`
  counts them. Append to `journal` and `radio`; never insert or reorder.
- **Quest spots**: each universe's quests count toward a building's two quest spots (`QUESTS_PER_PLACE`) with the
  base ones. Two universes together use 10 of the 15 buildings that had room; a third needs spots that still fit,
  or the cap raised per universe.
- **One robot dog**: `WORLD.ROBO` and `save.xover.robo` are one companion, for the universe with `robotQuest`.

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
  rechecking them (`npm test` does). Every post has a `face` and every sit post a `seat` (appended fields): moving a
  chair, the porch bench or a bed means moving its seat, and `CREW_SEATS` (`js/story-crew.js`, one height per kind of
  seat) must match the furniture (validate-world and validate-crew hold every seat to what stands under it). A new kind
  of seat is an entry in `CREW_SEATS` and in `SEAT_ART` (`tests/validate-crew.js`).
- `SCALE:` spots: `CREW_RULES.stars` (one entry per star), `requestsPerCrew` (one errand slot in the
  save), the `crew.read` list, the dog's trail lengths (`js/crew.js`, `js/building.js`), the walker
  look-ahead for Pip's tip (`js/crewstate.js`), `QUESTS_PER_PLACE`, and the How it works paragraph
  bound (`tests/validate-text.js`).
- `npm test` drives a full play-through of every story quest on the real facts and the crew in the
  yard and every quest building (`tests/validate-crew.js`, about 25 s of npm test's 4.5 minutes); it
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
   wreck spots in the engine test; validate-drive's every-route sweep, the slowest): `npm test` is about 4.5 min
   today, about 3 times what it was before every drive went on the angled camera (86 s at 36403cd).
5. **Cull the minimap's roads and `Draw.cityRoads`' road list** to the view once frame time shows it
   (the road's scenery is already laid only where a drive can see: `SCENERY_REACH`).
6. **Per-level lazy loading of text** once the content files pass a few MB.
