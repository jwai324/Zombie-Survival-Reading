# Zombie Survival: Game Spec (v3)

Decisions confirmed with the owner on 2026-10-12 (v2: map, cabin defense, first-person
buildings) and 2026-10-13 (v3: the world shows every upgrade, unique buildings with
landmarks and a map, driving by lanes and signs).

## Pitch

Months after the Fall, you run the last working van out of a boarded-up house at the
south end of town. You drive to the gas station, the grocery, the hardware store, the
precinct, the hospital, and bring back what the base needs. Inside every building there
are walkers, and there are notes. The notes are written by people who were there before
you: where the fuel is, which door is locked and how to open it, which street is still
clear. Read them and you find more and lose less. Reading is never quizzed. It is just
useful.

## The loop

1. **Home base: cabin defense.** You are in the yard, first person, with the cabin
   behind you, the van in the driveway, and a fence around the lot. Time runs in
   phases: **calm** (no walkers; go inside to build, or leave in the van), then a
   **wave** that is sometimes nothing, sometimes a few walkers, sometimes a lot.
   Walkers claw through the fence; the Walls room makes it stronger. Inside the cabin
   the build menu pauses the yard: upgrade rooms with items plus scrap, upgrade the
   van and gun in the garage, re-read notes in the backpack. The base is the only
   place the game saves: on arrival, after every build action, and after every wave.
2. **Map.** A fixed, hand-drawn city of 15 locations plus the base, with named streets and
   side streets. Only some are known at first; notes and the Radio room reveal the rest.
   Pick a known destination; the route is drawn and listed in words ("The way there").
3. **Road.** Top-down driving in world space, the camera turned so the van always heads up.
   Length is set by map distance, walker density by the destination's danger and the day
   count. The road never shows the route: the player navigates by lanes and signs (see
   Driving below).
4. **Location.** A door note is shown first (added to the backpack). Then free-roam
   first person inside a building with its own floor plan: WASD to move, mouse to look,
   click to fire, E to interact, M for the map of what you have seen. Four landmarks, one
   per corner, are what the notes steer by. Walkers inside come for you. Items sit on
   shelves and floors; a locked cache room holds the best items and only opens once you
   have read the note that explains how. Scrap piles give scrap. Press E at the entrance
   to leave. Shelf and floor items come back three days after they are taken; scrap piles
   are back every visit; cache items never come back.
5. **Map again.** Chain more locations or head home. Cargo rides in the van.
6. **Back at base.** Cargo moves to base inventory, one food is eaten, the Garden adds
   food, the day counter goes up, and the game saves.

**Death** (van wrecked on the road, player down inside a building, or overrun in the
yard) reloads the last base save. Everything since that save is lost. That is the
tension.

**Endless.** There is no win. Score is days survived plus base level.

## Reading

- Every note, sign, door note, room description, and the How it works text exists at
  six reading levels (1st to 6th grade). The level is a setting and can be changed
  anytime; it changes words, never facts.
- No questions anywhere.
- **Backpack**: every note read is kept with its title, the location, and where in the
  building it was found. Opens from the base, the map, and inside a building (pauses).
- **Why read**: the door note says how many walkers and where the items are, by landmark;
  the inside note says how to open the cache (reading it is what unlocks the door), what is
  in the cache, the way from the note to the cache door, and often which other location to
  try next (reading it reveals that location on the map). On the road, the street signs
  say where each lane goes, and the city map lists the way there in words.
- Landmark names are plain words, the same at every level and on the building map.

## Home base rooms (3 levels each; recipes in `js/world.js`)

| Room | What it does |
|------|--------------|
| Walls | Stronger fence in cabin defense, more van health, more on-foot health; level 2 unlocks spike traps, level 3 blast traps |
| Garage | Unlocks higher van and gun upgrade tiers; free repair at base |
| Power | Map shows danger; supply crates on drives; headlights beat night and fog |
| Water | On-foot health regen; start buildings at full health |
| Garden | Food per day (each trip eats one food; no food means a weaker van) |
| Radio | Reveals locations; later shows which still hold items |
| Medbay | Less on-foot damage; one revive per trip; less van damage |
| Archive | Notes show what is left at a place; map shows caches and stock |
| Well (late) | Needs Water 1. Clean water: faster regen, full health on entry at level 3. The Farm and the Lab need it |
| Farm (late) | Needs Garden 2 + Well. Crop field, chicken coop, goat pen: 2 / 4 / 6 food a day on top of the Garden |
| Lab (late) | Needs Medbay + Well. Makes medical kits: one every 2 days, then 1 a day, then 2 a day |

A level can carry `requires: { room: level }`; the build button says which room to build first.
Food and medicine from different rooms add up; every other effect takes the best level.

## The yard shows the base

Every room except Walls has its own plot in the yard (41 x 33 tiles, 112 fence segments).
Level 0 is a staked lot with the room's name on a big sign; levels 1 to 3 are distinct,
bigger builds made of walls, roofs, see-over low tiles and props, with a name plaque and
stars. They go up the moment the room is built. Builds are solid: walkers path around them
and they are cover. Walls levels 0 to 3 change the fence (pickets, braced planks,
corrugated metal with spikes, concrete blocks with razor wire, each with a cracked look) and
the cabin's armor (boards, more boards, metal shutters, steel plates). The van in the
driveway shows armor plates, the ram plow, engine gear (rack, exhaust, snorkel, light bar)
and the paint; the gun shows Heavier Rounds (barrel, muzzle brake, compensator), Rate of
Fire (vented jacket, fins, drum; copper at the top tier) and Spread Shot (one barrel per
round). A light wave comes from two sides, a heavy one from every side.

## The fence, traps and kits

- **The fence never patches itself.** Every hole a wave claws open stays until the player
  pays for it: 1 scrap per hole, either by standing at the gap and pressing E or with the
  "Fix all" button in the cabin menu. A cracked segment (under half strength) can be braced
  the same way. Building Walls up rebuilds the whole fence. Fence state is part of the save.
- **Traps** are crafted at the workbench (Walls 2 for spike traps, Walls 3 for blast traps)
  and set in the yard with T (spike) and R (blast) on the ground in front of you, or just
  past the fence line. A spike trap hurts the walker that steps on it (45, three uses); a
  blast trap hurts every walker close to it (120, one use). Set traps are saved.
- **Medical kits** live in the backpack (up to 3, packed from storage at the cabin). Using a
  kit heals to full. Inside a building a kit from the van's cargo can be used too.
- **Van repair** is instant and restores full health: 1 scrap for every 3 health missing
  (at least 5), free once the Garage room is built.

## Driving: lanes, signs, side streets

- The van drives in the left of its two lanes; past side streets and parking lots that lane
  goes straight. A turn to the right uses the right lane; a turn to the left uses a turn lane
  that opens on the far left. At a junction there is one lane per road out, left to right in
  the order the roads turn, each with a painted arrow, and the sign says where each lane goes.
  There is no straight-on lane there: the right lane takes the road furthest right, extra
  lanes open to the left, and the van's own left lane takes whatever road it points at (with
  two roads out, the left one).
- Decision points along a route, in order: the junction of the place the drive sets out from
  (the van starts on that place's own short drive, with one lane per road out; a place with one
  road starts on it), then side streets (dead ends, no through roads, closed roads), the
  parking lots of places the route passes (Home Base too), real junctions, and the
  destination's lot. Signs name a place only when the player knows it; otherwise the street.
- At Huge text the road's top row keeps to one line (van health and pause, plus scrap from
  1000 px wide), and signs shrink to fit under it.
- The lane the van is in when it crosses the white stop line decides. A wrong lane drives a
  little way down the wrong road, then a card says what went wrong ("Wrong way! That road goes
  to ...", "You drove past ...") and the drive restarts from where it set out. Damage, scrap,
  kills and miles stay.
- The minimap (top left, under the HUD's top row) turns with the van, shows known roads, side
  streets and places, and flags the destination. It never draws the route.

## Buildings: floor plans, landmarks, the map

- Each of the 15 places has its own floor plan in `js/layouts.js` (30 x 22 up to 42 x 32
  tiles): rooms, halls, dead ends, at least one loop, interior doors, wall decor and signs.
  That is 3.7 to 6.5 times the old walkable floor; the owner asked for about 2 to 3 times,
  so the bigger size is still to be confirmed (see `DESIGN.md`).
- Four landmarks per building, one per corner, each unique in its building (the ice machine,
  the fire truck, the giant teddy bear). Big ones cover a footprint of tiles.
- M (or the Map button) pauses and shows the tiles seen so far: walls, shelves, counters,
  doors open or closed, the cache door (locked until opened), the exit, landmarks by name and
  notes found. Walkers and items are not shown. What you explore is kept for the trip and
  saved once you are home; death loses this trip's exploring.

## Doors, re-entry, and the map

- Every doorway inside a building is a real door, closed until opened. E opens and closes
  it; a door cannot close on the player or a walker. Walkers cannot open doors. An unlocked
  cache door becomes a normal door.
- Leaving a building stores its state for the rest of the trip (walkers, scrap piles,
  doors). Going back in on the same trip finds it exactly as left. Driving home clears it.
- From the map, the place you are parked at offers "Go in" / "Go back in" (the door note is
  shown only the first time).

## The workbench (typing)

Room builds, van and gun upgrades, and trap crafting open the workbench: a garage scene
with a typing round in front. The first time, a lesson shows traditional home-row finger
placement. Stages progress one per finished round: single home-row keys, home-row runs,
the top row, the bottom row, short words, longer words, phrases, sentences, then faster
sentences. Each round has a timer; running out offers a retry with new targets. Nothing is
spent until the round is finished. Repairs need no typing. Word, phrase and sentence pools
come from the reading-level text files.

## Saves

Up to four labeled saves (one per player), picked on the title screen; a name is asked for
when a slot is created. An older single save migrates into slot 1. The base is still the
only place the game saves.

## Rendering notes

Wall texture columns are sampled left to right as seen from each face, so signs read
correctly from any side. Counters, tables, beds, crop beds and the fence are low see-over
tiles with a lit top face, drawn in depth order with sprites. Roofs (the cabin's gable,
the yard sheds) come from a list of roofed blocks. Floors and ceilings are cast at reduced
resolution with a texture per tile kind; buildings have a wall style and a light level.
Landmarks and yard props are sprites; a footprint landmark is spread over its tiles of
floor (the view is 2 tan(FOV / 2) times taller than wide). Art registers through
`ZSR.Draw3` (`registerTexture`, `registerSprite`, `registerFloor`).

## First person (desktop)

Raycast renderer on canvas, no engine, no dependencies. Grid interiors from
`js/world.js` templates, comic shading (flat colors, ink edges, halftone). Mouse look
via pointer lock, with arrow keys as a fallback for turning. Walkers are billboard
sprites in the same style as the road; they path to the player. Hits are tested in
screen space against the crosshair. Touch-only devices are not supported yet: the
title screen says so and does not start a game.

## Text size

Normal, Large (1.3x), Huge (1 inch). Huge applies to everything: reading text, buttons,
menus, HUD. Layouts collapse to one column.

## Save format

`zs.slots` is the slot index (active slot, labels); `zs.save.<n>` holds one base save: day,
scrap, food, inventory, room levels, van and gun upgrades, known locations, per-location
state (items taken, cache opened, explored tiles as a packed bitset), backpack notes, packed
kits, fence health per segment, trap stock and set traps, the yard grid version (`yardV`:
an older yard's fence is rebuilt whole and its set traps return to stock), typing progress,
best score. Only written at the base.

## Content files

`js/world.js` holds the facts (item names included); `js/layouts.js` holds the floor plans
and landmarks the facts point at; `js/streets.js` holds street names and side streets.
`js/content/level1.js` to `level6.js` hold the words: How it works, controls, base room
texts, door notes, inside notes, road signs and cards. `npm test` checks that every level
has the same keys as the world, that lengths match the level, that notes name their
building's landmarks, that every route drives correctly, and that every piece of art exists.
