# Zombie Survival: Design Decisions

The agreed design is in `docs/GAME_SPEC.md`. This file records the questions that were
put to the owner, the answers, and the judgment calls made while building. Anything
marked **Assumption** can be changed cheaply.

## Owner decisions (2026-10-12)

| Question | Answer |
|----------|--------|
| Title | Zombie Survival. The word "Reading" is out of the title; reading stays as the core mechanic. |
| Audience | Teens. Grounded survival comic. No gore, no on-page deaths, no profanity. |
| Reading levels | 1st to 6th grade, switchable any time. Every in-world text (notes, door notes, base room texts, How it works) exists at all six levels. Facts never change, only the words. |
| Questions | None anywhere. Reading is useful, never quizzed. |
| Structure | Map hub with top-down driving between stops. One fixed city that unlocks as you go. |
| Buildings | Free-roam first person, desktop keyboard and mouse. Door note, then walkers, then search. Notes go into a backpack that shows where each was found. |
| Home base | Cabin defense: calm phases to build, waves of none, some, or many walkers to fight. Base upgrades give run-wide benefits. |
| Saves | Only at the base. Death reloads the last base save. |
| Text size | Huge means one inch, everywhere. |
| Delivery | Everything in one drop. |

## Owner decisions (2026-10-13)

| Question | Answer |
|----------|--------|
| What should upgrades change? | The world you see. Every room level, van upgrade and gun upgrade is visible; Walls level 1 shows new walls. |
| How do rooms show in the yard? | A bigger yard with a plot per room: a staked lot with a sign until built, then a distinct, bigger, solid build at each level. Walls is the fence and the cabin armor. |
| Buildings | Unique per place, about 2 to 3 times the old area, real mazes, better art. |
| A map inside? | M shows only what you have explored. Each main corner has something unique and memorable to steer by. |
| Notes | Rewritten at all six levels to point at the landmarks. |
| Turn cues on the road | Read the street signs; a minimap tracks the van and the destination but never draws the route. |
| Wrong turn or missed lot | A card says what went wrong, then the drive restarts from where it set out. Damage, scrap and kills from the failed attempt stay. |
| Where are the decisions? | Real map junctions plus side streets (dead ends, no through roads, closed roads), the lots of places passed, and the destination's lot. |

## Judgment calls

- **Why a raycaster and not a 3D engine.** Free-roam first person was required; a grid
  raycaster with billboard sprites gives it with zero dependencies, runs from a file,
  and keeps the comic look (flat fills, ink edges, halftone) consistent with the road.
  The fence in the yard is drawn as a half-height wall the player can shoot over.
- **Why caches need the note.** A locked cache room that opens only after the inside note
  has been read is what makes reading load-bearing without a quiz. The note also reveals
  the next place on the map. Both are facts in `js/world.js`, so every level carries them.
- **Why shelf items restock after three days and caches never do.** Without restock the
  city would run dry before the base could be finished; with cache restock there would be
  no reason to explore. **Assumption:** three days.
- **Why one food per trip.** A light pressure to keep moving and a reason to build the
  Garden. No food means a weaker van for that trip, never death.
- **Why the fence is patched between waves.** A stay at the base should feel like a rhythm
  (quiet, build, hold the line), not a slow death spiral. The Walls room decides how long
  the fence holds during a wave.
- **Why the build menu pauses the yard and is locked during a wave.** "Time to build and
  time to defend" is clearer as two states than as a menu you can hide in.
- **Why the save merges the trip only at home.** A trip is a bet. Items, notes, revealed
  places, and scrap only count once you are back behind the fence.

- **Why the van keeps to its own two lanes.** Lanes are the mechanic now: the van slides
  only across its own side of the road, not the whole road. Damage taken on a drive measured
  the same as before. **Assumption:** the owner may want the old free slide back between
  junctions.
- **Why the usual lane goes straight.** A player who does nothing never turns off; every
  turn is a choice the sign asked for. Right turns use the right lane; left turns use a turn
  lane that opens on the far left, so "the left lane" never means two things.
- **Why the city map keeps the route line and adds "The way there".** The player plans on
  the map (more reading), then drives from memory, signs and the minimap. At Huge text the
  map board is hidden, so the words are the only route view there. **Assumption:** this can
  be turned off if the owner wants drives to rest on the road signs alone.
- **Why the minimap turns with the van.** Left on the minimap is a left turn. A small N marks
  north.
- **Why door notes no longer say where the cache room is.** The longer, landmark-based facts
  had to fit level 1 (about 38 words for a door note). The inside note gives the way from the
  note to the cache door instead.
- **Why landmark names are plain words.** One name serves all six levels and the map:
  "spotted dog", not "dalmatian"; "rescue van", not "ambulance".
- **Why directions avoid "left of" and "right of" inside notes.** A reader leaving a room is
  facing the entrance, so "right of the office" sends them the wrong way. Notes steer by
  landmarks, signs and "toward the back" instead. Door notes keep left and right as seen
  walking in.
- **Why heavy waves come from every side.** The fence is twice as long (112 segments); waves
  from all sides spread walkers along it instead of jamming them at one hole.
- **Why footprint landmarks are measured in tiles of floor.** The first-person view is about
  1.4 times taller than wide; measuring a footprint in floor tiles keeps a fire truck on its
  tiles instead of reaching into the walls.

## Not in this drop

- Touch controls for first person (the map and road already work on touch).
- Text that is painted onto signs, walls and landmarks in the world does not grow with Huge
  text; the names a player must read are also in the notes, on the building map and on the
  road signs, which do.
- Per-player profiles and a parent view of words read.
- Music and ambient sound.
- Sentence-level highlighting for read-aloud (read-aloud itself was removed at the
  owner's request).
