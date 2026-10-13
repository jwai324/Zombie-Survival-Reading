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

## Not in this drop

- Touch controls for first person (the map and road already work on touch).
- Per-player profiles and a parent view of words read.
- Music and ambient sound.
- Sentence-level highlighting for read-aloud (read-aloud itself was removed at the
  owner's request).
