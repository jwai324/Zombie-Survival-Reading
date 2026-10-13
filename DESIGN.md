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
| What should upgrades change? | The world you see. Every room level, van upgrade, van-gun upgrade and gun mod is visible; Walls level 1 shows new walls. |
| How do rooms show in the yard? | A bigger yard with a plot per room: a staked lot with a sign until built, then a distinct, bigger, solid build at each level. Walls is the fence and the cabin armor. |
| Buildings | Unique per place, about 2 to 3 times the old area, real mazes, better art. (Built bigger; see the judgment calls.) |
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
- **Scarier walkers without gore (2026-10-13).** Walkers got gaunt, mottled skin, sunken
  sockets with milky glowing eyes, a slack jaw with bad teeth, ragged grimy clothes and bony
  clawed hands. There is still no blood and no wounds: fear comes from the face, the reach
  and the silhouette, which keeps to the owner's no-gore rule for a teen audience.
- **Why the pistol is a projected 3D model.** A flat drawing could not look like a real
  handgun from the shooter's eye. A small modelled pistol (slide, frame, raked grip, sights)
  drawn in perspective gets proportions, foreshortening and recoil right with no image
  assets and no dependencies.

## Guns (2026-10-13)

The owner asked for guns found at random in different places, each modded with scrap for
better damage, range and so on, each with its own look: a machine gun, a heavy machine gun,
a bow and arrow, and double pistols.

- **Random per save, fixed within it.** Each gun's building is rolled when the save is made
  (within a danger band, so the heavy machine gun is only in the worst places) and its floor
  tile comes from a seed. Re-rolling on every visit would make the map unreadable; fixing it
  per save keeps "where did I see it" meaningful and still differs between players.
- **A trip item, like everything else.** Picking one up puts it in your hands at once (the
  fun part), but it only becomes yours at home. Death taking it back keeps the trip a bet.
- **No ammo.** Not asked for, and it would add a resource to balance and a screen to manage.
  The guns are balanced by range, spread, noise, walking speed and pierce instead: the heavy
  machine gun is strongest but slow and wakes the block; the bow is silent and long but slow.
- **The van's gun is its own thing.** The old "gun" upgrades drove both the van turret and
  the pistol. With five guns on foot each having mods, that double counted, so the Garage
  upgrades now apply to the road only. **Migration:** an older save's pistol gets Damage and
  Fire rate mods equal to its old gun upgrades (capped at 3), so nobody loses power.
- **Mods go through the workbench** like every other build, for consistency with the spec.
  **Assumption:** three tiers per mod; prices in `js/weapons.js` can move cheaply.
- **Every gun is a projected 3D model**, like the pistol: the double pistols are the pistol
  model twice (the left one mirrored, firing in turn), the long guns are posed close and to
  the right so their sides show, and the bow bends and its string comes back as you draw.
- **Every mod tier shows on the gun in your hands (merging the guns with the visible base).**
  The owner's rule that every upgrade changes what you see covers gun mods too: each tier of
  each mod adds a part in the same modelled style (compensators and brakes, longer barrels,
  sights and scopes, slide cuts, magazines, lasers and lights; on the bow broadheads, limbs, a
  quiver and sight pins), and the Weapons tab shows the gun as you hold it. The Garage's gun
  upgrades used to be drawn on the first-person pistol; now they show on the van's roof gun on
  the road and in the Garage preview, which gained a look for every Rate of Fire tier.
- **Why the gun at rest is a cached picture.** A modelled gun costs more to draw than the rest
  of the HUD. At rest it is drawn once per look and screen size, cropped, and moved with the
  walk bob; a shot, the bow's draw or a switch draws the model live. One picture is kept, so
  resizes and mod changes never pile up canvases.
- **Where a gun lies in the bigger buildings.** Still seeded per save and building, on open
  floor you can walk to with every door open, at least 10 steps in (5, then 2, in a cramped
  plan), never in the cache room and never on or beside a landmark, an item, a note or a scrap
  pile. Shots from it obey the same cover as the pistol: walls and tall solid props stop them,
  counters and the fence do not. The M map does not show it; you find it by looking.

- **Why the van keeps to its own two lanes.** Lanes are the mechanic now: the van slides
  only across its own side of the road, not the whole road. Damage taken on a drive measured
  the same as before. **Assumption:** the owner may want the old free slide back between
  junctions.
- **Why the usual lane goes straight past side streets and lots.** A player who does nothing
  never turns into a dead end or a parking lot; each of those turns is a choice the sign
  asked for. Right turns there use the right lane; left turns use a turn lane that opens on
  the far left, so at those signs "the left lane" never means two things. A real junction is
  different: the road splits into one lane per road out, left to right by the angle of the
  turn (the right lane takes the road furthest right, extra lanes open to the left), so
  there is no straight-on lane to fall back on. Left alone, the van stays in its own left
  lane, which there is the second lane from the right: with two roads out it takes the left
  one, even a sharp left. The sign is how the player picks.
- **Why the city map keeps the route line and adds "The way there".** The player plans on
  the map (more reading), then drives from memory, signs and the minimap. At Huge text the
  map board is hidden, so the words are the only route view there. **Assumption:** this can
  be turned off if the owner wants drives to rest on the road signs alone.
- **Why the minimap turns with the van.** Left on the minimap is a left turn. A small N marks
  north.
- **Why door notes no longer say where the cache room is.** The longer, landmark-based facts
  had to fit level 1 (about 38 words for a door note). The inside note gives the way from the
  note to the cache door instead.
- **Why the buildings are bigger than "about 2 to 3 times".** The floor plans were drawn
  to the sizes set for the build, 30 x 22 tiles for a small store up to 42 x 32 for the
  hospital and the mall. Next to the old rooms that is 3 to 5.6 times the footprint and 3.7
  (the pharmacy) to 6.5 (the hospital) times the floor you can walk on, so trips inside run
  longer than the owner's answer suggests. **Assumption:** the owner is fine with the bigger
  size. Trimming a place means redrawing its plan in `js/layouts.js` and checking its notes
  at all six levels, since they point at its landmarks and rooms.
- **Why landmark names are plain words.** One name serves all six levels and the map:
  "spotted dog", not "dalmatian"; "rescue van", not "ambulance".
- **Why directions avoid "left of" and "right of" inside notes.** A reader leaving a room is
  facing the entrance, so "right of the office" sends them the wrong way. Notes steer by
  landmarks, signs and "toward the back" instead. Door notes keep left and right as seen
  walking in.
- **Why some landmarks stand in a corner of the main hall.** Where a building's true corner
  is a back room or the locked cache room, its landmark stands in the nearest corner of the
  main hall, where it can be seen (the fish tank, the toothbrush, the wheelchairs, the TV wall,
  the robot, the engine crane, the fire truck, the blue pump). Every landmark is still in its
  own quarter of the building. **Assumption:** these can move into the true corners, at the
  cost of rewriting those notes at all six levels.
- **Why heavy waves come from every side.** The fence is twice as long (112 segments); waves
  from all sides spread walkers along it instead of jamming them at one hole.
- **Why footprint landmarks are measured in tiles of floor.** The first-person view is about
  1.4 times taller than wide; measuring a footprint in floor tiles keeps a fire truck on its
  tiles instead of reaching into the walls.

## Reading expansion (2026-10-13)

The owner asked for at least four times the reading at every level, through more notes and
more hunting, notes that carry keys and clues for other places, and descriptions of the yard's
places. Answers to the questions put to the owner: longer notes plus new ones plus dead ends
scaled by grade; stashes opened by a physical key found elsewhere; clue-chain notes and wall
signs for hunting; a pop-up on approach for the yard lots that says why a room is locked;
keys tracked in the backpack and at the base; radio transcripts, a daily journal, item tags and
character arcs all in; one drop.

- **Why a stash, not a change to the caches.** The caches and their notes were proven; a second
  locked room per building adds the cross-town hunt without touching what works.
- **Why the key appears only after the clue is read.** A key lying in the open would reward
  wandering, not reading. The clue note is what makes it visible, as reading the main note is
  what opens the cache.
- **Why a ring of keys.** Every key points onward, so the hunt never dead-ends and every place
  matters twice: for its own stash and for the next one.
- **Why dead ends scale with grade.** Level 1 readers get one extra note to sort; level 6
  readers get four, including decoys. Judging which note matters is the reading skill.
  **Assumption:** the counts (1, 2, 2, 3, 3, 4) can move cheaply via `minLevel` in `js/story.js`.
- **Why signs and lot signs need no key press.** They are short and should read like the world
  around you; a panel on approach keeps the player moving and needs no new control.
- **Why the journal never assumes a build.** The journal is written once per level for every
  player; the game writes the recap line around it from the real day.
- **Assumption:** after day 30, the last ten journal entries and broadcasts repeat.

## Merging the bigger buildings with the reading expansion (2026-10-13)

The two drops of 2026-10-13 rebuilt the same things twice: one gave every place its own
bigger floor plan with landmarks, the other added notes, signs and a stash to the old shared
plans and wrote their words at six levels. The owner chose to keep both. The new floor plans
won; the reading expansion was moved into them.

- **Where each stash went.** Into a side room each plan already had, given a lock (the gas
  station's men's room, the precinct's evidence room, the hospital's supply room, the
  station's locker room), or a small room walled off a corner where none fit (the hardware's
  paint vault, the mall's jewelry vault inside the gadget store). Nothing a door note or a
  main note pointed at was walled in. Room signs moved with them ("SAFE ROOM", "STAFF LOCKER").
- **Why `Q` for the stash door.** The new legend already uses `K` for tables and `W` for
  windows, so the stash door is `Q`; stash spots stay `k` and the key `y`. Note spots 2 to 7 and
  the four wall signs are listed beside each grid (`spots`, `signs`: a wall tile and the face
  it is painted on) instead of being letters in it, because the digits 1 to 4 are landmarks.
- **Where keys and notes went.** Each key lies beside one of its building's landmarks, so the
  note that points to it can name one. The trail notes and dead ends stand in rooms the plan
  names or by its signs. Every "where it is" in `js/story.js` was rewritten to match, at all
  six levels, under the bigger buildings' rule: steer by landmarks, rooms and signs, never
  "left of" inside.
- **Some room signs became readable signs.** Where a plan had a second plain sign beside a
  locked door ("STAFF ONLY", "NO ENTRY", "KEEP CLEAR"), the readable sign about that door took
  its place.
- **Counts follow the bigger buildings.** Ruby's graffiti now counts the walkers the door notes
  promise there (three to nine), not the old counts.
- **Yard lots became plot signs.** The bigger yard already gives every room a plot with a sign
  and a plaque; walking up to one opens the same panel the old lots had, for all ten plots.
- **No street names in the story notes.** The new road names streets, and a note may only
  name one on the way to a place it reveals; "the river road" and "the hill road" in the story
  became "along the river" and "the road up the hill".

## Not in this drop

- Touch controls for first person (the map and road already work on touch).
- Text that is painted onto signs, walls and landmarks in the world does not grow with Huge
  text; the names a player must read are also in the notes, on the building map and on the
  road signs, which do.
- Per-player profiles and a parent view of words read.
- Music and ambient sound.
- Sentence-level highlighting for read-aloud (read-aloud itself was removed at the
  owner's request).
