# Zombie Survival: Game Spec (v2)

Decisions confirmed with the owner on 2026-10-12. This replaces the haven-and-quiz loop.

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
2. **Map.** A fixed, hand-drawn city of 15 locations plus the base. Only some are known
   at first; notes and the Radio room reveal the rest. Pick a known destination; the
   route is drawn; drive.
3. **Road.** The existing top-down drive, with length set by map distance and walker
   density set by the destination's danger and the day count. No pop-ups.
4. **Location.** A door note is shown first (added to the backpack). Then free-roam
   first person inside: WASD to move, mouse to look, click to fire, E to interact.
   Walkers inside come for you. Items sit on shelves and floors; a locked cache room
   holds the best items and only opens once you have read the note that explains how.
   Scrap piles give scrap. Press E at the entrance to leave. Shelf and floor items come
   back three days after they are taken; scrap piles are back every visit; cache items
   never come back.
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
- **Why read**: the door note says how many walkers and where the items are; the inside
  note says how to open the cache (reading it is what unlocks the door), what is in
  the cache, and which other location to try next (reading it reveals that location on
  the map).

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
correctly from any side. The cabin has log walls, boarded windows, a plank gable and a
shingled roof that rises to a ridge; the van is a low two-tile model with a cab, a sliding
door, a nose and a tail; the treeline is taller than the walls.

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
state (items taken, cache opened), backpack notes, packed kits, fence health per segment,
trap stock and set traps, typing progress, best score. Only written at the base.

## Content files

`js/world.js` holds the facts (item names included). `js/content/level1.js` to
`level6.js` hold the words: How it works, base room texts, door notes, inside notes. `npm test` checks
that every level has the same keys as the world and that lengths match the level.
