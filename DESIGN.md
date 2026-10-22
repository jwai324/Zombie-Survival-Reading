# Zombie Survival: Design Decisions

The agreed design is in `docs/GAME_SPEC.md`. This file records the questions that were
put to the owner, the answers, and the judgment calls made while building. Anything
marked **Assumption** can be changed cheaply.

## Owner decisions (2026-10-12)

| Question | Answer |
|----------|--------|
| Title | Zombie Survival. The word "Reading" is out of the title; reading stays as the core mechanic. |
| Audience | Teens. Grounded survival comic. No gore, no on-page deaths, no profanity. (Narrowed 2026-10-15: walker art may show blood and ribs behind `SETTINGS.walkerGore`; the reading text keeps this rule. See "Walkers v2".) |
| Reading levels | 1st to 6th grade, switchable any time. Every in-world text (notes, door notes, base room texts, How it works) exists at all six levels. Facts never change, only the words. |
| Questions | None anywhere. Reading is useful, never quizzed. |
| Structure | Map hub with top-down driving between stops. One fixed city that unlocks as you go. |
| Buildings | Free-roam first person, desktop keyboard and mouse. Door note, then walkers, then search. Notes go into a backpack that shows where each was found. |
| Home base | Cabin defense: calm phases to build, waves of none, some, or many walkers to fight. Base upgrades give run-wide benefits. |
| Saves | Only at the base. Death reloads the last base save. |
| Text size | Huge means one inch, everywhere. |
| Delivery | Everything in one drop. |

## Owner decisions: the walk-in cabin (2026-10-13, later)

| Question | Answer |
|----------|--------|
| What is the cabin? | A family house you walk into, laid out from the owner's floor plan (porch, foyer, office, dining room, kitchen with four cabinet runs, pantry, ping pong room, living room, master bedroom and bath, three bedrooms, a second bath, closets, rear play room), furnished by room. It is still called "the cabin": the Hollis family named it that. |
| Inside and outside | True scale and seamless: the yard grew south and the house is part of the yard scene (no loading); seen from outside it is a house with siding, shutters, a porch and a hip roof. |
| Where do you build? | At the computer in the office: E opens the same build menu the cabin door used to. |
| What else does E do inside? | Pantry: food and storage. Radio shelf (dining room since 2026-10-14): today's news, then past days. Typewriter: typing practice. Big bed: full health for a minute of the calm. |
| Reading inside | Notes from the previous owners (the Hollis family) on the walls of every room, at all six levels. |
| Defense | The clock keeps running inside. Walkers walk through an open door, break a shut one slowly, and smash windows to climb in. Some walkers raid the cabin even when you are outside and wait inside for you. Doors and windows get a separate House upgrade track. |
| Pace | Calm between waves is four times longer. The dinner bell calls the next wave now; gunfire shortens the calm. |

## Owner decisions (2026-10-13)

| Question | Answer |
|----------|--------|
| What should upgrades change? | The world you see. Every room level, van upgrade, van-gun upgrade and gun mod is visible; Walls level 1 shows new walls. |
| How do rooms show in the yard? | A bigger yard with a plot per room: a staked lot with a sign until built, then a distinct, bigger, solid build at each level. Walls is the fence (the cabin's doors and windows have their own House levels since the walk-in cabin). |
| Buildings | Unique per place, about 2 to 3 times the old area, real mazes, better art. (Built bigger; see the judgment calls.) |
| A map inside? | M shows only what you have explored. Each main corner has something unique and memorable to steer by. |
| Notes | Rewritten at all six levels to point at the landmarks. |
| Turn cues on the road | Read the street signs; a minimap tracks the van and the destination but never draws the route. |
| Wrong turn | A panel says what went wrong and offers three ways on: try the drive again from where it set out, open the town map, or go back to the place the van set out from (from the cabin, that backs out of the trip: no day passes). Damage, scrap and kills from the failed attempt stay on a retry. |
| Where are the decisions? | Real map junctions plus side streets (dead ends, no through roads, closed roads). Every place sits at the end of its own drive off its corner, so a place passed is one more lane at its corner (its drive), and the last turn is the destination's drive (none for a place at the end of its one road). |

## Judgment calls

- **Why a raycaster and not a 3D engine.** Free-roam first person was required; a grid
  raycaster with billboard sprites gives it with zero dependencies, runs from a file,
  and keeps the comic look (flat fills, ink edges, halftone) consistent with the road.
  The fence in the yard is drawn as a half-height wall the player can shoot over.
  **Walkers changed 2026-10-15:** each is a live 3D model drawn into its own pooled canvas, which then
  goes up as a sprite like any other (see "Walkers v2").
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
  **Superseded 2026-10-15** by the owner's gore decision: walkers are now live 3D models with
  blood smears, ribs through torn shirts, a spray on a hit and a pool when downed, all behind
  `SETTINGS.walkerGore`; the reading text still has no gore (see "Walkers v2").
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
- **Why the usual lane goes straight past side streets.** A player who does nothing never turns
  into a dead end; each of those turns is a choice the sign asked for. Right turns there use the
  right lane; left turns use a turn lane that opens on the far left, so at those signs "the left
  lane" never means two things. A real junction is
  different: the road splits into one lane per road out, left to right by the angle of the
  turn (the right lane takes the road furthest right, extra lanes open to the left), so
  there is no straight-on lane to fall back on. Left alone, the van stays in its own left
  lane, which there is the second lane from the right: with two roads out it takes the left
  one, even a sharp left. The sign is how the player picks.
- **Why the city map keeps the route line and adds "The way there".** The player plans on
  the map (more reading), then drives from memory, signs and the minimap. At Huge text the
  map board is hidden, so the words are the only route view there. **Assumption:** this can
  be turned off if the owner wants drives to rest on the road signs alone.
- **Why the map shows each turn's lanes, heading up.** The map is north up; the road is heading
  up. Each turn gets a numbered badge on the board and, in the list (and beside the badge
  when zoomed in), the lanes exactly as that junction's sign will draw them, ours lit. They are
  read off `Streets.buildDrive`, the drive the road builds, so the two cannot disagree. The
  route line runs from the first place's icon down its drive and ends up the destination's drive at its icon.
- **Why place names sit on paper tags beside their icon.** Each name takes the spot around its
  icon that covers the fewest roads, icons, badges and other names, splitting to two lines
  when that fits better; the tag keeps it readable where it must touch a road. On a small
  board the names shrink to fit the whole city; zooming in brings them back to full size.
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
- **Why heavy waves come from every side.** The fence is long (210 segments round today's 55 x 68
  yard); waves from all sides spread walkers along it instead of jamming them at one hole. Since
  2026-10-15 a hole draws only the walkers within `DEFENSE.breachRange` of it (see "Walkers v2").
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
- **Why wall signs need no key press, and yard lot signs do.** A wall sign is short and should read
  like the world around you. A lot sign's panel is long (what it is, what it needs, why it is
  locked) and the yard is where you walk and fight between plots, so it opens with E and closes
  with E or by walking off; it never covers the view uninvited.
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

## Typing goes slowly, the barrels point at the crosshair, a bigger yard

- **Why the typing stages need good rounds.** One stage per finished round moved a player off the
  home row after two builds. Now there are 28 stages: the home row a pair of keys at a time (F J,
  D K, S L, A ;), all eight, runs, home-row words, G and H, a home-row check, then the top and
  bottom rows a pair at a time, and words, phrases and sentences last. Each stage needs 3 or 4
  good rounds (90% accuracy or better). A sloppy round still builds (the game is never blocked);
  it just does not count. The cabin's Typing practice button gives free rounds that count, so a
  player is never short of practice for want of scrap. Old saves past the first stage restart at
  the eight-key home row stage. **Assumption:** 90% and 3 to 4 rounds are tunable in
  `js/typing.js` (PASS, each stage's need).
- **Why a countdown.** Five seconds before every round to put the fingers home; keys pressed
  during it are never mistakes, and the round's clock waits for it.
- **Why the guns point straight ahead.** The shot goes to the crosshair. A bore parallel to the
  view vanishes at the screen's centre, so it points at the crosshair wherever the gun sits; the
  old inward yaw pointed every barrel well left of it. The cabin's Weapons tab keeps the turned
  view so the mods still show. The road gun's barrels fan out along their bullets' lines.
- **Why the yard grew.** 45 x 33 tiles inside the fence (was 31 x 23), the same plots in the same
  places relative to each other, more open grass between them; the yard's haze thinned to match.

## Owner decisions: Frog Lane, River Landing and fishing (2026-10-14)

| Question | Answer |
|----------|--------|
| How does catching work? | Cast, wait for a bite, click within about 2 seconds to hook it. A miss lets it go and the line stays in. |
| How much food? | 1 food a fish, 4 a trip; then the river rests 3 days, like the shelves. |
| A gun with the line out? | The pole is propped on the bank and the line stays in. A bite rings its bell and holds until you take the pole back (E). |
| How is the river found? | By reading: the pole's tag says where the crew fished, and reading it reveals River Landing. |
| Where does Frog Lane leave? | Where its old "Road closed" sign was, halfway along River Road: a real corner with lanes, not a move to another place. |
| Where is the pole? | In Station 12's equipment bay, the locked cache room (his note on the watch desk says which key on the key board opens it). |
| Walkers at the river? | Usually one, sometimes two, every 45 to 90 seconds. |
| Reading there? | The pole's tag, a sign by the parking and Chief Dunn's note on the dock post, at all six levels. |

- **Why a junction with no place.** Every road used to run from place to place. Frog Lane leaves
  River Road where nothing stands, so the road graph gained `JUNCTIONS` (`frog`): a corner on the
  route with one lane per road like any junction, no drive, never a destination and never drawn as a
  place. Signs name the place a road runs on to (River Road through the corner is signed for the
  Water Tower; `Streets.farPlace`). River Road keeps its name on both halves; the street validator
  allows that only through a bare corner, in a straight line.
- **Routes along River Road gained a decision.** Driving Greenhouse Row to the Water Tower now
  meets the Frog Lane corner. By the house rule your usual lane takes the left road at a junction,
  and Frog Lane is the left road there, so going straight on means moving right. The map's "way
  there" shows that step and its lanes. Corn Lane moved from 0.35 to 0.55 of the way up River Road
  so both directions keep 2.5 seconds of lanes before the new corner.
- **Why River Landing is a place without a building.** It is in `LOCATIONS` (marked `outdoor`) so the
  map, the route and the drive work as for any place; it has no notes, layout, key or stash, and
  the Radio room never reveals it (only the pole's tag does).
- **The paving.** Frog Lane is asphalt for its first 18% (just through the corner), then dirt with
  ruts and stones. The river itself is drawn on the road, the same curve as the city map, and Frog
  Lane ends square at its edge. **Assumption:** the dirt is looks only; it does not slow
  the van.
- **The longest drive grew.** The mall to River Landing is the longest route in the city (about 137 s
  at the slowest van); the street validator's ceiling went from 125 to 140 s for it.
- **Why the bell holds the fish.** Walking back from a fight takes longer than a 2-second hook window;
  a fish that waits on a ringing bell keeps the propped pole worth using. Taken back, it gives a fresh
  window.
- **Fish are food, not an item.** A fish goes into the van's cargo as food and feeds the crew at home.
  **Bug fixed on the way:** food crates from shelves landed in storage and never fed the crew (the
  game said "bring food crates home" but only the Garden and Farm counted). Cargo food now adds to the
  crew's food, and old saves move stray crates over on load.
- **The pole is like a gun on the floor.** In your hands at once (6, or Q and the wheel after the
  guns), yours once home, lost with a dead trip. It works only at River Landing; a click elsewhere
  says there is no water.

## Owner decisions: every place at the end of its own drive, and the pond's routes (2026-10-14)

| Question | Answer |
|----------|--------|
| How does arriving match leaving? | Every building sits at the end of its own short drive off the corner where its roads meet. Leaving, the van drives up it to the corner and picks a road; arriving, the corner's sign has a lane for the drive, and the van turns onto it and parks at the door. Roadside lots are gone. |
| A place passed on the way? | Its drive is one more lane at its corner, signed with its name (Parking lot if unknown); taking it is a wrong turn ("That is ..., not ..."). |
| Where are icons on the map? | At the end of each place's drive, out of its corner the way the van leaves; the route line runs icon to icon. |
| A place with one road (River Landing, Ortiz Auto)? | It is at the end of that road: no drive, no last lane to pick; the van drives on to the end and parks. Leaving starts from the same spot. |
| The pond's routes? | Frog Lane leaves River Road square to it (a plain 90 degree turn either way, no hairpin) and runs west to the river's edge, where the van parks by the dock. The fishing scene is turned to match the map: water west, Frog Lane in from the east. The map's icon is a dock on the river's bank. |

- **The drive's length.** A place's drive is as long as leaving it needs (the start banner, the sign
  and 3.5 seconds of lanes before its corner: `Streets.driveLen`), so the same drive is driven in to
  park, about 8 to 10 seconds. Walkers keep coming down it until the van is nearly at the door.
- **The map's drives are a sketch.** On the road a drive is as long as the lanes need; on the map it
  is drawn a little longer than the icon so it always shows. Both point the same way.
- **The Water Tower hairpin stays.** Coming along Lake Road from the pharmacy, the way to the river
  turns back down River Road at about 133 degrees. Easing it means moving the Water Tower or
  rerouting a road, which changes the road graph; left for the owner.
- **Two drive times.** The road's time on the map now counts the drive in to park too, and the
  validator's ceiling is 150 s.


## Owner decisions: the crew at home base (2026-10-14)

June, Tomas and Pip lived only in text (the journal, the cabin's notes, the plot signs). The owner asked
for them at the base: people you can talk to for important information, who help (fixing the fence and
the like), and who send you on side quests to recover things in town for rewards. The design and the
contract between the files is `docs/CREW.md`.

| Question | Answer |
|----------|--------|
| Where are they? | They wander between spots in the yard and the cabin during the calm. |
| In a wave? | They shelter inside. Raiders can harm them, which only costs supplies: 1 medical kit from storage, else 2 food. Nobody dies; nothing is shown. |
| How do you talk? | A speech bubble on E; the yard keeps running. Quests are accepted in person, on a short pausing Yes / Not now card. |
| What do they say? | Story and mood that builds their characters, plus new information each time that helps the player. The player reads the bubbles. |
| What does helping cost? | They do the work and you pay the usual scrap; they tell you about it later. |
| What quests? | Five hand-written story quests each (15), then repeatable errands. One of Pip's is finding a stray dog and bringing it home. |
| How do you find a quest's object? | The request's words say where (place, direction, room or sign, landmark). It appears only once accepted. |
| Rewards? | Supplies, crew perks (lasting help), story payoff. |
| Extras? | Pip's dog, and trust levels. |
| The dog? | The stray barking past the trees. You name it: one of Pip's ideas or your own. |
| Can trust drop? | Yes: when a crew member is hurt in a raid, an errand runs late, or you give up a request. |
| Delivery? | Everything in one drop. |

Judgment calls made while building the crew (each marked **Assumption** can change cheaply in
`js/story-crew.js`, `js/story-quests.js` or `CREW_RULES`):

- **The shelter is the office closet.** Pip once slept in "the closet" (journal-16). Its two box
  stacks became the big battery against the end wall (not solid), so three crew and the dog fit.
- **The crew are not solid.** You and walkers pass through them and shots pass them by, so they
  never block a doorway, a fight or E at the cabin's spots (the crosshair has to be on them to talk).
- **Harm in a raid** needs a raider among them for 6 seconds, at most once per crew member per wave,
  and one raider hurts at most one of them (one left in the closet would otherwise cost three kits
  and nine trust); it costs 1 medical kit from storage, else 2 food (less if the pantry is short). **Assumption:**
  6 seconds, half the raiders go for the closet. The dog is never hurt.
- **Talk earns trust once a day; stars at 3, 8, 15, 24 and 35 points.** A quest is worth 5, an
  errand 3, a talk 1; a hurt costs 3, a late errand 2, a request given up 3. Quest n needs n-1
  stars and day 2, 4, 8, 13 or 19, so the stories unfold over about three weeks of game days
  instead of a week. **Assumption:** all of these numbers.
- **The dog quest waits for day 28.** June's ledger wishes for a dog up to day 28; once the dog is
  home, the repeating ledger pages skip the ones that wish for a dog.
- **One story quest and one errand can be open at once,** so an errand never holds back a story.
  Errands start after a crew member's first story quest, ask only for items some known place's
  shelves stock, count only what you bring home after accepting, and are taken from storage at
  hand-in. Filled in time, an errand never goes late, even if the items were used meanwhile.
- **A story quest is offered only once its building is known.** The crew never reveal a place,
  give a lock answer or say which key opens which stash: reading the town's notes stays the way in.
- **Two quest objects changed.** June's pill bag and the photo of Tomas's father are already
  described by notes in other spots, and a quest object must lie beside a landmark the request
  names, so June asks for knee tape and Tomas for his father's thank-you card.
- **Tips:** an urgent one wins (June when you are hurt or the food is gone, Pip's wave call);
  the others that apply take turns, one per talk; a fallback only when nothing else applies.
- **June's patch-up is told once,** in the bubble that heals you; it is not repeated as a report.
- **A walk across a plot is re-planned when a build goes up there,** so nobody walks into a new
  structure.
- **Pip calls only real waves** as lookout, and not after the dinner bell (that wave's own toast
  names the sides).
- **Tomas fixes only what the base can pay for,** never with a walker in the gap, and says nothing
  at the time; his next bubble tells it. Free fixes (a perk) are told as free.
- **A long bubble pages with E** before E opens the card or closes it, since the read panel cannot
  be scrolled with the mouse in first person.
- **Plain English for the UI around the crew** (the card's buttons and reward line, the backpack's
  labels, pickup toasts), like the kits and keys blocks; everything the crew say is at the reading
  level.
- **A gun that would land on a quest tile takes the next tile,** so no gun moves in an existing save
  and none ever lies on a quest object.
- **The dog's name:** letters (accents too), spaces, apostrophes and hyphens, 1 to 14 characters.
- **Trust is capped at the top star's points,** so a loss at five stars always shows as four.
- **June's ledger line for a quest comes the day after the hand-over** (the first day page after it),
  since it tells how the giver used the thing; the day the object comes home, the recap counts it.
- **An errand asks only for what the known shelves can give before its deadline** (at least 1).
- **When a build is ready, Tomas spends only the scrap above what it needs;** holes and cracks wait.
- **Pip's radio tip is told once,** and Pip has a fallback tip once every known building is at its
  walker limit, so every bubble still carries one useful thing.
- **An open errand shows as a line in its giver's bubble** (and in the hint on its last day), so
  "time ran out" is never the first you hear of it again.
- **Open question for the owner:** the fifth star gates nothing yet (stars 1 to 4 gate quests and
  jobs). A fifth-star reward (a job, a perk or a story) would be a design addition.
- **Cargo goes to the errand due first** when two open errands want the same item, and an errand
  whose item the known shelves cannot give in time is passed over in its turn.
- **After a hand-in** the bubble reopens with the payoff and no tip, and no reward toast covers it
  (the card already listed the reward). Arriving home with only a story object or the dog, the toast
  says what came home instead of "0 items unloaded".
- **Quest markers on the city map** carry a paper ring, so a crew color reads on a roof of its own
  color.
- **Pip calls a wave from every side "every side"** (as the yard's own wave toast does), not four
  fence names. While a bubble is open on a wide screen, the yard's toasts move to the other half of
  the view so they never cover it (at Huge there is no room, so a toast may cover it for its few
  seconds).

## Owner decisions: the first-run tutorial (2026-10-14)

The owner asked for "a tutorial during the game for when you first start playing. It should pop up and
show what buttons do what, and pause the game until the user pushes the button. Very intuitive." The
design is in `docs/GAME_SPEC.md` ("The first-run tutorial"); the logic is `js/tutorial.js`, the card,
panel and arrow `js/tutorial-ui.js`, the words `js/content/level1-tutorial.js`.

| Question | Answer |
|----------|--------|
| What does it cover? | The yard first (the basics), then ONE short card the first time the player reaches each new screen: the city map, the road (the first drive), a building (the door note, then the first time inside), the first lock, the river. (The cabin computer moved into the yard gate.) |
| When can the van leave? | Not until the player has done all of: walk (W A S D) and look around (mouse); open the Backpack (B) and close it (B); talk to a crew member (walk up to June, Tomas or Pip and press E); use the cabin computer (E at the office computer opens the build menu; close it); shoot "ONE SLOW PRACTICE WALKER" that comes in (click or Space). Until then E at the van does not open the map and June says what is left. On day 1 nothing can be built, so the computer card says: bring items home, build here. |
| Waves during it? | No wave until the yard basics are done. Then the normal first calm (`DEFENSE.firstCalmSeconds`) starts. |
| How does a step work? | "Card, then try it": the game freezes; a card explains with key pictures and a "Got it" button (Enter presses it too). Then a short "Now you try" prompt waits while the player does the real action. The game runs during "try it" (the wave hold aside). |
| What does it look like? | "Card + arrows": a centered comic card with key-cap pictures (W A S D caps, a mouse drawing). A ring and arrow point at a real HUD button (Backpack, Pause, Map); an edge-of-screen arrow points toward a target off screen (the van, the cabin computer, a crew member, the practice walker). |
| The How it works page? | Kept: a new save still opens it at once; the tutorial runs after it, in the yard. |
| Can it be skipped? | NOTHING is skippable; there is no Skip button anywhere. "Show tutorial again" in the pause menu replays it. |
| Reading level? | ONE level-1 text for everyone, whatever their reading-level setting. Level-1 rules still hold: whole sentences, 9 words or fewer, teen tone, no questions or quizzes. |
| Who talks? | June talks you through it: her face (the crew art), her name and her voice, under the crew text rules in `docs/CREW.md` (Pip is they/them, no lock answers, no place reveals). |
| The practice walker? | Slow, and it "HURTS A LITTLE" (a small bite). |
| The first lock? | A hint only. Gas-N-Go's drawer can end a trip at once, so the first lock's card says, in effect, "Read the note. Do just what it says." It never gives the answer, and no lock rule changes. |
| Which saves? | EVERY save does it, existing saves too: the yard part on their next Continue into the yard, each screen card on its first visit after the update. Veterans are not exempt. |

**The one-text rule is a departure, by owner decision.** Every other in-world text exists at all six
levels (the owner decisions of 2026-10-12 above; CLAUDE.md: "Words live in `js/content/levelN*.js` at
all six reading levels"), and the Settings screen says the reading level "Changes every note, sign, and
instruction in the game." The tutorial's words exist once, at level 1, and `tests/validate-text.js`
fails if any other level defines `T.tutorial`. The Settings line is unchanged (it is the owner's to
amend); if wanted, it could add "June's first-day tutorial uses the simplest words for everyone."

Accepted defaults:

- Enter presses Got it. Esc does nothing on a card, so a reflex Esc cannot break it (in pointer lock
  the browser eats Esc anyway).
- After a card in first person, Got it grabs the mouse (pointer lock, inside the click or the Enter
  keydown, with try/catch) and the first click into the view after a card does not fire the gun (how
  that is read: see the judgment calls).
- Keyboard and mouse only, as today (touch-only devices cannot start a game).
- The existing `click` sound on Got it; no voice narration.
- At Huge text, a ring for a HUD button that is hidden is dropped; the card still shows.

Calls made by Claude, told to the owner (reversible):

- **No tutorial death.** The practice walker cannot take the player below 50% health.
- **Crew favor cards wait.** Story quest cards are held until the yard part is done.
- **Progress per save slot, written at once** (`settings.tutorial`, like `settings.seenHowto`), so
  death or quitting never wipes it. An old save without the field has done none of it.
- **"Show tutorial again" is off during a wave**, as the build menu is: no menu you can hide in
  during a wave.
- **The river gets a first-visit card** like the other new screens.

Judgment calls made while building the tutorial (each marked **Assumption** can change cheaply in
`js/tutorial.js`):

- **Step order: walk, bag, shoot, talk, computer, then the ready card.** The owner's list (walk,
  backpack, talk, computer, shoot) is a checklist, not an order. Shooting third happens where you
  start, in the open yard, so the practice walker always has room and never has to find a player shut
  in the office; the trip into the cabin (crew, computer) then leads straight out to the van.
  Reordering is the one array `YARD_STEPS` (saves store step ids, so they keep what is done).
- **A step done early counts and its card is skipped,** so a veteran who walks, opens the backpack
  and talks loses three cards. The backpack step counts only B or the HUD Backpack button (not the
  pause menu's Backpack or the radio shelf's), the talk step any crew member but the dog, the computer
  step the build menu closing.
- **The ready card is not a basic.** It sends you to the van and its line and arrow stay until the
  van leaves; leaving with every basic done also counts it seen.
- **The hold starts and ends with a fresh first calm.** It freezes a new full calm (a calm already
  running might be short or already called by Pip), and the release installs another, so the owner's
  "normal first calm" always starts in full. The phase box shows "QUIET" with no countdown while held.
- **What the hold stops:** the calm's clock, shots shortening the calm, the dinner bell (refused with
  a plain toast), Pip's lookout call, every crew card (offers, hand-ins and the dog's name: one card at
  a time, one line of code) and the van. The bed stays allowed (it heals after practice bites); the
  calm it costs is thrown away at the release. Tomas's fence jobs and June's patch-up run as usual.
- **The practice walker** is a walker at half speed with a bite of 5 (a walker bites 12) and a
  walker's 30 health. It comes in 6 to 11 steps away, on the player's own walkable tiles (inside the
  fence, on your side of every shut door), ahead and in sight when it can. It never claws the fence or
  breaks into the cabin (it waits), pays no scrap (replay cannot farm it), and comes again near you
  when it has not moved for 15 s out of sight (30 s in sight). The pole in hand at the shoot step is put away for the gun; with
  the bow the try line says to hold and let go. **Assumption:** `PRACTICE` (speed 0.5, bite 5, floor
  0.5 of max health, 6 to 11 steps).
- **"First lock" is the first lock puzzle of any kind** (code, moves, a search choice, an alarm
  panel, a stash key), never the crowbar prompt: it is no puzzle, and a jammed lock in an old save
  could be the first prompt met.
- **The first click after a first-person card is eaten only when it is the click that takes the
  mouse back** (the pointer is not locked at mousedown). If Got it already took pointer lock, the next
  click fires as usual, so the first shot at the practice walker works. Space always fires. Refused
  pointer lock (an embedded page, or Got it by Enter in a browser that refuses a lock from a keydown)
  makes the next click take the mouse without firing; mouse look works unlocked anyway.
- **A card never interrupts another panel.** The next yard card waits while a speech bubble, a lot
  sign, the pantry list or a pickup tag is open, at most 20 s; a toast or road banner a card covered is
  shown again after Got it; in the yard only under the stay's first card (a later card would bring back
  old news, such as June's "Next, talk to the crew" once you have).
  Got it does nothing for its first half second (mashed keys, a click spree).
- **A pointer lock that lands after a pause is given back.** Got it asks for the mouse; a P pressed at
  once (the ready card says to) pauses before the lock arrives, and the pause menu would have no mouse.
  `js/interior.js` now returns any lock that lands while the scene is paused or stopped.
- **Never a dead end.** With no crew in the data the talk step ticks itself, with no office computer
  the computer step, with no room for the practice walker the shoot step. A card the UI cannot draw
  finishes at once, so the game never stays frozen.
- **Rings only on the three HUD buttons** the owner named (Backpack, Pause, Map). The yard's arrow
  follows the walkable way (through the cabin's doors), carries a label (Van, Computer, Walker, or the
  crew member's name), points at the nearest crew member, and hides within 2 tiles, where the game's
  own "Press E" line takes over.
- **Replay resets everything,** as the button's name says: the yard part and every screen card. In
  the yard the yard part starts over (a fresh held calm, an old practice walker removed, an open bubble
  closed, the walk card in a moment); in a building, on the road or at the river that screen's card
  shows now and the rest come on their next visit. How it works is untouched.
- **Progress lives in the slot's settings, not the base save:** the base save is written only at home
  and reloaded on death or quit, so a road or lock card would come back after every death. A basic is
  marked when it is done, a card when Got it is pressed; a refresh with a card up shows it again. With
  storage blocked (no save slot) progress is kept in memory for the session, so the van can still go.
  A new screen drops any card left from the one before (no path leaves one today; a safeguard).
- **Huge text:** the card is one scroll like the crew card (June's face and name, the title, the
  words, the pictures, then Got it; Enter works from anywhere and the arrow and Page keys scroll it).
  The "June says" caption folds away (at 800 px it wrapped over the face) and the side margins are
  thin, so a word like "backpack" fits its line. A ringed button keeps its ring only while the card
  still has 40% of the window's height beside it; otherwise the ring goes and the card shows as usual
  (**Assumption:** `MIN_ROOM` in `js/tutorial-ui.js`). On a window as small as 800 x 600 the try line
  can run past the bottom edge (the HUD's top row takes two rows there).
- **"Town map", not "city map":** the card uses the game's own word (How it works at level 1 and the
  wrong-turn button say town).
- **The words never go stale:** no digits, no place names, no crew names and no crew count ("one of
  us"), so a bigger city or a fourth crew member never makes them false. Control and button names are
  the game's own ("Drive there", "Step away", "Step back"). They are not counted in words read, like
  How it works.
- **Assumption:** `TUNE` (0.6 s before the first card, 0.8 s between cards, 20 s wait for an open
  panel, 0.5 s arming, the walk step's 3 tiles and 2.4 radians of turning, 15 s stuck, the arrow hidden
  within 2 tiles) and the checklist's 6 rows (`LIST_SHOWN`).

## Owner decisions: god mode, a test sandbox (2026-10-14)

The owner wants to test any part of the game directly. Code: `js/god.js` (menu and actions), the
sandbox in `js/state.js`, `godBegin` / `godGo` / `godExit` in `js/main.js`; tests:
`tests/validate-god.js`.

- **Typing `!godmode` anywhere opens the god menu,** for anyone (no URL flag, no localhost check).
  Nothing is saved in it, so the only cost of a player finding it is story spoilers. Once the `!`
  starts the phrase, its next letters never reach the game (no strafing, no map, no E). Typing it
  again reopens the menu; so does the red GOD MODE badge, bottom right, shown the whole time.
- **Nothing is saved while it is on.** `write()` in `js/state.js` does nothing (settings included),
  `commit()` keeps the sandbox in memory, and a death reloads the sandbox, not the disk.
- **Start:** a copy of the loaded save or a fresh day 1, picked in the menu. **Leave:** the Exit
  button, quitting to the title, or refreshing the page; the real save comes back from disk as it
  was. Start over (Sandbox tab) picks a new starting point without leaving the menu.
- **Travel:** reveal every place; go to any place at its door (door note first) or straight inside;
  drive from any place to any place (the player picks both ends), or go home to the yard.
- **Guns:** own, hold and mod any gun; one button for every gun with every mod maxed.
- **Items:** set scrap, food, kits, crowbars and every item; Unlimited tops them up to 999 after
  every build.
- **Crew:** set the day and each crew member's stars; per story quest, Offer now (the giver asks the
  next time you talk, past its gates and order), Jump to it (accepted, and you stand facing its
  object), or Reset.
- **Cheats:** can't die (no harm to you, the van, the fence, the room builds or the cabin; booby
  traps only toast), hold the calm, start a wave now, clear all walkers (in the yard, a building,
  the river or on the road; the downed ones and the blood go too), spawn walker (pick any
  `WALKER_TYPES` kind; one awake plain attacker in front of you on foot, or ahead of the van on the
  road; the kind picked stays picked), heal to full.
- **Not in it, by the owner's choice:** opening caches or stashes (the lock prompt's own "god mode"
  phrase, js/locks.js, still opens any lock), showing lock answers, and setting room levels.
- **Judgment call:** a lock prompt must be closed (Esc) before the menu can move you, because the
  prompt closes only through its own keys.

## Owner decisions: the wheel on a sign, E at the computer (2026-10-14)

- **The wheel scrolls a long read panel.** Looking at a sign in the yard (or any note, list or
  speech bubble too long for the read panel), the mouse wheel scrolls it. While it can scroll, the
  wheel never switches guns; once it closes, or when it all fits, the wheel switches guns as before.
- **E steps away from the computer.** E opens the office computer and E closes it, like B and the
  backpack. Not while the workbench, the backpack, a question, a tutorial card or a lock prompt sits
  over the menu: those keep their own keys.

## Owner decisions: the radio in the dining room, a tower in the yard (2026-10-14)

| Question | Answer |
|----------|--------|
| Where is the radio? | The whole radio shelf (the radio and June's ledger) moved from the living room to the dining room. Pip's radio post moved with it. |
| What does it do? | Each day's broadcast waits there: E tunes in (it is no longer on the arrival page, which says where the news is). Once heard, E opens the journal and every broadcast, as before. Before the Radio room is built, E there reads the journal. |
| Does it change with the Radio room? | Yes. Level 0 a dead radio; 1 the dial glows; 2 a ham set and speaker, and Pip's map and list of voices on the table; 3 a mic, headphones, an ON AIR light, and a cork board of the town in the corner. |
| The yard | Tower only, on the same 3x3 plot: a timber tower (about 2 tiles), a steel lattice on guy wires with a dish and a beacon (about 3.6), a red and white broadcast tower with two dishes, two beacons, an equipment hut and solar panels (about 5). |
| Judgment calls | Only the newest day's broadcast waits: an older one never tuned in to shows with its day. Old saves (no `tuned` field) count every broadcast as heard. The radio's words count toward words read when it is first shown. |

## Owner decisions: How it works, rewritten as backstory (2026-10-15)

The owner asked to "rewrite the How it works for each level. Decrease the length by 50%. Only
explain the important information that are not the controls in the body and include mostly back
story for all 6 levels."

| Question | Owner's answer |
|----------|----------------|
| The validator required ~21 rule topics and 5 numbers. | Trim it to the core: the only save, waves, scrap, typing, notes, alarms, stashes, keys, road signs and turning lanes (`HOWTO_MUST`). The numbers check is gone. |
| New lore, or existing canon? | Existing canon only (`docs/STORY.md`, June's Day 1 entry, the house notes). No new facts. |
| Keys in the body? | None. The controls list under it names every key. |
| The crew paragraph? | Folded into the story: who June, Tomas and Pip are, then talk, favors and trust stars. The fence fixer and the shelter are left to the crew's own words. |

- **Length:** each level is 47 to 51 percent of its old word count (level 1 740 words, level 6
  1,046), seven paragraphs: the Fall and the van; the Hollis cabin and saving; the crew; living
  among the Hollises' things; the notes and the key ring; the road; home, waves and typing.
- **What left How it works** (still taught elsewhere: the tutorial, the controls, plot signs,
  notes, item tags, the crew's tips): kit counts, repair prices, restock days, save slots, the bed,
  journal and radio details, late rooms, crowbars, traps, the House tab and the van's cargo.
- **Judgment call:** the convoy is written as "meant to carry people north", never as gone or
  still waiting, since the Hollises left with it and its departure stays off screen.

## Walkers v2 (2026-10-15)

The owner asked for walkers in 3D that can be seen from every side, six kinds with walks of their
own, random spawns, only the walkers near a fence hole going through it, and no walker counts on
screen. The facts are in `js/world.js` (`WALKER_TYPES`, `SCREAM`, `ALARM`, `WALKER_THEMES`,
`RIVER.walkerMix`, `NOTES[id].walkers`, `DEFENSE`'s breach and wreck numbers, `SETTINGS.walkerGore`
and `walkerSpawn`); the models are `js/walker3d.js` and `js/walker3d-looks.js`; the live drawing, the
governor, the screamer, the downed and the blood are in `js/interior.js`; the wreckers and the builds'
strength are `js/yardwreck.js`; building spawns are `planWalkers` in `js/building.js`; the road's walkers
are `js/game.js` and `js/sprites.js`. The design is `docs/GAME_SPEC.md` ("Walkers"); growing it is
`docs/SCALING.md` ("Add a walker kind").

| Question | Owner's answer |
|----------|----------------|
| How are walkers drawn? | Live 3D jointed models drawn every frame, seen from every side, in the game's ink-outline comic style with 3D shading. No dependencies, no WebGL, no image assets: canvas 2D code only. |
| Gore? | Allowed in walker ART: blood smears, exposed ribs through torn shirts (as in the reference picture), a short dark-red spray on every hit, a blood pool under a downed walker. All of it behind ONE switch, `SETTINGS.walkerGore` (on). Off: grime instead of blood, no ribs, no spray, no pool. The text rules do not change: no gore words in reading text (`CREW_GORE` and the rest stay), no on-page human deaths. |
| Which kinds? | Six: `walker`, `runner`, `brute` (the old ids, restyled to the reference) plus `lanky`, `armored` and `screamer`, each with its own gait, health, size, damage, speed and look. |
| The screamer? | It screams when it first spots you, and again after a cooldown. Frenzy: every AWAKE walker within about 10 tiles (itself too) moves 30% faster for 5 s. It wakes no sleepers. Everywhere, the road included. |
| Downed walkers? | They collapse (each kind its own way), then fade over about 2 s. No bodies are left. |
| Which kinds where? | By danger and day, plus themed places: armored at the police station and the fire station, lanky at the hospital and the library, screamers at the school and the mall, brutes leaning at the lumberyard. The road gets all six. |
| Yard roles? | Each wave walker: 25% raiders (as before), 25% WRECKERS, 50% attackers. Once inside the fence, wreckers attack the VAN and the ROOM BUILDS. A wrecked build gives no room bonus until it is fixed for scrap (E at it, the office computer's "Fix all", or Tomas in the calm). A wrecker turns on the player when hurt, when the player is within 5 tiles, or 30 s after it got inside. |
| Breaches? | EVERY walker (any role) goes to a fence hole only when one is within about 8 tiles' walk outside the fence; everyone else keeps clawing their own segment. Checked all the time; the nearest hole in range; a fixed hole sends its walkers back to clawing where they stand. |
| Buildings? | Walkers start at random spots every visit (spread out, never on items, notes or quest spots, at least 6 steps from the door). Walkers a door note or graffiti NAMES start within about 3 steps of the named spot. Door-note counts and Ruby's numbers stay. |
| Counts on screen? | Removed: the HUD WALKERS box (every scene), the yard's "WAVE · N left" (now "WAVE" or "HEAVY WAVE"), the river's "Two walkers" toast (now "Something is coming out of the trees!" or "Branches snap behind you. Something is coming."). |
| The crew? | New Pip and Tomas tips about the new kinds and the wrecked builds, at all six reading levels. The crew stay flat 2D. |
| Practice walker, god mode? | The tutorial's practice walker stays a plain `walker`. God mode gets "Spawn walker: [kind]". |
| Defaults the owner was told | Lanky 40 health, speed 1.5, bite 14, a longer reach (1.25 tiles); armored 60, 1.0, 14; screamer 22, 1.35, 8; walker, runner and brute unchanged. A lanky can be only a little taller than a walker indoors (1-tile ceilings): it reads tall by thinness and long arms. |

**Judgment call beside the tenth answer ("Counts on screen?"): the cabin cue.** With the count gone,
nothing on screen said why a wave went on while its last walkers waited out of sight in the cabin
(raiders stand at their spots until you come in or near). The van, the bed and the computer refused,
and the van's line sent you to the fence. So the label says where walkers are, never how many:
"WAVE · walkers in the cabin" or "HEAVY WAVE · walkers in the cabin" (`CABIN_LABEL`, `js/yard.js`)
while any walker stands in the cabin (`inCabin`: under the roof and off the porch, since one on the
porch is in plain sight) and you are outside it (the porch counts as inside). Once every walker of
the wave has come and every one left stands in the cabin (`cabinHoldsWave`, `js/house.js`), a toast
says "Walkers are waiting in the cabin. Clear it out." at once, then every `CABIN_CUE_SECS` (20 s)
while you stay out. "Walkers got into the cabin. They wait in there: clear it out." is said once a
wave (it was once a yard stay) and counts as a cue (`raidToastAt`), so the two never come back to
back. While the cabin holds the wave the van says "Not now. Walkers are still in the cabin.", the
bed, the computer, the radio shelf and the typewriter say "Not now: walkers are still in the
cabin.", and their hints end "(walkers are still in the cabin)". With a walker anywhere else the old
lines stand ("Not now. Clear the fence first."). The owner can drop the label's tail; the toast and
the refusals would still explain the wait.

### Approved by the lead (deviations from the build spec)

- **Theme weights.** The spec's multipliers failed its own rule (on day 5 a themed place's kind is
  the likeliest after the plain walker) at 6 of 7 places, because the runner weighs 0.45 from danger 2.
  Built: a themed kind weighs `max(its formula, WALKER_THEME_FLOOR 0.15) x multiplier`, with police
  3.5, firehouse 3.5, hospital 3, library 3, school 3.5, mall 3.5, lumberyard 2.25. On day 5 the
  themed kinds weigh 0.495 to 0.525 against the runner's 0.45 (validate-world holds the rule); the
  floor also gives a themed kind still gated off by the day its 0.15 base, and stops its weight
  dropping the day the gate opens (0.12 is under 0.15).
- **The render budget** (the starting row sits below the spec's numbers). `LIVE_RENDERS_MAX` 10 live
  redraws a frame (spec 24), `LIVE_MAX_PX` 320 (spec 400; a nearer walker's picture is scaled up
  unsmoothed, about 1.65x at 1.25 tiles on a 720p screen, the floor's own grain), `LIVE_NEAR` 3 (only
  the 3 nearest full-detail walkers redraw every frame they change; spec: every lod-0 walker),
  `FAR_LOD` 1 (every other walker takes turns, at most every `FAR_EVERY` 2 frames, with no fingers,
  ribs or sheen), governor cap rows 10 -> 8 -> 6 (spec 24 -> 16 -> 12). Why: with the spec's settings
  stress render p95 measured 3.5x the old sprites (target 2.5x); each near walker costs 2-4 ms on a
  software canvas. In melee with 4 or 5 walkers within about 1.5 tiles, the 4th and 5th animate every
  other frame at lod 1. A fast machine still reaches the spec's settings: two governor rows sit above
  the defaults. `LIVE_NEAR` 4 measured 2.38x against 2.30x, too little margin on a loaded machine.

  Measured A/B (headless Chromium 141, `--disable-gpu`, 1280 x 720, the walker perf harness with the
  governor pinned on its starting row, interleaved against the commit before integration, which drew
  the old cached sprites; 3 runs each, medians, a 4-core container shared with three other builds):

  | Scenario | Build | Render mean | Render p95 | drawScene mean | Redraws a frame | Ratio mean / p95 | Target |
  |----------|-------|-------------|------------|----------------|-----------------|------------------|--------|
  | stress, 40 on screen | old sprites | 8.29 ms | 12.9 ms | 2.04 ms | - | | |
  | stress, 40 on screen | live | 20.84 ms | 28.4 ms | 14.01 ms | 10.0 | 2.51x / 2.20x | p95 <= 2.5x: met |
  | heavy wave, 30 | old sprites | 9.77 ms | 16.1 ms | 1.54 ms | - | | |
  | heavy wave, 30 | live | 10.30 ms | 14.5 ms | 2.17 ms | 2.57 | 1.05x / 0.90x | mean <= 1.35x, p95 <= 1.5x: met |

  How the defaults were reached (stress p95 against the old sprites): the spec's settings 3.5x; a
  cap of 12, oldest first 2.5-3.0x; plus 320 px 2.4-2.7x; 3 near, cap 10, turn-takers at lod 1, 320 px
  (chosen) 2.30x; 4 near, cap 10, lod 1, 288 px 2.38x. Retained heap over 20 s of stress: +0.5 MB (the
  colour-string table filling; it converges), old sprites +0.1 MB. Turning to face a crowd: at most
  10 redraws in the first frame back (38 before the fix). Unpinned on this container the governor
  stepped to its last row (render 16.1 / 25.6 ms); pinned on row 0 it measured 31.8 / 45.3 ms.

  The governor's rows (`LIVE_LEVELS`, richest first; it starts on row 2, `LIVE_START`):

  | Row | near | farLod | far every | max redraws | maxPx | scale | LOD heights |
  |-----|------|--------|-----------|-------------|-------|-------|-------------|
  | 0 | 6 | 0 | 2 | 24 | 400 | 1 | 160, 64 |
  | 1 | 4 | 1 | 2 | 16 | 400 | 1 | 160, 64 |
  | 2 (start) | 3 | 1 | 2 | 10 | 320 | 1 | 160, 64 |
  | 3 | 3 | 1 | 3 | 10 | 320 | 1 | 160, 64 |
  | 4 | 3 | 1 | 3 | 8 | 320 | 1 | 160, 64 |
  | 5 | 3 | 1 | 3 | 6 | 320 | 1 | 160, 64 |
  | 6 | 3 | 1 | 3 | 6 | 320 | 0.7 | 160, 64 |
  | 7 | 3 | 1 | 3 | 6 | 320 | 0.7 | 224, 96 |

  One row down after 120 slow frames in a row (smoothed render over 12 ms or frames over 24 ms, the
  floor's own quality thresholds); one row up after 300 fast frames (both under 0.75 of those) with
  at least `liveNear` walkers on screen. Only frames that redrew live walkers count, so a calm yard
  neither lifts nor drops it. A row it had to leave takes 2, 4, then 8 times as long to climb back to
  (`GOV_BACKOFF`), so a machine on the edge does not see-saw. The near walkers draw every frame at
  every row.
- **The road's blood colour.** Road drops and splats are `#a3201a` and `#7d1610` (`BLOOD` in
  `js/game.js`), brighter than the 3D figures' (118, 18, 14): the darker reds did not show on the
  asphalt at road scale. The pool under a downed road walker keeps the 3D colour. The owner asked for
  "a short dark-red spray", so this is one line to darken if wanted.
- **Armor sparks stay on with gore off.** Grey sparks off an armored walker's helmet or vest on the
  road show whatever `walkerGore` says: they are not gore. Only the blood is under the switch.
- **The police station's brute is the only one** (`only: true` on its rule). "A big one by the police
  bike" and the graffiti's "One of them is big" were false with the old two or three brutes; now no
  other brute comes from the place's mix, nor from its alarm.

### Judgment calls: the facts and the engine

- **A kind is one row.** `WALKER_TYPES[id]` carries its stats, its building and yard weights
  (`mix: { building(danger, day), yard(day, heavy) }`) and its road row, so a new kind needs no code;
  the river reads `RIVER.walkerMix`, an alarm `ALARM.mix`, the road `road.w`. A kind missing from
  `ALARM.mix` keeps its building weight; an unknown `where` counts as a building; an unknown kind is a
  plain walker everywhere (never a throw).
- **The alarm's mix multiplies the place's building weights** (as the spec said), so alarms bring more
  runners than the old flat 30% (a danger-2 building on day 1: about 47%), and armored walkers at the
  police station. No screamers in an alarm: the siren is loud enough.
- **`DEFENSE.fenceDps` and `SETTINGS.footDamage*` moved into the rows** (`fenceDps`, `bite`); the
  Medbay's `footDamage` multiplier stays. validate-world fails if the old keys come back, if
  `WALKER_TYPES`' first key is not `walker` (`pickWalkerType`'s fallback) or if a radius reaches 0.5
  (a walker must fit a one-tile doorway).
- **The screamer stands to scream.** `stepWalker` returns act "scream" while it yells
  (`SCREAM.yell` 1.2 s): it stops, faces you and does not bite; `screamT` is the cooldown (12 s). It
  screams when awake, you are within `SCREAM.spot` (8 tiles) and in its line of sight.
- **Frenzy never touches the practice walker,** neither when set nor when speed is worked out; a
  Medbay revive clears frenzy and the yell; "A scream! Walkers near it speed up." shows at most once
  every 20 s a scene (`SCREAM_TOAST_GAP`): the sound and the pose are the cue after that.
- **A walker killed this frame does nothing more.** Shots and traps run before the walker loop, and
  `Interior.update` steps only walkers with health left, so a sleeping screamer killed by the shot
  that wakes it never screams (and speeds no one up), and a dead walker never bites or claws.
- **A kind counts as met** (`save.met`, for the crew's told-once tips) when an awake walker of it is
  within `MEET_RANGE` 12 tiles, inside the view and in clear sight (checked every 0.4 s, and never for
  a kind already met), when one is hurt, when god mode spawns one, or when one comes on screen, is hit
  or rams the van on the road. It is written straight to the save in memory: home keeps it, a death
  throws it away with the trip. "Inside the view" is the visible width: within `halfView() + 0.05`
  rad of the middle, `halfView()` = `atan(tan(FOV / 2) x W / H)`, the angle `project()` puts at the
  screen's edge. It was `FOV / 2 + 0.05`, which missed walkers near the sides of a wide screen.
- **`z.aim`** is the player object or the claw target `[x, y]` (a fence, a door, a build, the van), so
  nothing is allocated per frame.
- **A downed walker is the same object** moved from `walkers` to `fallen` (never targetable, solid or
  counted), with `fallT` and `fallDir` (away from the killing shot; with no source, backwards from its
  heading). It goes at `FALL_SECS` (2); `FALLEN_MAX` 24, the oldest first. A wave ends one frame after
  its last kill, as before.
- **Blood is data in the engine** (`this.blood`, only with gore on): `round((4 + min(8, dmg / 5)) x
  (kill ? 1.5 : 1))` drops a hit, flung away from the shot; a drop that lands lies as a splat for 3 s;
  `BLOOD_MAX` 200, the oldest first.
- **A lanky's bite past a plain walker's reach needs a clear line,** so its 1.25-tile reach never bites
  round a wall's corner; within a walker's 0.85 it bites as before.
- **A walker that screamed comes back screamed.** The trip snapshot keeps each walker's `seed`,
  `heading` and a `screamed` flag; on a return visit its cooldown starts full, so it does not scream the
  moment you walk back in.
- **God mode's road contract** is `ZSR.Game.spawnWalkerAhead(type)` (the same shape as
  `Interior.spawnWalkerAhead`): it returns the walker or null when there is no room. God spawns are
  plain attackers (no raid, no wrecking). On foot the spot must be reachable in a straight line the
  player could walk (never past the fence or a counter) with the body's corners clear, and its health
  uses the scene's multiplier.
- **"A" or "An" by the kind's name** in every message ("An armored in front of you.").

### Judgment calls: the 3D models (js/walker3d.js, js/walker3d-looks.js)

- **No squash to the view's stretch.** The model keeps screen proportions (`box.w` is in screen
  tiles); dividing by `STRETCH` would make every walker about 30% too thin.
- **Perspective inside the figure,** clamped to 0.6..1.6 a point (`K_MIN`, `K_MAX`): a reaching hand is
  bigger up close; a body lying toward the camera uses half of it, so a near head does not balloon.
- **The fit to its picture depends only on the kind and the camera,** never the pose: every pose of a
  kind is sampled into one envelope at load, so a figure never zooms when a bite starts. To keep full
  size at 2-3 tiles the boxes widened (walker 1.12, brute 1.56, lanky 1.5, screamer 1.1 tiles); the
  heights are the spec's (walker 0.92, runner 0.9, brute 1.05, lanky 1.15, armored 0.95, screamer 0.9).
- **Nothing is drawn below the feet line,** so a foot stepping toward the camera or a body falling
  toward it sits on the floor; every point is clamped into the region.
- **Eyes keep their glow under fog** (the hit flash still whitens them): they read in the dark.
- **Gore off** means grime-coloured smears (no strong red, tested), dark skin in the rips, no ribs,
  no pool and no mouth dribble.
- **The head sorts by its real depth when turned away,** with the neck rising into the back of the
  skull; the brute's neck was raised so its skull clears its shoulders from behind (its chin still sits
  low at the front). Backs of heads have their own cues (hair to the nape, ears, a darker bald skull
  with a scar, a hood's seam).
- **A face-down head shows no face.** When the head's forward points lower than `FACE_DOWN` (-0.7,
  up is +1; exported on `Walker3D`) it draws no face decals, no jaw and no riot visor, and sorts by its
  real depth, so a body lying away from you covers its head. Upright poses never pitch the head below
  -0.58 (every kind, pose, gait and seed probed). Before, a brute shot in the back and seen from behind
  showed its open red mouth between its boots. The line rises with how far the body has gone over:
  -0.7 standing to `FACE_DOWN_LYING` (-0.4) lying flat, because the lanky's fold (-0.63) and the
  runner's tumble (-0.58) end with the head folded back under the body. Every kind shot in the back,
  every look and seed, seen from behind, the sides and 3/4 behind, now shows no face (validate-art
  J2b); a body that lands face up still shows it (J2c). Kept on purpose: a runner shot about 0.3 rad
  off-centre lands on its cheek (face about 20 degrees down), which still shows a face from the side
  and reads as a head turned sideways. Left for an art pass: the brute's tree fall
  still drops the head below the legs' line (the review asked to keep it on the torso's line); with
  the depth sort and no face, the reported artefact is gone.
- **Variants by seed:** armored is riot gear (even seed) or a firefighter (odd); lanky a hospital gown
  (even) or a long coat (odd). No real organisation names or logos.
- **Each kind falls its own way:** walker and screamer crumple, the brute topples like a tree, the
  lanky folds forward over its knees, the armored drops to its knees then forward, the runner tumbles;
  each lands lying flat with limp arms on the floor, the pool (gore only) longer along the body.
- **The scream pose stays inside the 0.9 box** (arms out at head height), so the figure never shrinks
  mid-scream; any other kind asked to scream bites instead.
- **The lanky is 1.15 tiles tall** but capped at 0.98 indoors, so it reads tall by thinness, a long
  neck and arms past its knees.
- **The runner's hood in pure profile** shows only a sliver of face and one eye: accepted, it reads as
  a hood.
- **Three levels of detail:** lod 0 everything (fingers, ribs, sheen, teeth, pupils); lod 1 no fingers,
  ribs, sheen or shading crescents; lod 2 a silhouette, the head and the eyes. Canvas calls a figure
  stay under 600 / 350 / 160 (563 / 304 / 116 today).
- **The engine eases poses** through `st.poseW` (0 = the walk, ramped over `POSE_BLEND` 0.15 s), and
  fog is drawn in 1/32 steps (`FOG_STEPS`), so the engine skips a redraw for a fog change under a step.
- **The road's top-down looks copy the 3D looks' skin, shirt and hair** (`js/walker3d-looks.js`,
  checked by validate-art), matched to the reference picture: indigo hoodie, ochre tank, maroon top.

### Judgment calls: drawing them live (js/interior.js)

- **Every walker and downed walker on screen is a live sprite:** Walker3D draws it into the walker's own
  pooled canvas at its size on screen, and the picture goes through the same projection, depth sort and
  per-column wall clipping as every other sprite.
- **Culled behind walls:** a walker no column of which shows past the walls gets no render and no
  canvas.
- **Fog is baked into its colours;** a pooled canvas never goes through `Draw3.dim` (tested).
- **Under a ceiling and in the cabin a walker is capped at 0.98 tiles** (`CEIL_CAP`, props use the
  same): the whole figure shrinks, drawn as if seen from farther off.
- **The health bar sits just over the head** (`box.head`) and is the hit width wide (`box.bar`).
- **Level of detail goes by height on screen,** not by render height, so the governor's 0.7 resolution
  step lowers resolution only.
- **Old pictures wait, first in line.** A picture of a walker taking turns that is out of date (not on
  screen last frame, grown over 15% on screen, or with less detail than it now gets) shows a frame or
  two longer, scaled, ahead of the rest of the wait list; past the frame's cap a never-drawn picture is
  drawn at lod 2 first. Turning to face a crowd used to redraw all of it in one frame.
- **Must-draws, never capped:** a picture never drawn, a near walker's old picture, and a hit flash
  starting or ending (at most two a hit).
- **A walker near last frame counts 5% nearer** (`NEAR_STICK` 0.95) when the near ones are picked, so
  two at about the same depth do not swap detail every frame.
- **Bodies take near places only while collapsing** (0.9 s); a settled body keeps the detail it was
  drawn with (no pop) and is not drawn again while it lies still.
- **Poses ease both ways:** from walking straight into the new pose; from any other pose out to the
  walk first, then in. Between bites a walker holds the lunge's end (arms out, at you); asleep it is
  idle and still, so it is drawn once; awake and idle it breathes.
- **Each look's own turn and claw rates** (a brute turns at 4 rad/s, a runner at 9), not one engine
  constant.
- **The hit spray splashes back too:** one drop in three flies back out to the sides from the front
  of the body, since a spray thrown only away from the shot hid behind the walker's own body. It starts
  at the walker's drawn height, so a capped lanky or brute bleeds at the chest, not the head.
- **Canvases grow in place** (no new canvas as walkers come nearer), shrink only inside a draw that
  happens anyway (after 30 renders under half size), and go back to the spares after 60 frames unused
  (`LIVE_SPARE` 8 kept); leaving a scene lets every one go.
- **The tutorial's arrow** over the practice walker lifts by its drawn height + 0.3 tiles, not a fixed
  1.25.
- **The old walker art is gone** (`Draw3.walker`, its looks and the two-frame toggle); `seededRng`
  stays for the muzzle effects.
- **The crew no longer size by the walkers:** `WALKER_TOP` became `PERSON_TOP` (122, unchanged), a
  grown-up about 0.905 tiles tall at prop scale.
- **A sprite's edge column samples inside its picture** (it read up to 0.7 px past it): invisible on
  a cleared live canvas, a sub-pixel change elsewhere.

### Judgment calls: the yard (breaches, wreckers, wrecked builds)

- **Walking distance outside the fence** is counted in 4-way steps along open ground outside, from the
  hole (the tile just outside it is 1); one search from every usable hole at once keeps each outside
  tile's nearest hole (ties: the first in grid order). A walker outside is denied every other hole, so
  with two in range it takes the nearer even when the other lies on the shorter way to you.
- **A usable hole** joins open ground outside to open ground inside (4-way); a corner hole never does.
  A walker standing in a hole tile counts as inside the line, and goes on through.
- **New core hooks:** `PathBlock(z, goal)` (tile indices one walker's path search treats as solid; the
  straight-line shortcut is skipped while it returns a list; `true`: there is no way to that goal at
  all, so the core runs neither the path search nor the `Barrier` search and the walker claws
  `nearestFence`), `Breach(x, y)` (a segment gave way), and a `WalkerGoal` with `aim` [x, y] clawed once
  the walker stands there. Other modes behave as before.
- **No way in, no search.** The yard's `PathBlock` answers `true` for a walker outside the fence with no
  hole in range (or no holes) whose goal is inside the fence: every way in is a hole and all of them
  are shut to it. Before, each such walker flood-filled the whole outside twice every 0.4 s (the path
  search, then `yardBarrier`) and failed both times. The practice walker is never answered `true`.
  `nearestFence` keeps the parsed "x,y" keys (`FENCE_KEYS`), so it no longer allocates per segment.
- **A hole change re-paths only the walkers it touches** (a breach, a mend by you or Tomas,
  `patchFence`, coming home). `breachChanged` keeps the last change's nearest-hole array (two
  Int32Arrays swap, nothing is made per change) and resets `pathT` for: a walker on the fence line; a
  walker outside whose nearest hole in range changed; a walker whose path steps on a hole that opened
  or closed; every walker the first time the arrays are made. Everyone else keeps their own re-path
  clock, so a wave's searches stay spread over frames; resetting everyone put all of them in one frame
  at every breach and mend and kept their clocks in step after. This narrows the build spec's "reset
  every walker's pathT" (5.2) to the walkers whose search would come out differently. The
  nearest-hole search costs about 0.5 ms. Measured with the review's yard re-path harness (seed 7,
  fence 40 health, 108 walkers, the 450 frames after the first hole): update p95 31.2 ms before the
  fix, 10.5 ms after (6.0 ms on 942b379, before walkers v2); frames over 16.7 ms 48, 12 and 6.
- **The cabin's barriers still re-path everyone:** a cabin door or window broken or forced, and a door
  opened or shut (by you or the crew), set every walker's `pathT` to 0 (`js/house.js`, `js/crew.js`,
  `js/interior.js`; older than walkers v2). Walkers outside the fence now skip their search, so these
  cost much less, but the clocks still fall into step after one. Resetting only the walkers whose path
  crosses the barrier is the next step if waves at 3x need it.
- **Wreckers can be provoked outside the fence too** (hurt, or you within 5 tiles), and "hurt" lasts
  (`hp < maxHp`), so a screamer wrecker shot mid-yell still turns once the yell ends; traps provoke.
- **A wrecker harms its build or the van only while it claws.** `yardWreck` skips a wrecker whose `act`
  (last frame's) is not "claw", so a screamer wrecker yelling at you from its spot takes nothing off
  the build; on arrival the harm starts one frame late.
- **A wrecker's target** is the nearest free spot by walking distance at a build still standing or at
  the van above its floor (one wrecker a spot); it picks again only when its target falls; with
  nothing left it comes for you.
- **The van's floor** is `round(vanMaxHp x vanWreckFloor)` (30%): wreckers stop there, so a trip never
  starts wrecked. "They are wrecking the van!" once a wave; the wave-cleared toast adds where to fix it.
  Dents show under 75% and 50% health, after a hard drive home too (it is just true).
- **Damage persists between waves** (`save.builds` keeps the number): under half a build looks
  cracked and E braces it; at 0 it is wrecked (taped plaque, cracks, debris, dark beacons), keeps its
  footprint (paths stay valid) and gives no bonus. Upgrading a damaged room rebuilds it whole.
- **The built level still counts** for room requirements, crew posts, the radio shelf's art, the
  plot's build and the base card's pips: only the bonus goes (`State.effects`, `roomLevel`).
- **A crew topic gated on a room waits while its build is wrecked.** `crewWhen`'s `room` + `level`
  reads `State.roomLevel` (0 while wrecked), not the built level: tomas-t6 (the free van repair),
  pip-t7 (the daily broadcast) and june-t9 (the garden grows food) give the room's bonus as working,
  which a wrecked build does not give (the owner's "Yard roles?" answer). A cracked build still counts.
  A told-once topic is delayed until the fix, never lost. This reverses the yard drop's call that
  topics read the built level.
- **A wrecked Radio** logs no broadcast that day (none is lost: the order is kept), cannot be tuned in,
  and Pip's radio tip waits until it is fixed.
- **Tomas fixes wrecked builds only,** after the fence and before the cabin (job `builds`, no star gate,
  never in a wave): the crew's words say "wrecked builds" at every level; a build only cracked still
  works and the player braces it.
- **Repairs cost 3 scrap a build** (`buildRepairScrap`). E works mid-wave like the fence, but not while a
  wrecker claws at that build ("Clear the walkers off it first."); Fix all does wrecked builds first,
  then cracked ones, as far as the scrap goes.
- **God mode's "Can't die" protects the builds and the van:** wreckers claw and nothing gives.
- **Tips:** the told-once tips (Tomas `lanky` and `armored`, Pip `screamer` and `wreckers`) are urgent,
  told at the next talk; `wreckers` applies once any room with a yard plot is built (the Walls have
  none); Tomas's `wrecked` tip is a regular one after `fence`, with `{rooms}` and `{cost}`.
- **Tomas's `{cost}` is the Fix all price:** one rule, `State.buildFixAll(dmg)` (every wrecked build,
  then every cracked one, `buildRepairScrap` 3 each), feeds the office computer's "Fix all for N
  scrap", `repairAllBuilds` and the tip, said as "fixing it all costs {cost} scrap". With a build
  wrecked and another cracked, Tomas and the button both say 6 (validate-crew checks the two match).
- **Tomas's `fine` waits for the builds.** "Nothing needs fixing right now" is not said while any yard
  build is cracked (under `CRACKED` 0.5 of its strength, the share `buildDmg` uses) or wrecked, read
  from the yard's live lists (`ctx.cracked`, `ctx.wrecked`) or else the save, since the lot panel and
  the computer say such a build needs fixing. A cracked build has no tip of its own (that would need
  six new leveled texts), so with only cracked builds and nothing else to say Tomas gives no tip line
  that talk. Open question for the owner: is a "cracked builds" tip wanted?
- **Pip's screamer tip** says only awake walkers near it speed up and sleepers sleep on, at all six
  levels, as the scream does (it said "walkers nearby hear it and speed up", which took in sleepers).
- **One order for wrecked builds** (`WORLD.BASE_ROOMS` order) in the HUD goal, the toasts, the computer,
  Tomas's tip and his job, so every list reads "Garage and Radio" the same way.
- **The Garage tab** says "Fix the Garage" when an upgrade is capped by a Garage built far enough but
  wrecked.
- **A walker caught alone on a corner** (stalled 1.2 s while walking, nobody beside it) gets a route
  through tile middles to the end of its path (`yardUnjam`): the engine's straight-line shortcut checks
  the line through a walker's middle while it collides by its radius, and beside a build's corner it
  could swap for ever between the two. Yard-local, so other modes keep their behaviour.
- **The controls list** (E's line at six levels and the fallback) says E fixes a wrecked build for 3
  scrap; plain-English UI literals (toasts, hints, the HUD goal's " · wrecked: Garden and Well").

### Judgment calls: the road (js/game.js, js/sprites.js)

- **Stats and mix from the table:** speed, radius, damage, scrap and reach from each kind's `road` row;
  `ZOMBIE_TYPES` and the runner and brute steps in `DIFF` are gone. `DIFF.pxPerTile` 56 (a walker's
  18 px over its 0.32 tiles) turns the scream's tiles into px: it screams on screen within 448 px of
  the van and frenzies walkers within 560 px.
- **Frenzy speeds only the walker's own approach,** not its keeping up with the van or its knockback;
  worst case about 2.5x base speed, not clamped.
- **No toast on the road:** the scream's cue is a "SKREE!" burst, the sound and the frenzy look (red
  eyes, a red ground aura, or amber with gore off, speed lines).
- **Faces tip up toward the van,** heads 0.54-0.68 r (were 0.82) so the shoulders and the shirt colour
  that tells the kinds apart show, and the eyes glow yellow as on foot.
- **Every hit bleeds with gore on,** 5 drops a hit and 9 a kill; the drops carry the walker's keep-up
  speed so the spray stays with it; half leave a splat that scrolls away with the road.
- **A ram is a hit like a shot:** the van's ram flashes the walker (`z.hit` 0.12) and sprays the way
  the push goes, through the same `blood()` (5 drops, 9 on a kill, an armored walker's glance and its
  sparks; nothing with gore off; `ROAD_PARTICLE_CAP` still applies).
- **Health bars stay level after a turn.** `Draw.zombie(ctx, z, t, noShadow, viewTurn)` draws a hurt
  walker's bar round the walker turned back by `viewTurn`, the road's world turn (`Game.viewTurn()`,
  -pi/2 - `cam.th`, also used for the road's two world rotates); the title screen passes none.
- **Armor is in the data:** `road.armor` (only the armored kind, 0.5) is the share of its non-fatal hits
  that also glance off its gear in grey sparks with a smaller spray (3 drops); a killing shot never
  glances. The brute's low knockback does not make it armored: it bleeds like any other.
- **Downed road walkers** go over in the first quarter of their 2 s, lie still, and fade over the last
  35%. Crumple, tree and tumble fall away from the shot, face up (the ribs show); fold and kneel pitch
  forward toward the van, face down, as their 3D falls do. The kill dust is 5 small puffs (7 big ones
  hid the fall).
- **Drawn in layers:** splats, the downed walkers' pools and shadows and every walker's shadow or
  frenzy glow go under every body, so nothing on the road ever lies over a walker.
- **God spawns on the road are plain walkers,** like every road walker (no raid or wreck roles there).
- **The title screen** shows every kind, two at a time, changing every 4 s (`SHOWCASE_SECS`), from the
  table; the still garage view keeps walker and runner.

### Judgment calls: building spawns (js/building.js, NOTES[id].walkers)

- **Rules carry the texts' positions.** `NOTES[id].walkers` lists, for each door note, note or
  graffiti that puts walkers somewhere, the rule that keeps it true (`says`, `z` anchors, `zone`, `n`,
  `share`, `exact`, `type`, `only`, `all`, `near`): every building but the water tower has one, the
  lumberyard two. A rule's own tiles are closed to the other walkers, so "one by the robot" stays one.
- **Shares for "most" and "many":** the lumberyard dock and the pharmacy back take `share` 0.55 ("most"
  needs over half; validate-world checks the word against the share), the mall's main hall `n` 4,
  `share` 0.4 ("many"), the hospital `all` in its dark rooms.
- **"One by the X" needs a zone round X:** Signal Electronics' robot and Gas-N-Go's car lift rules are
  `exact` with a zone covering the landmark's surroundings, so no other walker starts within 2 tiles
  of it (validate-world R8 "by", `RULE_BY` 2 steps). Another walker just outside the zone, 3 steps
  off, can still stand as near the landmark as the named one on some visits.
- **A named walker starts by its landmark.** A rule with `near` rings the landmark's footprint
  (`landmarkRect`; `ringFrom` takes the rect), not its z anchor: its walker starts within `r` or
  `walkerSpawn.ring` (3) steps of the footprint, doors shut, inside the zone. The anchor must still sit
  within `walkerSpawn.near` (5) tiles of the landmark and in the zone (validate-world R4), and it still
  marks the rule's room. Over 90 visits a rule every named walker started within 3 tiles (Chebyshev) of
  its landmark; ringing the anchor had put them up to 7 tiles off at Ortiz Auto, 8 at Signal
  Electronics, 6 at the 4th Precinct and 5 at Ridge Lumber. The six `near` rules: the car lift, the
  forklift, the engine crane, the robot, the police bike, the log pile.
- **No walker starts in earshot of the door where there is room.** A sleeping walker wakes within
  `Interior.HEAR` (6 tiles, `HEAR_SPRINT` 9 while you sprint) in a straight line, through walls, and
  `minSteps` (6 steps) along a diagonal is nearer than that. `planWalkers` picks tiles at least `HEAR +
  0.5` tiles from the start in a straight line first (the half: a walker's middle, not its tile's
  edge), at every spacing, and only then nearer floor; the `minSteps` rule stays. A rule with no quiet
  tile left still gets its walker, so the rules (R6) and the door-note counts hold. Over 1,350 visits
  (15 buildings x days 1, 10 and 40 x 30) no visit started a walker within 6 tiles; before, 204 did
  (15%). A balance change toward the spec's "spread out, away from the door". A sprint through the
  door still wakes walkers 6 to 9 tiles off.
- **The danger 4+ brute at the first spot is gone:** police and lumberyard keep theirs by rule; the
  library, hospital and mall get brutes only from their mix.
- **The gun, the pole and the quest objects are placed first,** and no walker starts on a busy tile:
  item, cache, stash, key, scrap and note spots (any reading level), landmark anchors, quest spots (any
  state), the gun and the pole.
- **No "on the anchor itself" fallback:** a taken anchor tile would stack a walker or put it on the gun;
  a rule with no free tile places fewer and the rest keeps the door-note count (validate-world R6 makes
  sure today's layouts always have room).
- **`planWalkers` takes the day** (the mix needs it) and returns data only: nothing new is saved or
  snapshotted, and a rule's tag is not kept on the walker.
- **The alarm's deeper walker** starts more than `ALARM.farFrom` from you on floor that walks to you with
  the doors as they stand (walkers cannot open doors), a free tile first; only when you are shut in a
  small room does it start on floor reachable from the way in through the doors, behind a door; never
  in a locked room. The areas are cached and rebuilt only when a door moves (about 0.45 -> 0.02 ms a
  spawn tick). An alarm brings no `only` kind, and `ALARM.cap` 40 is checked before each spawn.
- **Text claims the engine still does not keep** (out of scope, the texts were not rewritten): pacing
  at the school, auto shop and hardware (walkers stand until they wake); the firehouse's "the others
  wander the back rooms" (close: the truck bay is exact); the garden's "They are not quick" (danger 2
  has runners); Gas-N-Go's decoy note's "the walker in the garage" (the garage below the lift end can
  hold more than one).

### Tests changed on purpose

- validate-engine: a walker within its own bite reach counts as "at the player" (the lanky's 1.25
  tiles, where the tests used 1.2); the practice walker's speed bound reads the table and
  `SPEED_JITTER`; the heavy waves and the siege set `wreckShare` 0 beside `raidShare` 0 (a quarter
  wrecking breaks "16 reach the player"); "a biting walker faces you" runs `max(0.5, pi / turnRate +
  0.1)` s (a brute turns at 4 rad/s); the older governor checks put a crowd on screen first.
- validate-world: the "2+ z tiles" and "z count <= day-1 count" checks gave way to the walker rules
  (R1-R8).
- validate-god: the road stub is `spawnWalkerAhead(type)`; a null return now means no room.
- Review round: validate-engine's "the wave label is only WAVE or HEAVY WAVE" also accepts the
  " · walkers in the cabin" tail, only while a walker stands in the cabin and the player is out of it;
  a digit is still an error. Its spawn loop rings a `near` rule round the landmark, wants that rule's
  walker within `r` tiles of it, and errs on a walker within `Interior.HEAR` of the start (a
  layout-quality check like R6: give the rule's zone room out of earshot). validate-world's R4 and R6
  ring a `near` rule the same way, every ring tile within `r` tiles of the footprint. validate-text
  errs when a crew tip or report has a sentence over the level's Max sentence (other texts warn past
  Max + 3); the 14 crew2 offenders and two pip.radio texts were split, every fact kept.

## Owner decisions: an angled road camera, as a test (2026-10-15)

| Question | Answer |
|----------|--------|
| Top-down or angled? | A test first. On the drive from Home Base to Corner Grocery only, the camera looks down the road from behind and above the van (pitched 30 degrees, zoomed in a little from the first mockup); every other drive stays top-down. |
| How is it drawn? | `js/perspective.js`. The ground keeps the road's own art: it is drawn from above into a few layers and warped onto the screen row by row. Buildings, trees, walkers and the van stand up, drawn far to near. The road sign, the names, the HUD and the minimap stay flat. |

- **Walkers come from the same places.** They appear where they do on a top-down drive (just off that
  screen), so they reach the van as soon as they did; the angled camera sees farther, so they fade in.
  **Assumption:** half a second.
- **A walker right behind the van is see-through,** so it never hides the van.
- **Aim.** A shot leaves the roof gun's barrels and drops to chest height where the pointer is
  (`Persp.AIM_Z`), so on the screen it goes straight at the pointer; hitting stays as on the flat road.
  **Bug fixed on the way:** a new shot took a frame of the van's speed after the camera had moved, so it
  flew a few pixels ahead of the pointer's line on every drive.
- **Walkers and the van stand up in the art the game already has.** Walkers are the interiors' live 3D
  figures at on-foot size, seen from above (since 2026-10-16; at first they were the interiors' standing
  sprites, a little over life size: see "smoother corners and main's walkers" below). The van's walls are the yard van's faces (cab, body with its door and number, the back doors,
  armor, rack and paint from the upgrades), its roof the road's top-down art, and the roof gun stands on it
  (more barrels with Spread Shot, longer with Heavier Rounds) and turns and tips toward the aim.
  Trees are still their top-down drawings on a trunk.
- **Speed.** The ground is on the graphics card (`js/perspective-gl.js`): squares of the road's art,
  each drawn once and kept, laid down through the camera with their smaller copies blended, so the far
  road does not shimmer and turning costs nothing. Without WebGL the ground is warped on the 2D canvas
  each frame instead, without the overgrowth's fine marks, softening itself on a slow computer.

## Owner decisions: the angled drive, overgrown (2026-10-15, later)

| Question | Answer |
|----------|--------|
| What stands up? | Everything by the road: trees (leafy and dead), bushes, tall grass, wrecked cars (wheels, body, cabin, windows, rust), barriers, barrels, road signs with their words facing the van, supply crates, buildings, walkers, the van. |
| How overgrown? | Weeds and grass over all the ground, creeping onto the road's edges and up through cracks in the asphalt (sparse there, so lanes and arrows still read), and plants over all the land the route can see, thickest at the verges. |
| Where do walkers come from? | Far down the road in the haze, and out of the overgrowth at the edges of the view; small at first, they walk in, and only keep up with the van once near it. |
| Faster? | On the angled drive only: the van 25% faster, shots 60% faster (they fly up to 2600 units); walkers come 40% more often, since they are seen from further off. |

- **Nothing is drawn right under the camera.** A walker that close would otherwise cast a shadow over the
  whole screen.
- **A click hits the walker clicked.** The shot is aimed at the walker whose picture is under the pointer, at
  the height clicked, and led: it carries the van's speed and the walker walks on, so it is aimed where the two
  meet. A shot is tested along its whole step each frame (fast shots skipped past an edge) and only below the
  walker's head.
- **Walkers stay outside the van.** One that gets inside its sides is put back out at the nearest side, where it
  presses against the van and hits it. Only one right behind the back doors is see-through.
- **The van parks short of the door** (45 units), so in 3D its nose is not in the wall; the building is kept
  in view by its own middle, not its lot's front, so it stays standing once parked.

## Owner decisions: smoother corners and main's walkers on the angled drive (2026-10-16)

The owner: "The turning still looks a little shaky. The zombies while walking around have been changed. Utilize
that code where possible and implement those zombie changes while driving so that they are consistent." On what is
shaky: "Seems like the frame rate needs to be higher at corners. The turn is almost nauseating." Built in
`js/game.js` (the drive, braking, the lazy camera, the walkers' road logic), `js/perspective.js` (the walkers' pass,
plants, `frameStats`), `js/perspective-gl.js` (ground squares) and two additive options in `js/walker3d.js`.

| Question | Owner's answer |
|----------|----------------|
| Corner speed? | Brake lightly (about 75%): on the angled drive the van slows to 0.75 of its speed into each turn it takes and speeds back up after (`PERSP.brake`). (Since 2026-10-17 that holds up to a right angle; sharper turns brake further, to 0.4 at 135 deg: see "every drive on the angled camera".) |
| Camera in a turn? | Lazy follow: the angled camera turns about half as fast as the van, so the van visibly swings on the screen, and the view catches up gently on the straight after. Target: a peak spin of about 35 deg/s (it was 112 at the junction); built: 37 (53 at Engine Tune 5). |
| Walkers keeping up with the van? | They sprint: their legs go by the ground they really cover, the keep-up carry included, so near the van every kind runs. The hit rate is unchanged. |
| Walker size on the angled drive? | On-foot size: as tall against the van as on foot (the yard van is 0.8 tiles, a walker 0.92), so 62.5 road units a tile (`Persp` `TILE`): a walker 57.5 units, its head 52, the van's roof 50. |
| The rest of the walkers (stated defaults, not objected to) | Main's road behaviour on the angled drive: six kinds, the scream and its frenzy (main's ground glow), blood only with walker gore on, each kind's own fall, fading over about 2 s, health bars at head height, clawing at the van. The top-down drives get main's walkers from the merge and nothing else. |
| Hops and bob (stated defaults) | The one-frame hop where a turn starts and ends, and the van's bob up and down the screen in a turn (23 px), were real bugs on both cameras (main had them too); fixed on both. The new braking and corner camera are the angled drive's only. Everything is tuned to still feel right at Engine Tune 5 (the van 1.7 times faster). |
| Target machine | The owner plays on a Windows PC in Chrome or Edge. The frame budgets (`BUDGET` 7 ms of ground squares, `LIVE_BUDGET_MS` 4 ms of walkers) are guesses for a real graphics card; headless checks run on software WebGL, so their times are pessimistic. `ZSR.Persp.frameStats` and `ZSR.Persp.walkerStats` are there to read on that PC. |

### Judgment calls: the corners

- **The drive runs in fixed short steps** (`DRIVE_STEP` 1/240 s; a frame runs `ceil(dt / DRIVE_STEP)` steps of
  `driveStep()`): the van along its track, the commits at stop lines, turn ends, lane slides, `placeVan` and
  `placeCam`. Walkers, shots and particles still step once a frame. The easings became exact exponentials
  (`EASE`), with rates that keep the old share a frame at 60 fps, so the flat camera feels the same (base to
  hospital: peak yaw 91.9 then 91.8 deg/s, lag 10.6 deg both) and no longer depends on the frame rate.
- **No hop where a turn starts or ends, without a second update.** The part of a step past the stop line is
  rescaled onto the turn path (`van.s = stop + (van.s - stop) / k`), and back at its end, so walkers and shots
  never step twice. Measured at 50 ms frames, Engine Tune 5: 6.5 / 8.7 units before, 0.43 / 0.05 after (what is
  left is the braking's own smooth slowing seen at a coarse frame).
- **No bob.** The camera's sideways offset is laid along the view's own right (`cam = van + right(cam.th) * rel`),
  not the road's normal at the van, so while the view lags the road the van keeps its height on the screen
  (23.6 px of bob before, 0 after; on the flat camera 16.8 to 0). On straights nothing changes.
- **Braking** (angled only; `PERSP.brake` 0.75, `brakeIn` 150, `brakeOut` 300). It starts at the stop line, never
  before (braking earlier would hint which way is right and cut the reading time); it eases down on a smootherstep
  curve to 0.75 where the van's own path starts to bend (over `brakeIn` at least, for a bend that starts at its stop
  line, as the grocery's and every wrong way's do; `brakeIn` is for the slowest van and grows with the van's
  speed, so the ease always takes about 0.5 s), holds round the bend, and eases back up over `brakeOut`. A
  wrong-way turn brakes too, so a turn feels the same either way. The corner factor multiplies the parking brake at
  the door, and a turn committed while the van is still speeding up from the last starts from the speed it has.
  Walkers keeping up and the miles use the braked speed. (As first built `brakeIn` was a fixed 150 units, 0.33 s at
  Engine Tune 5: the grocery's bend and every wrong way braked by up to 2.35% of the speed in a 60 fps frame, 1.47
  times the junction's, past the 2% the test holds; now 1.38% at either engine, the junction's 0.94 to 1.38.)
- **The lazy camera** (angled only; `PERSP.look` 300, `lookRamp` 2, `camW` 2.2/s, `camPace` 0.5). The view aims
  at a point up to `look` ahead on the van's own committed path. Before a stop line it never looks past it and
  shrinks to nothing at the line (it gives no hint which way is right); from the line it grows back at twice the
  van's distance, so the target never jumps. The heading follows on a critically damped spring stepped exactly every
  drive step. Without the look-ahead a 35 deg/s camera would trail the junction by about 55 deg at the arc's end and
  the new road would leave the screen (the far ground's half-view is about 39 deg at 1280 x 800).
- **The spring's clock is time x (speed / slowest speed)^0.5.** Pure time let the bend outrun the view at Engine
  Tune 5 (43.5 deg behind the road, wider than the far half-view); pure distance spun the view 1.7 times faster at
  Engine Tune 5. The square root sits between: there the spin is 1.4 times Engine Tune 0's and the lag 1.2 times.
- **The van's nose eases into a bend** (`PERSP.nose` 50): its drawn heading averages its path's direction 50 units
  behind and ahead (the part ahead closes at a stop line). With the slow view the van's instant yaw step at the arc
  ends read as a snap (about 950 deg/s2 on the screen); now 285. The drawn nose is up to about 8 deg off its path
  at Engine Tune 0 and 12 at Engine Tune 5: the averaging alone puts it up to about 3.5 deg off, and the van's own
  heading easing (`EASE.van`, as on 928ad4f, which gave 8 and 14) the rest. That easing is what keeps the yaw from
  snapping (without it on the angled camera, 285 rises to 723 deg/s2), so it stays. Hit tests, the push-out box and
  parking read the same heading and still pass. The angled camera's sideways pan
  through a turn uses smootherstep (no acceleration steps); the flat camera keeps smoothstep.
- **Lighter turn frames** (`js/perspective-gl.js`). A turn wants about twice a straight's new ground squares, and
  they came in bursts that overran the budget by a square. The budget is now cost-aware (a running mean of each
  size's cost decides whether the next fits; the frame's first square and one haze hole near the van always go).
  (Since 2026-10-17 the views ahead share the frame's one work list and `KEEP` is a floor under `keepFor`: see the
  scenery's judgment calls below.) With time to spare (up to `AHEAD_BUDGET` 4 ms) the squares the view will need 0.35, 0.7 and 1.1 s on are drawn
  ahead: `Game.viewsAhead` runs the camera's spring forward along the committed path (never past a stop line the van
  has not crossed); only squares with no copy at all, and never pushing off one used in the last 30 frames. A square
  the views ahead need that is on the card already is kept fresh (as of the frame before, so on a tie the squares on
  the screen outlast it): before that, squares drawn ahead went stale, were pushed off and drawn again (squares made
  over the grocery drive at 1280 x 800, with a graphics card's costs: 2,826 before, 2,562 after, against 2,547
  without drawing ahead; made twice, 400 before, 136 after). `KEEP` rose from 300 to 360. A view needs about 190 to
  250 squares on a 16:9 or 16:10 window, 320 at 21:9 and more than 360 at 32:9; a view that needs more than `KEEP`
  keeps all its own and `SPARE` (48) more, so a 32:9 screen (5120 x 1300) no longer pushes off squares in use every
  frame (19,738 squares made over the drive before, 7,011 after, about 300 MB on the card).
- **A lost graphics context comes back.** If the browser loses the card (a driver reset, a crashed or switched
  graphics process), the ground falls back to the 2D warp as before; when the browser gives it back, the card's
  program is set up again and every square drawn anew, as at a drive's start (it used to stay on the slower 2D
  ground until a reload: draw 23 ms against 13 on software WebGL).
- **Plants** (since 2026-10-17 made a square at a time as the view reaches it: see the scenery below) are filed in
  512-unit squares (`VEG_CELL`) and only those under the view are visited; they are culled
  at 40 px past the screen plus their own height (it was 300 px) and dropped when wholly in the haze: a quarter fewer
  listed a frame, none on the screen lost. Props, walkers and the van keep the 300 px margin.
- **`ZSR.Persp.frameStats`** = `{ ms, groundMs, worldMs, walkersMs, squaresMade }` every angled frame: the whole
  road draw, the ground, everything standing on it, the walkers' share of that (their renders and pictures, as
  `walkerStats.ms`) and the ground squares drawn.
- **Open:** the grocery's bend starts at its stop line, so no look-ahead can help there; at Engine Tune 5 points 300
  to 600 ahead stay at least 172 px inside the screen but points 900 ahead come within about 30 px of its edge (a
  stiffer spring for such bends would help if the owner finds it tight). The parking brake at the door
  (`sqrt(left / 260)`, both cameras, older) still starts with a step in deceleration (up to about 500 units/s2 at
  Engine Tune 5).

### Judgment calls: the walkers on the angled drive

- **The interiors' code, reused.** `Walker3D.draw`, `box`, `stride`, each look's `gait` (`turnRate`, `clawRate`),
  its pose envelope (`env`) and `build.shadow`; `POSE_BLEND`, `COLLAPSE_SECS`, `FADE_SECS`, `FALL_SECS`,
  `FOG_STEPS` and `gore()`; Walker3D's own `bloodDrop` and `bloodSplat` sprites; the interiors' governor rows and
  waits (`ZSR.Interior.LIVE_LEVELS`, `LIVE_START`, `GOV_WAIT`, `GOV_WAIT_UP`, `GOV_BACKOFF`, `GOV_FAST`,
  `QUALITY_WAIT`, `NEAR_STICK`, `LIVE_STEP`, `LIVE_SPARE`, `LIVE_IDLE`, `LIVE_SHRINK`, `LOD_PX`, `TURN_RATE`) and
  their picture signature (`sameSig` / `saveSig`); main's road logic (`addZombie`, scream and frenzy, `blood()`'s
  counts, `killZombie`, `fallen`, the frenzy glow's colours, the health bar's width). `js/interior.js` only gained
  exports; its own behaviour is unchanged.
- **Seen from above.** Walker3D's level camera is put where the road camera looks from: its eye is the road
  camera's height over the walker for its distance, and its distance the camera's own depth along the bearing, so
  the figure's inner perspective is the pitched camera's (`Persp.liveGeo`). Beside the van that is eye 8.4 and
  distance 7.9 tiles (47 deg down); 600 ahead, 6.2 and 17 (20 deg). The figure faces its own way in the world (see
  "Heading and legs") and is turned for the camera's real bearing to it, so a lagging view through a turn shows each
  walker from where the camera really is.
- **Three engine options, not engine changes** (`js/walker3d.js` header): `cam.floor` (room under the feet; a part
  nearer the camera goes down to the floor under itself, a lying body keeps its perspective past 3 tiles),
  `cam.shadow: false` (no contact shadow; the pool stays) and `st.run` (0 to 1: the gait goes over to a sprint; see
  "Heading and legs"). Left out they change nothing: 24,192 draws (6 kinds, 168 cameras, every pose, falls, detail
  levels, fog, hit and gore) made the same calls as before, and the old `tests/validate-art.js` passes unchanged
  against the new engine; `st.run` 0 draws call for call as no `st.run` (validate-art section S), and a type's own
  envelope (`env`) is unchanged, so the interiors' walkers are sized exactly as before.
- **The picture.** One pooled canvas per walker and per downed walker, drawn again only when it looks different
  (the interiors' signature, plus the look-down angle in 1/64 rad and the figure's own perspective in 1/16 log
  steps, plus the interiors' size rule), at the device's pixels (up to dpr 2) under the row's scale and largest
  picture. It goes up as wide as a tile is at its feet and as tall as the camera shows its box, leaning half the
  camera's upright lines (`LEAN` 0.5, as the plants do). Its region comes from the look's envelope with the sprint in
  it (`envRun`, and the box widened to `wRun`: up to 5% wider), so every pose, running or not, draws at full size
  and nothing pulses.
- **One shadow, one pool.** The road lays one flat shadow under each walker (Walker3D's size, 0.32 dark), or after a
  scream main's frenzy glow (red, amber with gore off). The pool under a downed walker is the figure's own (gore
  only); a body gets a flat shadow that follows it over and fades once, over `FADE_SECS` at the end of
  `FALL_SECS`, as on foot.
- **Heading and legs.** As on foot (`Interior.animWalker`), a walker faces where it is going: its ground motion,
  the keep-up carry included, smoothed the same way (6 a second), once that is over 0.15 tiles a second; it faces
  the van while it claws or screams at it, and (left as built until the owner decides; see Open) while the van
  carries it away from the van, as a walker ahead is carried. It turns at its look's `turnRate`, so it never snaps
  as the van goes by or a shot throws it back. (As first built every walker faced the van, so one beside or behind
  it, carried forward with the van, slid its feet sideways at 200 to 250 units a second, the biggest figures on the
  screen. On the drive's own walkers at Engine Tune 0, beside the van: 217 before, 5 after (median; 253 and 15 at
  the 90th percentile); behind it: 68 before, 3 after (201 and 11). What is left is a walker the van overtakes
  turning round (see Open): with ten walkers kept ahead, or at Engine Tune 5, the median beside the van is 6 to 17
  but the 90th percentile 270 to 465.) Its legs go by the ground it covers, and it runs: from its
  kind's own walking pace (`WORLD.WALKER_TYPES` speed) its gait goes over to a sprint (Walker3D `st.run`, all the
  way at three times that pace: `RUN_FROM` 1, `RUN_SPAN` 2), longer strides with both feet off the ground between
  them and a harder lean (the runner's own gait: stride 1.5, duty 0.38, lift 0.11, crouch 0.08, lean 0.55, bob
  0.02), and its gait advances over the stride it has at that pace, so the feet stay planted. A claw or a scream
  (feet set) eases the run out. A plain walker keeping up beside the van takes about 5.3 steps a second at Engine
  Tune 0 and 8 at Engine Tune 5 (two steps a gait cycle). As first built the gait stayed the walk's at any pace,
  about 8.7 steps a second and 12 to 14, a flailing walk (the "about 4 and 7" written here then counted gait
  cycles, not steps). The runner's own gait already is the sprint, so it only goes faster. Through a corner the van
  brakes and the keep-up carry with it, so the legs slow with it.
- **Poses.** `scream` while it yells; `claw` (its look's `clawRate`) while it presses on the van or for 0.4 s after
  hitting it (`CLAW_HOLD`); `walk` otherwise; eased in and out over `POSE_BLEND` as `Interior.animWalker` does. No
  bite on the road. A killing hit's flash carries on to the body.
- **Falls.** Each kind its own Walker3D fall over `COLLAPSE_SECS` (0.9 s, the on-foot speed; main's flat road tips
  in 0.5 s), from its heading, legs and pose at death (`Persp.fallFrom`, stored in the fallen record on the angled
  drive only): crumple, tree and tumble fall away from the shot; fold and kneel pitch forward.
- **Blood in the air.** A hit's spray starts at the hit (the nearest point of the shot's swept step) at the shot's
  height (a ram's at the chest). Main's counts, but one drop in three splashes back toward the shot, as on foot,
  since the camera is behind the van and the body hides the rest. Drops fall at `BLOOD_FALL` (5 tiles/s2, on foot's)
  and land as splats; they are Walker3D's sprites, depth-sorted with everything standing. Sparks fly at the shot's
  height. The flat drives are unchanged.
- **Health bars** level, just above the look's head top, 2 r wide, drawn with the walker in depth order.
- **Night.** Walker3D's fog darkens a walker toward black with distance and only the last 12% fades out; by day
  walkers fade into the haze with the ground. The 0.5 s fade-in and the see-through walker behind the van's back
  doors stay.
- **Over the sign** (`drawOverSign`): this frame's pictures again (no new render), bodies and health bars only.
- **Bodies the van drives onto lie under it.** A body is sorted by its feet and the van by its middle, so one the
  van had driven over was drawn across its roof for about 0.15 to 0.25 s. A body whose feet, or the far end of it
  lying there (as its shadow is laid), are inside the van's box (10 units spare) is now drawn just before the van,
  as main's flat road lays its fallen under everything standing. Rare on today's drives (1 body in 50); common with
  a crowd kept ahead (8 of 22 at Engine Tune 0), which a game-wide angled camera would bring.
- **Two governors that never fight.** The walkers' governor steps through the interiors' rows on the walkers' own
  time (renders and pictures against `LIVE_BUDGET_MS` 4, smoothed); it never reads or moves `Persp.res`. The ground
  keeps its own budget (`BUDGET` 7 ms of squares, drawing ahead only with time left in that budget), and `pace`
  softens the 2D ground (no WebGL) on its own draw time. On a slow machine each can step down for its own cost;
  neither makes the other slower. The near walkers (the row's `near` nearest) draw every frame they look
  different; a turn changes every walker's bearing, so the far ones take turns (`far` frames apart), as indoors.
  A frame that draws no picture anew (the road paused under a card, a note, the backpack or the menu, which still
  draws every frame) is not counted, as indoors (`Interior.governLive`): it used to count as a fast frame, so a
  long pause climbed the governor back up two rows, to step down again over about 2.4 s a row once driving.
- **Measured** (headless Chromium, software WebGL, 1280 x 720, 60 fps stepped by hand, interleaved A/B against the
  merge's stopgap): 25 walkers on screen, walker time 11.0 ms a frame (median) before, 5.9 after; Walker3D renders
  a frame 28 before, 10 after; the whole draw 26.7 ms before, 20.9 after. The drive's own spawns (about 5 walkers):
  1.9 ms before, 1.3 after. At dpr 2 the pictures have four times the pixels for about the same cost (11.7 and
  10.9 ms).
- **Open:** walkers ahead of the van face it while the keep-up carry moves them away from it, so their feet slide
  (facing their ground motion instead is one condition in `Persp.animate`, if the owner prefers it). Because of
  that, a walker the van overtakes turns round from facing the van to facing forward, over about half a second,
  and slides its feet while it turns. Main's frenzy glow
  is large near the camera, where several overlap into one red patch. The see-through walkers right behind the
  van's back doors read as ghosts when several crowd there. `LIVE_BUDGET_MS` is a guess for a real graphics card:
  check `ZSR.Persp.walkerStats` in Chrome or Edge on the owner's PC.

### Tests added (2026-10-16)

- **`tests/validate-drive.js` "turns"** (both cameras): no hop where a turn starts or ends (base to grocery
  angled, base to hospital flat; Engine Tune 0 and 5; 16.7, 33 and 50 ms frames; three frame phases): each step is
  what the mean of the speeds at the frame's two ends says, within 0.3 units (measured 0.02; the old hop 6.9), so
  the corner braking's own slowing, or a re-tune of it, is never read as a hop (a step against its neighbours read
  0.43 at a 0.75 brake and failed at 0.65 with no hop there); the van keeps its screen height within 2 px through
  every turn (measured 0.0); the angled van brakes to 0.75 (within 0.02) through the junction and through a wrong
  way (the first decision at Engine Tune 0, the last at 5), never before a stop line, never by more than 2% of its
  speed in a 60 fps frame (measured 1.38% at either engine, wrong ways and the grocery's bend included; only the
  older brake into a parking spot or a dead end, its last 262 units, is left out), and the flat camera never
  brakes; the angled view's peak spin under 45 / 65 deg/s (37 / 53), spin acceleration under 300 deg/s2 (71 /
  141), lag under 35 / 38 deg (25 / 31) at Engine Tune 0 / 5, back within 2 deg of the road 4 s after the turn;
  uneven frames (16, 33, 16, 50 ms) put the view within 0.2 deg of steady 60 fps (0.003). Main's code fails 8 of
  these.
- **`tests/validate-drive.js` "persp draw"**: whole angled frames on a recording 2D context (no WebGL): all six
  kinds, a scream and its frenzy, clawing, hurt walkers, kills and downed bodies, gore on and off (night on the
  second pass). No exceptions or NaN, every kind and pose drawn by Walker3D, the glow and health bars there, blood
  only with gore on, over the sign only this frame's pictures with no shadow or glow, a body under the van (its
  feet behind the van's middle, or lying back under it) drawn before the van, 600 paused frames leaving the walkers'
  governor's row and time as they were, and `walkerStats` and `frameStats` (with the walkers' share inside the
  world's) filled in. Its script list loads the draw files in page order (`SCALE:`: a new looks file goes in it).
- **`tests/validate-drive.js` "persp feet"**: every kind put beside and behind the van, out of its reach, at
  Engine Tune 0 and 5: walking, their feet slide under 30 units a second against the way they face (90th
  percentile; measured 8 and 11, first built 211 and 320); a plain walker keeping up beside the van runs (`st.run`
  over 0.5) at 3 to 7 steps a second at Engine Tune 0 and 3 to 9.5 at 5 (measured 5.3 and 8.1; first built 10.3
  and 16).
- **`tests/validate-drive.js` "persp ground"** (`js/perspective-gl.js` on a stub WebGL context, squares made on a
  clock charging a graphics card's 1.5, 0.8 and 0.4 ms): over the grocery drive fewer than 10% of the squares made
  are made again (measured 7.0%; 17.7% before the draw-ahead kept its squares fresh), no square in use is pushed
  off; a view of 1,200 squares (more than `KEEP`) keeps them all; after the context is lost and given back the
  card is used again with every square drawn anew.
- **`tests/validate-art.js`** section R checks 6,480 road-camera figures (eyes 5, 7 and 9 tiles, distances 2 to
  70), running and clawing out of a run among them: inside the region, finite, within the call ceilings, every
  pose at full size, the ankles where that camera puts them, no shadow of their own, the pool still there; section
  S checks that 600 draws with the new options set to off (`st.run` 0 among them) match the plain draws call for
  call; section G checks the run cycle's limbs move smoothly too.

### Checked together (2026-10-16)

The corners and the walkers were built side by side and merged. Driven together in headless Chromium (software
WebGL, 1280 x 800, one fixed 1/60 s step and one draw a frame, a careful driver on the keys, seeded), the merge's
starting point (main's walkers on the old corners, drawn by a stopgap) and the merged build run side by side under
the same load. Draw ms, median / 95th percentile:

| Drive | Phase | Before | After |
|-------|-------|--------|-------|
| Own spawns, Engine Tune 0 | straight | 15.4 / 30.2 | 15.3 / 23.7 |
| | junction turn | 15.3 / 26.3 | 13.1 / 21.6 |
| | grocery bend | 15.2 / 23.3 | 11.3 / 18.7 |
| 10 walkers kept ahead, Engine Tune 0 | straight | 15.8 / 29.5 | 16.1 / 27.2 |
| | junction turn | 21.0 / 35.4 | 18.6 / 30.0 |
| | grocery bend | 16.8 / 31.5 | 13.7 / 23.1 |
| Own spawns, Engine Tune 5 | straight | 15.2 / 25.0 | 15.7 / 25.6 |
| | junction turn | 19.0 / 33.1 | 13.9 / 26.7 |

- The junction's peak spin went from 112 to 37 deg/s (159 to 53 at Engine Tune 5), and the turn frames are no
  heavier than the straight's with the drive's own walkers. With a crowd the turn still costs about 2.5 ms more than
  the straight: the walkers catch up with the braking van, so more of them stand big beside it (their renders a
  frame do not rise; their pictures going up do). On a graphics card those blits are far cheaper; `frameStats`
  splits a frame into ground, world and walkers to check that on the owner's PC.
- No page errors. The walkers read right while the view lags the van through a turn (each is drawn for the
  camera's real bearing to it); clicking walkers mid-turn hits 32 of 32 at Engine Tune 0 and 5.
- Seen in passing, left for the owner: a downed walker the van leaves behind comes toward the camera and its
  picture grows (up to about 300 x 900 px) until it is too near to draw (`NEAR_PX`), and costs about 1 to 2 ms a
  frame (software canvas) while it lasts.

## Owner decisions: every drive on the angled camera (2026-10-17)

After the one-drive test the owner said: "This should be the way all driving happens." The questions below were put
to the owner on 2026-10-16 and 2026-10-17. This drop builds the corners, each place's own building and scenery that
holds up on every route. Every check in the first three parts ran with every route put on the angled camera in
memory; a later drop the same day took the top-down road camera out (`PERSP_ROUTES` with it), so every drive now
uses the angled camera ("The flat camera taken out" below).

| Question | Owner's answer |
|----------|----------------|
| Which drives use the angled camera? | All of them. The top-down road camera goes entirely: no setting and no fallback. A machine without WebGL uses the angled view's own 2D ground. A slow machine gets a scenery governor (thinner scenery), never the flat camera. |
| Walkers ahead of the van? | No keep-up pull in front: they walk at the van with their feet planted. Beside and behind the van they still sprint to keep up. Spawns go up so encounters stay about the same. |
| The test's feel on every route? | Yes: pace 1.25, bullets 1.6 times as fast, the longer range and the click-pick auto-lead. Spawns are rebalanced per danger level, so each route's difficulty (walkers met, hits taken, deaths, scrap) matches today's top-down game. |
| Sharp corners? | Reshape the corners (stop line further back, wider arcs) and brake by sharpness, down to about 40% at the sharpest turn (133 deg). The owner was promised: the worst corner spins the camera about 43 deg/s (64 at Engine Tune 5), the road ahead stays on the screen, and trips are about 1.5% longer. Home Base to Corner Grocery stays exactly as tested (37 / 53 deg/s). |
| Places on the road? | Each place gets its own 3D building: the cabin for Home Base, and a water tower that is the tallest thing around and seen from far off (the story calls it "the tallest thing for miles", with Jo's antenna on top). Also a gas canopy on posts with pumps, the school, hospital, police station, firehouse and mall, stores with their own fronts and signs, and River Landing's dock standing up. |
| Night? | Between the old look and today's. The headlight beam turns with the van and reaches about halfway between the old view's reach (about 520 units ahead) and today's (to the haze). |
| Click-pick auto-lead? | It stays. |
| Stated defaults, not objected to | The Water Tower's drive and lot moved out of the river (a geometry bug, also on main). Buildings block walkers. The title screen and the garage preview use the angled look. Side-street ends (barricades, dead-end rails, gate rails) stand up. Name boards fade with the haze and keep clear of the HUD. The minimap fades only for lots actually in view. Fog thickens with distance. Half-screen and narrow windows get a wider view. The rule "no new walkers near the door" is counted in seconds. The drive starts seamlessly, with no visible stall. God mode gets an FPS toggle. |

**Built in this drop:**
- the corners;
- each place's building, with the side-street ends, the dock and the name boards standing up;
- the Water Tower moved out of the river;
- the wider view on narrow windows;
- the scenery governor;
- the seamless start;
- scenery that scales to every route.

**Built later the same day** ("The flat camera taken out" below):
- the top-down camera removed, and with it `PERSP_ROUTES`;
- the night beam;
- the angled title screen and garage preview;
- the minimap's fade;
- fog that thickens with distance;
- the FPS toggle.

**Built last** ("Walkers and balance" below):
- the walkers ahead of the van, and none riding its nose;
- buildings and the river blocking walkers;
- the spawn rebalance, by danger and day;
- the door's spawn rule in seconds;
- the road in 1/60 s steps, so a slow machine plays at full speed down to 10 frames a second.

### Judgment calls: the corners (js/streets.js, js/game.js)

- **The rule comes from the turn, not from a threshold.** `Streets.cornerSpin` is a small model of the angled camera
  (its look-ahead, its spring and the brake). It predicts the view's peak spin from a turn's angle, its arc, the
  straight before the bend and the van's speed. On the city's turns the real camera turns at 0.91 to 1.13 times the
  model's peak, so the model carries a safety factor (`CAM.fit` 1.1). A corner whose turns all stay under the comfort
  target (`COMFORT.spin` 43 deg/s at Engine Tune 0, 64 at 5, times `COMFORT.design` 0.98) keeps today's shape exactly.
  Home Base to Corner Grocery is left alone because its turns are already comfortable (37.4 / 52.9 deg/s), not
  because of a special case. `Streets.CAM` mirrors `PERSP` and the fastest van, and validate-drive checks that they
  match.
- **An uncomfortable corner's stop line moves back** as far as its turns need, up to `GEOM.backMax` (1100) or the
  road's room. The van then takes the widest arc that keeps its whole width (`GEOM.vanHalf` 33) on the paving, with
  the rest as straight road before the bend. No arc is ever tighter than it was. **This differs from the work item as
  written:** a turn that was already comfortable keeps today's arc exactly, and a stop line further back only adds
  straight road before it. Filling the extra room instead turned gentle drive turns into 6.6-second drifts that
  started 800 units early (police to Gas-N-Go, a 52 deg turn on an arc of radius 1699).
- **Right-way turns too sharp for the old 140-unit arc** rejoin the next road on the smallest comfortable arc, up to
  the widest the paving holds. The next road's lanes begin a little later to make room, but never shorter than their
  time (`winMin` for a junction; side streets as below).
- **Braking by sharpness** (angled only): 0.75 of the van's speed into any turn up to a right angle, then down to 0.4
  at 135 deg (0.416 at the city's sharpest, 132.9). Where a road is too short for its corner's comfortable shape the
  van brakes further (`Streets.brakeFor`, never under `minBrake` 0.3). Braking still starts at the stop line, never
  before. On a long straight to a sharp bend the van keeps its speed past the line and brakes over at most twice its
  ease (`brakeSpan`). A deeper brake eases in and out over more road, so no frame changes the speed by more than the
  old light brake did (1.46% a frame at most, limit 2%). Braking is set by the angle alone on all but 9 right-way
  turns (6 at Engine Tune 5). Those brake a little more because their road is short (the Frog Lane corner out of
  River Landing).
- **Side streets (the wrong turns into them):** their stop lines move back too (up to 310 units at Engine Tune 0, 356
  at 5), but only within the lane time each street already had, never under `winFirst` (3.5 s) and never under what
  it had. Braking (0.33 to 0.58) does the rest. The narrow paving (`sideHalf` 100 plus the shoulder) caps the arc at
  radius 141. Result: 42.5 / 58 deg/s (it was 60.3 / 80.7), lag 26 deg (it was 52 / 59).
- **The Water Tower faces up the bank.** Its drive and lot lay in the river on every route, on both cameras. A
  place's drive still points down the middle of the widest gap between its roads, unless that drive would come within
  `GEOM.riverClear` (60 px) of the river's bank. "That drive" means the drive at its longest: slowest van, smallest
  scale, furthest stop line, plus its lot. In that case the drive takes the direction with the most room to its roads
  that stays dry. Only the Water Tower changes: its drive now heads -105 deg (north by north-west, up the bank)
  instead of 192 deg (west, into the river). Its lot keeps at least 300 px from the bank on every route at every
  speed. The city map draws the new drive too.
- **One river.** Its course is `Streets.RIVER`, the only copy. The road (`Draw.riverBand`) and the city map
  (`js/map.js`) both draw it. Drives and lots keep out of it. `Draw.inRiver(x, y, margin, scale)` and
  `Draw.riverEdge(x, y, scale)` (js/sprites.js) tell what grows or stands by the road where the water is.
- **Narrow windows see wider** (`Persp.minAspect` 1.25, `Persp.maxFov` 90): a window narrower than 1.25 to 1 gets
  the view that a 1.25 window would have across. A 960 x 1040 window now sees 76 deg tall (it was 60). 1280 x 800,
  1280 x 720 and 1920 x 1080 are unchanged to the bit. Portrait phones stop at 90 deg tall; nobody has decided about
  phones yet.
- **A late lane change:** a lane slide still going when the van crosses a stop line into a turn now slows smoothly
  onto the turn's path (`SLIDE_STOP` 3000 px/s2, harder only at the road's edge), and the camera keeps to the path,
  not to the slide. The step change at the line went from 5.01 to 0.34 units.
- **A slight turn from a lane's edge** (under 30 deg, `EASE_MAX`) uses the lane path's easing curve where that is
  gentler than the tight arc that fits there.
- **Measured** (every route angled, a careful driver centred in its lane, 60 fps, before and after; Engine Tune 0 |
  5). Across all 1048 right-way turns:

  | | before (e0) | after (e0) | before (e5) | after (e5) |
  |---|---|---|---|---|
  | peak spin, deg/s (max / p95 / median) | 85.1 / 66.4 / 26.1 | 42 / 41.1 / 23.8 | 115.7 / 92.5 / 37 | 59.6 / 58.9 / 35.1 |
  | spin acceleration, deg/s2 (max) | 176 | 83 | 418 | 165 |
  | lag behind the van, deg (max) | 62.1 | 25.1 | 75.1 | 31 |
  | turns over 45 / 65 deg/s | 270 | 0 | 245 | 0 |

  - **The road on the screen after the bend:** before, the road 300-1500 units ahead left the screen at 25 turns
    (115 at Engine Tune 5) at 1280 x 800 and at 140 (352) at 960 x 1040. Now it never does.
  - **Time in a bend:** the sharpest bends (120 deg and up) now take up to 3.7 s at Engine Tune 0 at 42% speed (they
    took 2.2 s). The van starts its bend up to about 1.1 s earlier.
  - **Trip time:** trips are 1.66% longer over all 544 drives (the owner was told about 1.5%). Most of it is six
    places whose first turn out is sharp (Gas-N-Go, Reyes Hardware, Mile 9 Pharmacy, Signal Electronics, 4th Precinct,
    Station 12): their own drives are 242-463 px longer, and the van drives the same drive in.
  - **Paving:** a van centred in its lane keeps at least 4 units on the paving through every turn. The tightest arc
    anywhere is now 108 (it was 99).
  - **Signs:** the shortest time a sign is up rose from 4.26 to 4.76 s.
- **Open:**
  - **Trips are 1.66% longer**, against the 1.5% the owner was told.
  - **The sharpest corners take 3-3.7 s at Engine Tune 0** (worth showing the owner).
  - **The first long drive of a fresh session builds up to about 60 ms longer.** A corner's shape is worked out once
    per corner, way in and van speed, then reused. Later new routes add 5-15 ms. Warming the drives from the map
    screen would hide it.
  - **Side-street wrong turns stay comfortable mostly by braking.** A wider arc would need a paved flare where the side
    street meets the road.

### Judgment calls: each place's building (js/perspective-buildings.js)

- **A building is a row of parts in its lot's own frame** (`ZSR.PerspBuild.ROWS`, keyed by place id: X runs right as
  the van drives in, V into the lot, Z up). The parts are:
  - boxes, with windows, doors and signs laid on their walls (a perspective-correct map per wall);
  - gable and sloped roofs, posts and beams;
  - round tanks, a dome, logs and glass houses;
  - the interiors' landmark pictures (js/landmarks1.js, landmarks2.js) standing about as props.

  The style is comic ink like the van and the wrecks: flat faces lit from the upper left, inked edges, line width set
  by distance. A place without a row falls back to the old plain box.
- **The front wall stays where it was** (lot v0 + 168), so parking still stops 42-47 units short of it (`parkShort`
  45). Nothing low stands where the van parks. At Ortiz Auto and River Landing, the places with one road, nothing
  stands across the road in front of the wall. Everything stays inside its lot, except River Landing's dock (out over
  the water) and its sign post by the road, as in the flat art.
- **Far off, a building loses detail:** under `DETAIL_PX` (70 px across) only its masses are drawn, and under
  `PROP_PX` (170 px) its props, railings, ladders and shingle lines go. **It fades into the haze by colour, not by
  see-through faces.** Its colours mix toward the haze's in 20 cached steps as the world's fade drops, so parts never
  show through each other.
- **A landmark becomes a silhouette, never nothing** (`landmark: true`: the Water Tower). Past the haze's far edge it
  is drawn as a silhouette standing on that edge, sized for its true distance and paling into the haze out to
  `LANDMARK_SEEN` (2.4) times `Persp.cfg.far`. Its antenna light blinks red at night.
- **The tower's height is limited by the camera.** The angled view's top edge is level, so nothing higher than the
  camera can ever be seen. The camera stands 0.447 x window height / zoom: 357 units at 1280 x 800, about 340 on small
  windows, 483 at 1920 x 1080. The antenna tip stands at `TOWER_TOP` (352): the tank at 190-274, its roof to 304,
  trees at 150-240 and every other building under 265. So the tower is clearly the tallest thing and shows whole.
- **The places' names are painted on their buildings' signs.** Each sign is a texture cached by its words and size.
  A sign shows the place's name only once the place is known; before that it is blank and the "?" board shows. While
  the painted words are smaller on the screen than the road's name board would be, the flat name board stands on the
  sign's spot instead, and gives way quickly as the words grow. Boards fade with their building and are left out once
  it has faded under `NAME_FADE` (0.2). A board that would overlap a box in the HUD's top row (`Game.hudRects().boxes`)
  moves down just under it.
- **The draw order with buildings.** Each frame, each building in view orders its parts for the camera: a
  topological order from the wall planes between parts that overlap on the screen, then explicit `after` (a roof on
  its walls), then farthest first. Anything within `NEAR` (420 units) of a building's parts is then placed against the
  parts it overlaps on the screen: before all of them, after all of them, or between two (a walker under the gas
  canopy, or between the tower's legs). This covers walkers, the downed, plants, props, crates, sparks, the van and
  the side-street ends. A thing in front of one part and behind another goes where the least overlap is drawn wrong.
  A walker inside a footprint is drawn hidden behind the walls (walkers are not yet kept out of buildings;
  `PerspBuild.solids(lot)` gives the solid parts' corners for that).
- **The angled ground leaves out what stands up.** `Draw.cityRoads(..., view)` skips the side streets' flat ends when
  `view.standing` is set. `Draw.lot(ctx, lot, G, look, opts)` with `opts.standing` skips the building seen from above,
  the gas canopy, the door and River Landing's flat dock. `surface`, `stripes` and `extra` give each lot its own
  ground: the cabin's dirt yard, gravel at Greenhouse Row and the Water Tower, dirt at Ridge Lumber, oil stains at
  Ortiz Auto, a pale pad under the gas canopy. The flat camera's art is unchanged. The card's squares key on this
  (`Persp.groundKey()` = `PerspBuild.GROUND_KEY`): change the key when the ground's pieces change.
- **Side streets' ends stand up**, built from the drive's own side streets:
  - **closed road:** two striped barricades on A-frame legs, just past the end of the paving, with a cone at each
    side;
  - **dead end:** a striped guard rail on posts;
  - **no through road:** a gate rail between two posts.
- **Signs on walls are drawn in the picture's own pixels** through each strip's map. Drawn into a unit square
  instead, as `Persp.texWall` still does for the van's walls and the road sign boards, Chromium blurred and clipped
  them at small sizes ("EMERGENCY" read "[MERGENC]").
- **Each place's building** (and the art it reuses):

  | Place | Building | Art reused |
  |-------|----------|------------|
  | Home Base | The Hollis cabin: cream lap siding, white trim, sage shutters, the red door under a little porch, a slate gable roof with an attic window, a stone chimney, firewood, a rain barrel, a dirt yard, and June's hand-painted HOME BASE sign on two posts | houseart.js colours |
  | Gas-N-Go | A shop with a red band (ICE · SNACKS) and Ruby's red R by the door; a canopy on four posts over two pump islands; the tall GAS price sign on its pole; a pale pad under the canopy | iceMachine, vending |
  | Corner Grocery | A brick store with its name on the parapet, a green-and-white scalloped awning, posters in the windows, fruit stands | cartPile |
  | Reyes Hardware | A tan big-box with an orange band (TOOLS · PAINT · LUMBER · GARDEN), a roof sign, a loading door, lumber bundles | toiletStack, ladder |
  | Mile 9 Pharmacy | A white store with a green band and a green cross on a pole by the road | toothbrush, pillBottle |
  | Ortiz Auto | A corrugated steel garage, one bay open on the car lift, roll doors, a yellow sign, oil stains | carLift, tireStack, drums |
  | Signal Electronics | A dark store with a blue band, its name and a lightning bolt, box TVs behind the glass, a lattice mast and a dish on the roof | tvWall, satDish, robotMascot |
  | Greenhouse Row | Three glass greenhouses with beds seen inside, and the name on a gate over the way in | scarecrow, palmTree, gnome |
  | 4th Precinct | Two storeys of pale stone, a columned porch up two steps with the name on its beam, blue lamps, a flag | motorcycle |
  | Lincoln Middle School | A long brick school, a white entrance with a gable, a clock and the name, a flag | lionStatue |
  | Station 12 | Red brick, a STATION 12 band, one bay open on the fire truck, a hose tower | fireTruck, dalmatian |
  | St. Anne Annex | Three storeys with the name across the front, a glass lobby under the EMERGENCY canopy, a red cross on the roof | wheelchairs |
  | Water Tower | A pump building with the name over its door, four leaning braced legs, a ladder, a round tank with a blue band and a pointed roof, a catwalk and rail, and Jo's antenna with three guy wires and a red light | (all built) |
  | Ridge Lumber | An office with a green roof, an open pole shed over lumber stacks with RIDGE LUMBER along it, a log pile, a dirt yard | forklift |
  | Northgate Mall | A lot-wide beige and purple building, a glass atrium, a raised name sign, SHOES and TOYS anchor fronts | cartPile |
  | Public Library | Stone, arched windows, four columns up the steps, the name under a pediment, a copper-green dome with a lantern | (none) |
  | River Landing | Log stops across the road, the dock on pilings over the water, a sign post with RIVER LANDING | (none) |

- **Measured** (headless, SwiftShader, 1280 x 800: compare these, do not read them as a real PC's times):
  - **One building, JS side:** 0.03-1.1 ms approaching, 0.6-1.8 ms parked (Greenhouse Row costs the most). The plain
    box cost 0.01-0.02 ms.
  - **Whole frame against the plain box:** +0.2 to +0.3 ms parked. Approaching, it is within the noise.
  - **Sorting:** about 0.1 ms a frame.
  - **Parts:** 4 to 18 per building.

### Judgment calls: the scenery (js/perspective-art.js, js/perspective.js, js/perspective-gl.js)

- **Plants are seeded by place, not by route** (`vegLayout`). Every 120 x 120 world cell (`VEG_STEP`) has one
  candidate spot, seeded by the cell itself. A 512 square (`VEG_CELL`) takes the spots that fall inside it, so
  squares made apart meet without a seam, density is exactly as before, and a square made again is identical.
  **Caveat:** a drive's world is the map times that drive's own scale, which differs by route. So "the same on every
  drive" holds only at the same scale.
- **A square of plants is made the first time the view reaches it**, and let go after `VEG_IDLE` (240) frames
  unused. Roads, side streets, corners and lots are filed in 2048-unit buckets (`VEG_BUCKET`), so a square looks at
  about 2 roads whatever the city's size. The old 2600-unit limit is gone: plants fill out to `cfg.far`. **Side
  effect:** the far haze to the sides and past a route's end now has plants where it was bare (+4 to +12% plants
  listed a frame; the same near the van).
- **Nothing grows in the river.** No plant stands within 10 px of the bank, no overgrowth mark goes over the water,
  and no prop stands in it (`Draw.inRiver`).
- **Props are filed by square** (`PROP_CELL` 512), both for the world and for each ground square.
  - **A far prop gets simpler, never popped:** from `LOD_AT` (0.35) of the way into the haze band its detail fades
    out over `LOD_BAND` (300 units). A wreck loses its wheels, rust, windows and shadow; a barrier's stripes turn
    flat; a sign's board turns to its flat colour.
  - **The same for props among a building's parts:** a prop a building draws among its parts gets the same level of
    detail (`Persp.drawItem`).
- **The scenery governor** (`Persp.sceneryRow`) reads the real frame interval (`g.rafMs`, the browser's own time
  between frames, smoothed over about half a second). Its one budget is `SCENERY_BUDGET_MS` = 25 (40 fps).
  - **Stepping:** a row down after 2 s over the budget. A row up after 8 s under 18.75 ms; that wait doubles (up to 8
    times) for a row it had to leave.
  - **Not counted:** gaps over 250 ms, pauses, the wrong-turn fade, the van waiting at its door, and a drive's first
    1.5 s.
  - **It never fights the walkers' governor:** after any row change of either governor it holds 2 s, and it never
    sets the walkers' rows.
  - **Rows** (`SCENERY_LEVELS`), each eased in over a second or two:
    0. today's look;
    1. 'low' image smoothing, and plants under 12 px fade out;
    2. plants under 16 px fade, far props simple, no plant shadows;
    3. half the far grass and bushes fade (by each plant's stable hash);
    4. plants under 22 px fade, and three quarters of the far grass and bushes.
  - **On a CPU-drawn canvas** it steps from row 0 to row 4 in about 7 s and cuts the frame by 29-31%. On the
    accelerated proxy it stays at row 0.
  - **Known side effect:** a browser capped at 30 fps (Chrome's Energy Saver) reads as slow and thins its scenery.
  - **Stats:** its row and the smoothed interval are `Persp.frameStats.scenery` and `.gapMs`.
- **The ground's squares are freed when a drive really ends.** `Game.stop()` calls `Persp.release()`, which lets go
  of:
  - every texture;
  - the card's canvases;
  - the plants' squares and the props' index;
  - the walkers' canvas pool;
  - the 2D layers.

  A wrong turn's retry is not a stop and keeps them. After a stop, GL textures went from 360 to 0, an estimated 204
  to 423 MB.
- **A seamless start: the van waits at its door until its first view is ready** (`Game.prepStep`, `Persp.ready`), at
  most `PREP_SECS` (1 s). Meanwhile the ground under the view and the views just ahead are drawn: `PREP_BUDGET` 24 ms
  of squares a frame, holes up to `PREP_HOLES` 60 ms. The same happens behind the dark after a retry. The trip clock
  does not run meanwhile.
- **The road canvas's dpr is capped at 1.5** (`ROAD_DPR_MAX`); only 175% and 200% screen scaling go past it. A
  dpr that changed with the governor was rejected: resizing a canvas mid-drive is itself a hitch. (Reversed by the
  owner the same day: "Driving lag on the owner's PC" below.)
- **Ground squares at sharp corners: one work list a frame, most visible first:**
  1. holes near the van;
  2. squares near the van;
  3. missing far squares;
  4. the soonest view ahead;
  5. sharpening;
  6. the later views ahead.

  Squares the views ahead need are kept on the card every frame. `AHEAD_BUDGET` is gone. **`keepFor`:** the card
  keeps `KEEP_VIEWS` (1.9) times the most squares a view of this window needs, never under `KEEP` (360). That is 365,
  415 and 529 squares at 1280 x 800, 1920 x 1080 and 2560 x 1080, against 280, 328 and 418 needed for the view plus
  the views ahead. **A texture leak was fixed:** a square needed both now and just ahead was drawn twice.
- **Measured** (interleaved A/B in headless Chromium, every route angled, frame ms median / p95):
  - **river to mall at night, software canvas:** 51.9 / 75.0 before, 37.0 / 52.7 after (-29%). With the governor
    held at row 0, 52.9 / 74.8: the new code at full scenery costs the same as before.
  - **First frames, software:** a 297 ms first frame with the van already moving became a 202 ms frame while it waits.
    After it moves, no frame is over 100 ms and there are no holes.
  - **Plant layout:** the old scatter took 81 ms at a drive's start (165 in the browser). The lazy layout takes
    1.7-7.5 ms for the first view and 11-28 ms over a whole drive. On cities 1x / 2x / 3x as wide, the old scatter
    took 81 / 245 / 510 ms and the new layout 27 / 28 / 26.
  - **Card memory:** the squares kept peak at 228 MB at 1280 x 800 (the same as before), 262-271 MB at 1920 x 1080
    (+12%) and 334-348 MB at 2560 x 1080 (+35%).
- **Open:**
  - **`keepFor` raises GPU memory on wide windows.** `KEEP_VIEWS` 1.4 would save about 25% at 2560 x 1080, at the cost
    of more squares drawn again.
  - **The governor was tuned on SwiftShader only;** the owner's PC is unmeasured.
  - **Below 20 fps the drive runs in slow motion:** the game's 0.05 s time-step clamp is unchanged.
  - **The night overlay costs about 7 ms of JS a frame** on a CPU-drawn canvas.
  - **Fog days were never measured.**
  - **Two costs still grow with the whole city:** `buildScenery` walks every road at a drive's start, and
    `Draw.cityRoads` filters every road for each ground square. Both are cheap today and about 9 times as costly at
    3 times the city.

### Merged and checked together (2026-10-17)

The three were built side by side from the same start and merged in this order: corners, places, scenery.
- **One river.** Both the corners and the scenery added `Draw.inRiver` and `Draw.riverEdge`, with the same names
  and signature. The merge keeps the corners' version, which reads `Streets.RIVER` and `Streets.riverDist`.
  `riverBand` keeps the corners' whole-box cull.
- **Everything standing is drawn through `Persp.drawItem`** (from the places). The scenery's per-frame settings now
  live there too: the governor's smoothing, the props' level of detail and the counts of plants and props drawn. So
  what a building draws among its parts gets them as well.
- **The Water Tower's night light shines through the dark.** It was drawn under the night's overlay and so never
  showed. `PerspBuild` now collects the lights it would draw at night, and game.js draws them right after the
  overlay (`PerspBuild.drawLights`).
- `tests/validate-scenery.js` loads the landmarks and js/perspective-buildings.js in page order, so its checks run
  with the buildings in.
- **Checked with every route angled in memory** (headless, Node):
  - **Every ordered pair of places** (272 routes) was driven at Engine Tune 0 and 5 alternately, with walkers
    spawning as in play. Every 20th frame, and once parked, it was drawn on a checking 2D context: 68,789 frames.
  - **Results:** every route arrived and parked with no wrong turn. There were no exceptions, NaN or bad canvas
    calls. The place's building was drawn once parked on every route.
  - **Plants and the river:** none of the plants seen stood inside a building's solid parts or in the river, and no
    prop stood in the river.
  - **Corner comfort** (`COMFORT_ALL=1 node tests/validate-drive.js`): all 2096 right-way turns on all 272 routes, at
    each engine, peak at 42.0 / 59.6 deg/s, with spin acceleration up to 83 / 165 deg/s2 and lag up to 25.1 / 31.0
    deg. The road after the bend stays 254 px inside the screen at 1280 x 800 and 109 px inside at 960 x 1040.
    Home Base to Corner Grocery is at 37.4 / 52.9. The 546 wrong ways peak at 42.5 / 58.4 deg/s.
- **Looked at in headless Chromium** (SwiftShader, 1280 x 800):
  - **Destinations,** approaching and parked: the Water Tower (also far off, and at night), Gas-N-Go, Home Base, St.
    Anne Annex, Northgate Mall, River Landing and the Public Library.
  - **Corners and roads:** the 133 deg corner mid-turn at Engine Tune 5 (and at 960 x 1040 at Engine Tune 0), a
    closed side street's end and Frog Lane with Corn Lane's dead end.
  - **Results:** the tower's lot is dry and up the bank, and the far tower stands over the haze. Walkers by the gas
    station are drawn against its parts. The road after the 133 deg bend stays on the screen.
  - **Still to fix:** at 1280 x 800 the HUD's top row covers the far horizon, so the far tower shows between its boxes
    or below them. At night the old headlight cone still hides the far buildings (the night beam is still to come).

### Tests added (2026-10-17)

- **`tests/validate-streets.js`**:
  - **Speeds:** every route at van speeds 1, 1.7, 1.25 and 2.125 (both cameras' slowest and fastest).
  - **The river:** no road, drive, side street or lot lies in it. With the old drive direction it reports 2110 errors.
  - **Comfort:** every right-way turn is comfortable at the angled speeds by the camera model, and again with every
    road 30% shorter (the denser-city check).
  - **Runtime:** 3.5 s became 8.6 s.
- **`tests/validate-drive.js` "comfort"** reloads game.js with the `PERSP_ROUTES` gate opened (or as is once the gate
  is gone). It drives 63 routes that take every turn in the city (`COMFORT_ALL=1`: every route) at both engines, and
  114 sampled wrong ways. It checks:
  - spin at most 45 / 65 deg/s, spin acceleration at most 300 deg/s2, lag at most 35 / 38 deg;
  - the road 300-900 units ahead on the screen at 1280 x 800 and 960 x 1040;
  - no hops;
  - braking at most 2% a frame and never before a stop line;
  - Home Base to Corner Grocery unchanged;
  - the camera numbers in streets.js matching the game's.
- **`tests/validate-drive.js` "places"** drives to all 17 places on the angled camera and draws each, 1300 units out
  and parked, on a checking 2D context. It checks:
  - every place has a row and every row a place;
  - once parked, every part is in front of the camera, nothing low stands in the van's box, and no part is drawn over
    the van;
  - walkers stood all round each building are drawn the right way round against its parts (1% allowed; 3 of 1594 are
    not);
  - the angled ground leaves out the standing pieces;
  - name boards never sit in a HUD box, never over a faded building, and are never more opaque than their building;
  - the tower is seen past the haze on the way to it;
  - at night the tower's antenna light is drawn over the night's dark (added at the merge; it fails without
    `drawLights`).

  Its script list gains landmarks1.js, landmarks2.js and perspective-buildings.js.
- **`tests/validate-scenery.js`** (new, in `npm test` after validate-drive, about 45 s, counts only) checks:
  - the plant layout on synthetic cities 1x / 2x / 3x as wide;
  - the same seeds and even density across squares' edges;
  - nothing in the river on 5 drives along it;
  - props found by square equal a full scan, and far props are simpler;
  - the governor's steps, its fade-in and hold, and the walkers' rows left untouched;
  - release at a stop, and nothing released on a retry;
  - squares kept against the view plus the views ahead.

### The flat camera taken out (2026-10-17, later)

Every drive now uses the angled camera, with no setting and no fallback (the owner's answer above). A machine
without WebGL gets the angled view's own 2D ground; a slow one gets the scenery governor.

**What went:**
- **js/game.js:** the `PERSP_ROUTES` gate and the `persp` flag, `drawFlat`, `flatToScreen` / `flatToWorld`, the flat
  aim and its assist, the flat spawn, cull and touch test, `drawCrowd`, `viewTurn`, the flat `drawOverSign`, `anchorY`
  and `EASE.camTurn`. That first commit took 334 lines out and put 116 in.
- **js/sprites.js** (2409 lines to 1201):
  - the top-down road walkers: `Draw.zombie` with its six looks (`ZOMBIE_LOOK`), `zombieShadow` and `zombieDown`,
    about 920 lines;
  - the scrolling road (`Draw.road`). It went too, because only the old title screen still called it;
  - the flat standing props (dead trees, barrels, barriers, signs and wrecked cars). `Draw.prop` keeps the junk that
    lies flat: tires, rubble and crates;
  - the top-down van's turret;
  - the screen-space fog and night overlays.
- **Tests:**
  - validate-art's road-walker section went. It keeps only the road's particles;
  - validate-drive's flat-only checks went: the flat routes, "no brake on the flat camera" and the flat crowd's draw
    order.
- **docs/SCALING.md:** the walker-kind step 4 (a road look for each kind) went. A new kind has one look, on foot and
  on the road.

**What stayed**, because the angled view still draws it: `Draw.ground`, `cityRoads`, `laneZone`, `laneArrow`, `lot`,
the signs and the name boards, `Draw.van` (the roof seen from above, laid on the 3D van's roof), particles, bursts,
`inRiver` and `riverEdge`. `cityRoads` keeps its flat side-street ends and the gas canopy, which the angled ground
draws when no building row stands there (a test that loads no buildings).

**What took its place:**
- **Night** (`Persp.night`):
  - a dark layer, with a glow round the van, the headlights' beam laid on the road down the van's own heading (so it
    turns with the van) and the gun's lamp along its aim;
  - the layer is drawn again only when it moves;
  - the Water Tower's light (`PerspBuild.drawLights`) is still drawn over it.
- **Fog:** the haze comes in thick and near, and walkers past it are hidden. It works with night: both go on at once.
- **The title screen and the garage's preview** (`Persp.showcase`): a still angled scene with the 3D van in its paint
  and every van and gun upgrade, and two Walker3D figures. It is drawn only when it changes.
- **The roof gun:** the 3D gun on the van shows every gun upgrade, as the old top-down turret did.
- **The aim:** every drive aims through the angled camera (`Persp.aim`).

**Judgment calls:**
- **Night's reach is 2050** (`NIGHT_BEAM`). That is about halfway between the old top-down road's 520 and the haze at
  3600, which is what "in between" asked for.
  - **The beam:** it starts 40 units ahead of the van's middle, 26 wide each side there, and opens 0.34 a unit. It is
    full bright for the first 30% of its reach and gone at its end.
  - **The other lights:** the glow round the van reaches 170. The gun's lamp reaches 360, 0.22 rad each side of the aim.
- **Night is fully dark outside the lights** (`NIGHT_DARK`, opaque). The old overlay filled its layer at 0.88 every
  frame without clearing it, so within a few frames it built up to black outside the lights. The new layer is cleared
  and redrawn only when it moves, so at 0.88 the world would show through at 12%. Opaque, beyond the beam and the
  glow, matches the old flat and angled drives pixel for pixel (6-8, 8, 16 against 6, 8, 16). Inside the lights it is
  within 3% of the old steady state.
- **When the dark is drawn again:** the layer is redrawn only when one of its points on the screen moves a whole px,
  or the aim turns about 1 deg. On a straight with a steady aim, 65% of frames reuse it.
- **Fog** (`FOG`):
  - the view sees 760 ahead in fog, clear to 60 ahead of the camera's spot and thickening between;
  - buildings fade into it by colour, and the far silhouettes (the tower past the haze) are off in fog;
  - walkers still come from as far off as on a clear day (`spawn` reads `cfg.far`), so in fog they are only seen
    later. The rebalance ("Walkers and balance" below) did not look at fog days;
  - the old flat road's fog was a clear circle about 300 round the van.
- **The title screen and the garage:**
  - both draw a 200 px tall picture (`SHOW`) with the van 0.76 of the way up it and two walkers at set spots, and the
    gun aims at the nearer walker;
  - on the title screen the walkers' kinds take turns through `WALKER_TYPES`, changing every `SHOWCASE_SECS` (4 s);
  - each drawing is keyed by size, upgrades, kinds and turn, so nothing is drawn while none of them changes.
- **The gun's upgrades in 3D:**
  - Spread Shot adds barrels at the fan's own angle;
  - Heavier Rounds lengthen them, with a muzzle brake from 3;
  - Rate of Fire adds a jacket (1; copper at 5), a drum by the breech (2; bigger with a brass ring at 4) and cooling
    fins (3);
  - the jacket stops short of the tips, so the barrels' length still shows.
- **The minimap:**
  - its arrow always points up. The map already turns with the van, and the camera's lag through a turn (up to 25-31
    deg) tilted it for nothing;
  - it fades only when a place's lot or its building's box is in front of the camera and short of the haze
    (`MINI_HAZE`, 0.25), and that outline on the screen overlaps the map.
- **The sign and the lane hint** (`Game.roadEdges`):
  - **The road's edges:** the outer edges (shoulders and oncoming lanes included) are projected every `EDGE_STEP`
    (120) from just behind the van out to the haze. Past a stop line the van has not crossed, they run on straight,
    so where the sign stands never tells the way;
  - **The sign** hangs `SIGN_GAP` (14 px) right of the edge beside the rows it covers;
  - **The lane hint** sits under the sign, as far right as the road's edge beside it needs, or on the grass left of
    the road down to where the edge comes past it;
  - **A sign just passed** slides right (`SIGN_AWAY`, 1.2 px a unit) as it fades. On the flat road it slid down the
    screen, which here would cross the road ahead.
- **Spread Shot closes in on a walker clicked.** With the click-pick the fan was centred on the walker, so with two
  barrels both shots passed either side of it: 0 of 2 hit at 500 to 1100 units.
  - **Clicked on a walker:** `Persp.aim` now narrows the fan, never wider than `Upgrades.SPREAD`, so every barrel's
    line crosses the walker within `SPREAD_HIT` (0.6) of its radius where the shots meet it;
  - **Aimed at the ground:** the fan is as before.
- **Pictures in their own pixels.** `Persp.texWall` and the van's roof drew each strip into a unit square, which
  Chromium blurred and clipped at small sizes. They now draw it at its own size, through a matching scale, as
  `texQuad` does.
- **The FPS meter** (god mode, Cheats, off by default):
  - **How it runs:** it has its own `requestAnimationFrame` loop, only while it is on. It shows the rate and the worst
    frame over the last second (`FPS_WINDOW_MS`), changing its words every 250 ms. A gap over 1 s (a tab in the
    background) is not counted as a frame;
  - **On the road** it adds the scenery governor's `gapMs` (or "paused"), the draw's own time, and both governors'
    rows;
  - **Saving:** it goes off with god mode and is never saved.
- **The roadside is built only where the drive can see** (`buildScenery`):
  - **Where:** the city is checked against the drive's track every `SCENERY_STEP` (400). Only roads within
    `SCENERY_REACH` (the camera's `cfg.far` + 600) get a roadside, and only along their stretch in that reach;
  - **Seeds:** each road's roadside is seeded by the route and that road, so it does not depend on the rest of the
    city. Today's drives have a different but just as thick roadside, and no save holds it.
- **validate-streets** now drives only the angled speeds (1.25 and 2.125): 8.6 s became 4.4 s.
- **Balance:** the angled pace, shot speed and spawns (`PERSP`: 1.25, 1.6, 1.4) now applied to every drive; the
  rebalance by danger level came next ("Walkers and balance" below).

**Measured:**
- **A drive's start** (`buildScenery`, node, all 272 routes):
  - today's city: 2.4 ms mean and 3.5 ms p95 before, 1.0 and 2.3 after;
  - a city padded to 3 times the roads: 16.8 and 23.5 before, 1.0 and 2.1 after;
  - props a drive: 935 before, 433 after. What went lay out of the camera's sight.
- **Night** (headless Chromium, SwiftShader, 1280 x 800, River Landing to Northgate Mall):
  - the old overlay: 4.5 ms median, 7.3 p95, every frame;
  - the new one: 2.1 and 3.2 when it is drawn again, and 0.0 and 0.1 when it is reused;
  - the whole frame is about 46 ms either way on the software raster, so the gain shows only where the GPU does the
    rest.

**Checked with every drive angled** (node, a checking 2D context):
- **Every route:** all 272 routes at Engine Tune 0 and 5, 544 drives. They were split by weather (clear, night, fog,
  fog and night) and Spread Shot level, with a bot aiming and firing. The minimap's fade and the sign were drawn every
  frame checked.
- **Results:** every drive arrived and parked with no wrong turn, and the place's building was drawn once parked.
  There were no exceptions, NaN or bad canvas calls in 137,477 frames. No plant stood in a building or in the river,
  and no prop in the river.
- **Looked at** in headless Chromium:
  - the title screen and the garage preview (plain, mid and every upgrade);
  - night on a straight, in a turn and parked, against the old flat road (36403cd) and the angled drive before this
    drop;
  - fog, and fog with night;
  - the minimap in the 133 deg corner;
  - the sign and the hint at 1280 x 800, 1920 x 1080 and 960 x 1040;
  - the FPS meter;
  - Spread Shot at a walker clicked.

**Still open:**
- (the walkers ahead of the van, the spawn rebalance, buildings blocking walkers and the door's rule in seconds came
  next: "Walkers and balance" below);
- `Draw.cityRoads` still filters every road for each ground square, a cost that grows with the whole city;
- at 1280 x 800 the HUD's top row still covers the far horizon;
- fog days and night drives were not balanced.

**Tests added or changed:**
- **`tests/validate-drive.js`** "flat out" (a checking 2D context, no WebGL) checks:
  - **night:** the dark is drawn again only when it moves; its beam lies down the van's heading; its reach is about
    halfway from 520 to the haze;
  - **fog:** the view sees `FOG.far`; a walker past it is not drawn; walkers come from where they do on a clear day;
    no silhouette shows past it;
  - **the minimap:** its arrow points up, and it fades for a place in view under it, not for the sky or a place in the
    haze;
  - **the sign and the hint:** off the road at three window sizes;
  - **Spread Shot 1 and 3:** at a walker clicked 1100, 800 and 500 ahead, every barrel's shot hits it;
  - **the title screen and the garage:** drawn again only on a change, every kind in turn;
  - **`texWall`:** drawn in its own pixels.

  The gun check runs on the angled camera at both engines, a check fails if game.js or sprites.js keeps any of the
  flat camera's members, and "comfort" drives the road as loaded.
- **`tests/validate-scenery.js`** "roadside": on cities 1x, 2x and 3x, three drives get the same props from the same
  roads, and none past the camera's reach.
- **`tests/validate-god.js`:** the FPS meter is off by default, and checks what it says off and on the road and that it
  goes off with god mode.
- **`tests/validate-engine.js`:** the van's gun is checked on the 3D roof gun.
- **`tests/validate-art.js`:** keeps the road's particles only.

### Walkers and balance (2026-10-17, later)

The owner's answers above, built: walkers ahead of the van walk at it, beside and behind it they still sprint to keep
up; buildings (and the river) block walkers; the angled drive keeps its feel (pace 1.25, shots 1.6 times as fast,
the longer range, the click-pick auto-lead, none of them touched) and its walkers are rebalanced so each danger's
drives are as hard as on the old top-down road; the door's "no new walkers" rule is counted in seconds. Also the
road now runs in 1/60 s steps, so a slow machine no longer plays in slow motion.

**Walkers ahead of the van** (`Game.carry`, `KEEP` in `js/game.js`):
- **No keep-up pull in front.** The carry that keeps a walker up with the van depends on where it is: none ahead of
  the nose, the danger row's `chase` share of the van's speed beside and behind it (within `PERSP.keepUp`, fading out
  over `KEEP.fade` further off), and in between over `KEEP.band`.
- **The band is time, not distance:** 0.8 s of the van's drive ahead of the nose (at least 60 units). A walker
  turns from walking at the van to sprinting with it while the van covers the band, so a fixed 150 units gave the
  Engine Tune 5 van a quicker, slipperier turn (p90 slip 86 units/s against 46 now).
- **A walker in the van's path keeps walking** (no carry within the van's half width plus its own radius): it walks
  into the nose instead of standing still in front of it.
- **No moonwalk:** a walker ahead of the van's middle is never carried away from the van faster than it walks at it,
  so its legs never walk toward the van while its body slides away.
- **Nose riders are shoved off to their nearer side** (`KEEP.shove`: 0.8 of the van's speed, at least 60 units a
  second) as soon as the nose pushes on them. The other choice, knocking one down after a hit or two, was not taken:
  it would make the nose a free kill and take the threat out of every walker that reaches the van. Shoved off, a
  walker grabs on beside the van and claws at it, as the old road's did. The hit as the nose meets it stays.
- **Facing:** a walker faces where it goes (walking at the van ahead of it, running with the van beside it), and
  faces the van only while it claws or something throws it back.

**Buildings and the river block walkers** (`Game.blockWalker`, `walkRound`, `clearSpot`, `solidLots`):
- **Buildings:** each lot's solid parts (`PerspBuild.solids`: boxes standing on the ground and at least 30 tall; a
  part with `solid: false` lets walkers through) are boxes a walker is put out of at once, as the van's box does.
  It goes out the nearest side that does not lead into a neighbouring part, in up to `BLOCK_PASSES` (3) passes, so
  a walker never ping-pongs between parts that touch (Greenhouse Row's three glasshouses).
- **The river:** the edge of its muddy bank (`Draw.riverEdge` 0, as plants keep out of) is a wall too. A walker in it
  is put out along the way the bank's distance grows fastest (felt over `RIVER_PROBE`, 4 units). The van itself never
  comes within 168 units of the bank on any route.
- **The van wins:** its own push-out runs last, so a walker squeezed between the parked van's nose and a wall (45
  apart) can be up to about 2 units into the wall for a moment, never into the van.
- **Going round:** a walker put out of a wall walks along it (`WALK_ROUND`, 0.4 s, renewed while it presses). It
  goes toward the end the van is past, or, when the van is straight through the wall, toward its own nearer end. It
  keeps that way for `WALK_MEMORY` (2 s) after leaving the wall, so at a corner it does not turn back along the same
  wall toward the van, and it turns round if it makes less than `WALK_HEADWAY` (25%) of its pace along the wall in
  `WALK_STUCK` (1 s), for example when another walker is coming the other way. As first built (the way the van is
  along the wall), 16 of 120 walkers behind the grocery paced its back wall for good.
- **Where they come from:** a new walker comes from a spot at least `SPAWN_CLEAR` (30) plus its radius clear of both,
  and best with neither between it and the van. Up to `SPAWN_TRIES` (6) spots are tried; if every clear one had a
  building or the river in its way, the first clear one is used, and with no clear spot none comes (11 of 18,109 at
  day 10 over every route). Each walker of a group checks its own spot.

**The rebalance** (`ROAD_DANGER`, `ROAD_LATE`, `ROAD_LATE_DAY`, `roadRow`, `spawnGroup`, `spawnGap`):
- **How it was judged.** `tests/balance` drives the real road code with a lane-keeping driver and a human-like aiming
  bot (it targets a walker only once its figure is 30 px tall and faded in half way, tracks it 0.2 s late with 6 px
  of jitter, clicks 6 times a second) on 3 routes a danger (0, the drive home, to 5), days 1, 5, 10 and 20, with the
  van the economy plausibly has that day, 48 seeds a route: 3,456 trips. Each cell is held to the old top-down
  road's numbers, measured the same way at 36403cd before that camera went (`tests/balance/targets.json`, frozen),
  within damage +-20% (at least 5 HP), wrecked +-10 points, walkers met +-15% and scrap +-15%. Days 1 to 10 carry
  the difficulty; on day 20 both cameras take almost no damage, so those cells are judged on met and scrap.
- **What made the old road hard.** Most of its damage came from walkers that started at the top of the screen
  (about 560 units ahead, inside the road's width): half of them reached the van. There they were never pushed out
  of it, so a walker homing on the van's middle stayed on it and hit 2.8 to 4.4 times on day 1 at danger 3 to 5.
  The angled drive before this drop brought 55% of its walkers 1,800 to 2,900 units ahead and up to 920 to either
  side (the rest 700 to 2,200 ahead, out of the roadside), and the auto-lead hits about 90% of shots, so the bot shot
  almost every walker long before it arrived: each walker met did 4.6 to 28 times less damage than on the old road,
  and no spawn rate fixed that without far too many walkers met.
- **Every danger's later days** (`ROAD_LATE`, the row for day 10 on, which every danger keeps unless its row says
  otherwise): walkers 1.4 times as often as the old road's (they are seen from further off); 55% of them from far
  down the road and on it (`farX` 30: within the road's half width plus 30, as the old road's came down the top of
  the screen); and keeping up beside the van at 0.72 of its speed. That 0.72 is the old road's 0.65 in effect: the
  van passes a walker beside it as fast as before, at the angled pace (1 - 0.35 / 1.25 = 0.72). This row alone
  brought every day 10 and day 20 cell within the bands at 16 seeds a route; at 48, danger 2's day 10 came out 27%
  high, so its row keeps up at 0.70.
- **The first days need more.** Every setting tried that does not depend on the day left day 10's damage ratio
  (angled against old) 1.4 to 2.5 times day 1's. Nearer, denser, harder-keeping walkers raised days 1 and 10
  together; none of 16 settings at danger 3 passed both on damage. So each danger has `early` numbers for day 1,
  and its day's numbers go over to its row in even steps by `ROAD_LATE_DAY` (10). On the first days, at the more
  dangerous places, walkers come nearer, in groups (`group`, within `GROUP_SPREAD` 160 units of each other), and keep
  up harder beside the van: a weak gun is overwhelmed, as it was on the old road. Each group comes as far apart in
  time as that many walkers would, so `spawns` is still walkers per second. The early numbers were fitted per danger
  on days 1 and 5 (16 seeds a route), then the whole matrix checked at 48 seeds and dangers 2, 4 and 5 nudged:

  | danger | spawns (day 1 / 10 on) | chase | group | far down the road, share of the view's reach |
  | --- | --- | --- | --- | --- |
  | 0 (home), 1 | 1.4 / 1.4 | 0.72 / 0.72 | 1 / 1 | 0.5-0.8 / 0.5-0.8 |
  | 2 | 1.0 / 1.4 | 0.84 / 0.70 | 2.5 / 1 | 0.35-0.5 / 0.5-0.8 |
  | 3 | 1.2 / 1.4 | 0.80 / 0.72 | 2.5 / 1 | 0.425-0.575 / 0.5-0.8 |
  | 4 | 1.0 / 1.4 | 0.80 / 0.72 | 4.5 / 1 | 0.35-0.5 / 0.5-0.8 |
  | 5 | 0.85 / 1.4 | 0.88 / 0.73 | 5 / 1.25 | 0.2-0.35 / 0.5-0.8 |

  Every row keeps the roadside's spots (`sideY` 700-2200 ahead, `sideX` 600-1400 past the road's edge) and 45% of
  walkers coming from there. A danger past the last row takes the last.
- **What did not help:** letting a walker pressed on the van's side spend its own pace running along with it (a
  "cling", the old road's homing on the van's middle). It changed nothing: on day 1 at danger 3, 207 of 253 walkers
  that touched the van were downed (shot or rammed) after about a second in contact on average, cling or not. It was
  taken out again.
- **The gap between walkers** (`spawnGap`): the trip's interval (`DIFF`, by danger and day as before), divided by
  the row's `spawns`, times 0.85 at night (`DIFF.nightSpawns`), and only then floored at `DIFF.minInterval` (0.6 s).
  The floor used to apply before the multipliers (a known bug: 0.43 s in effect). It does not bind on any matrix
  cell; it is a `SCALE:` limit for longer, later, more dangerous drives.
- **No new walkers near the door, in seconds:** `DIFF.quietAtDoor` is 3 s at the van's own speed from the parking
  spot: 900 units at Engine Tune 0 (as before), 1,530 at Engine Tune 5 (was 900), so a faster van gets the same
  quiet arrival.
- **Results, 48 seeds a route** (`npm run balance`; "before" is the angled drive as of b7b8202, the flat camera just
  removed; "!" is outside the band): 23 of 24 cells pass, from 6.

| cell | dmg: flat / before / after | wrecked: flat / before / after | met: flat / before / after | scrap: flat / before / after | before | after |
| --- | --- | --- | --- | --- | --- | --- |
| d0/day1 | 15.7 / 1.1! / 17.9 | 1% / 0% / 1% | 22.0 / 22.1 / 23.2 | 27.9 / 28.4 / 29.6 | FAIL | pass |
| d1/day1 | 33.8 / 4.0! / 31.4 | 6% / 0% / 4% | 18.2 / 15.4! / 16.7 | 25.1 / 21.9 / 22.0 | FAIL | pass |
| d2/day1 | 102.8 / 12.5! / 113.8 | 46% / 0%! / 49% | 22.0 / 19.6 / 20.1 | 29.8 / 29.7 / 30.4 | FAIL | pass |
| d3/day1 | 176.0 / 32.6! / 201.8 | 81% / 6%! / 82% | 24.0 / 20.2! / 24.3 | 30.7 / 29.2 / 33.4 | FAIL | pass |
| d4/day1 | 374.6 / 64.3! / 382.7 | 100% / 20%! / 98% | 31.5 / 29.0 / 28.4 | 36.8 / 40.5 / 39.3 | FAIL | pass |
| d5/day1 | 546.5 / 100.3! / 876.7! | 99% / 39%! / 100% | 35.8 / 31.4 / 30.3! | 37.7 / 42.9 / 54.7! | FAIL | FAIL |
| d0/day5 | 8.2 / 0.6! / 9.1 | 0% / 0% / 0% | 23.2 / 24.2 / 24.5 | 36.5 / 38.0 / 39.0 | FAIL | pass |
| d1/day5 | 14.8 / 0.9! / 15.0 | 0% / 0% / 0% | 18.9 / 18.0 / 18.9 | 30.2 / 29.7 / 31.5 | FAIL | pass |
| d2/day5 | 36.6 / 2.7! / 39.9 | 0% / 0% / 0% | 23.4 / 22.9 / 23.3 | 40.5 / 39.8 / 39.5 | FAIL | pass |
| d3/day5 | 64.4 / 4.8! / 69.1 | 8% / 0% / 8% | 24.6 / 24.9 / 25.8 | 41.9 / 44.6 / 43.6 | FAIL | pass |
| d4/day5 | 171.6 / 14.6! / 153.1 | 47% / 0%! / 44% | 32.7 / 32.4 / 33.3 | 53.2 / 59.4 / 51.5 | FAIL | pass |
| d5/day5 | 314.3 / 31.0! / 284.1 | 84% / 1%! / 79% | 37.8 / 34.7 / 37.7 | 54.9 / 61.4 / 60.9 | FAIL | pass |
| d0/day10 | 10.0 / 0.4! / 9.6 | 0% / 0% / 0% | 25.6 / 26.7 / 27.4 | 60.1 / 61.8 / 63.7 | FAIL | pass |
| d1/day10 | 10.9 / 1.1! / 11.5 | 0% / 0% / 0% | 20.8 / 19.4 / 20.5 | 52.5 / 50.5 / 52.2 | FAIL | pass |
| d2/day10 | 23.5 / 2.3! / 25.4 | 0% / 0% / 0% | 25.4 / 24.0 / 25.6 | 56.7 / 60.3 / 62.4 | FAIL | pass |
| d3/day10 | 34.8 / 3.3! / 41.0 | 0% / 0% / 0% | 27.1 / 26.8 / 29.1 | 65.9 / 65.7 / 68.5 | FAIL | pass |
| d4/day10 | 79.0 / 9.9! / 75.8 | 1% / 0% / 1% | 36.1 / 36.3 / 40.5 | 83.2 / 84.1 / 87.2 | FAIL | pass |
| d5/day10 | 119.3 / 18.0! / 127.6 | 8% / 0% / 15% | 40.5 / 38.6 / 43.9 | 89.2 / 88.7 / 90.0 | FAIL | pass |
| d0/day20 | 0.2 / 0.3 / 0.3 | 0% / 0% / 0% | 37.9 / 36.5 / 37.3 | 106.6 / 104.0 / 106.3 | pass | pass |
| d1/day20 | 0.2 / 0.3 / 0.2 | 0% / 0% / 0% | 31.5 / 29.4 / 29.7 | 89.8 / 91.0 / 91.6 | pass | pass |
| d2/day20 | 0.3 / 0.5 / 0.3 | 0% / 0% / 0% | 39.1 / 38.0 / 38.5 | 110.9 / 108.9 / 110.9 | pass | pass |
| d3/day20 | 0.9 / 0.4 / 1.3 | 0% / 0% / 0% | 41.6 / 38.7 / 39.8 | 117.3 / 112.8 / 114.9 | pass | pass |
| d4/day20 | 2.0 / 0.6 / 2.3 | 0% / 0% / 0% | 56.0 / 54.1 / 56.6 | 144.7 / 146.6 / 152.8 | pass | pass |
| d5/day20 | 3.3 / 0.6 / 5.8 | 0% / 0% / 0% | 63.3 / 60.1 / 62.9 | 166.0 / 160.3 / 166.1 | pass | pass |

- **Danger 5 on day 1 does not pass.** Its van is wrecked on 100% of trips against 99% on the old road, but the
  damage (as if the van survived) is 60% high, walkers met 15% low (just past the band) and scrap 45% high: the
  angled bot downs 95% of the walkers it meets there, the old road's 63%. With the day blended evenly between its
  `early` row and its later one, no early row passes both danger 5 cells: the ones that pass day 5 overshoot day 1's
  damage (by 46%), and the 6 of 24 tried that bring day 1's damage within 20% all leave day 5 short (damage 34-48%
  low, wrecked 13-38 points low). What would close it: a separate `early` anchor at day 5 (or a per-row day the
  early numbers last to), not a different spawn rate; day 1's scrap would stay high with any spawn lever, since
  fewer walkers (less scrap) also means fewer met. On the economy's own schedule nobody drives to a danger 5 place
  on day 1.

**The road in steps** (`ROAD_STEP`, `MAX_FRAME_DT`):
- `update` now runs the road (the drive, the gun, new walkers, shots, walkers and their touch on the van, crates,
  bodies and dust) in steps of at most 1/60 s (`roadStep`), and a frame counts up to 0.1 s instead of 0.05. Below
  20 frames a second the game used to run in slow motion; now it plays at full speed down to 10.
- A walker's knock and the dust's drag die away by time (they did by frame).
- A frame of 0.1 s is exactly six of 1/60 s, and one of 1/30 s two: on drives with walkers coming, the gun firing
  and the lanes changing, the van, every walker's place and health, the shots, kills, scrap and the van's health
  match bit for bit. At 60 frames a second nothing changed (one step a frame; the balance run's trips are the same
  to the last number).
- A step costs about 0.2 ms with a crowd round the van (Node), so six of them add about 1 ms to a 100 ms frame.
- The interiors still clamp at 0.05 s (`js/interior.js`); they were not part of this.

**Heavy drives** (Home Base to the hospital, danger 5, the first 60 s, the van that day plausibly has, a shooter
clicking at the nearest walker on the screen; headless Chromium on SwiftShader at 1280 x 800, so the times compare
before with after and are not a real PC's; "before" is b7b8202):

| day | walkers alive (median / p95 / most) | walkers' time, ms (median / p95) | the whole draw, ms (median / p95) |
| --- | --- | --- | --- |
| 1 | 8 / 10 / 11 before, 4 / 7 / 8 after | 1.2 / 2.5 before, 1.1 / 2.5 after | 9.6 / 16.7, 9.3 / 16.8 |
| 10 | 5 / 8 / 9, 6 / 9 / 10 | 0.7 / 1.6, 0.9 / 2.0 | 9.8 / 16.0, 9.8 / 16.3 |
| 20 | 5 / 8 / 9, 5 / 6 / 8 | 0.8 / 1.9, 0.7 / 1.7 | 10.6 / 17.1, 11.1 / 17.5 |
| 20, nobody shooting | 10 / 13 / 14, 11 / 15 / 17 | 1.5 / 3.0, 1.6 / 3.2 | 11.5 / 18.3, 11.5 / 18.2 |

- The walkers stay under their own budget (`LIVE_BUDGET_MS`, 4 ms, p95 at most 3.2). Their governor spent most of
  each drive on its richest row, before and after, except on day 1 after, where it spent most of it one row down:
  the packs come right up to the camera, where pictures are biggest. On the first days at danger 5 fewer walkers are
  about at once (they come in packs, further apart), on day 10 one more.
- Over every route with nobody shooting, the most walkers alive at once rose from 26 to 33 (day 10, Engine Tune 0):
  they now come on the road and keep up harder, so fewer pass out of the view's sides. `ROAD_WALKERS_MAX` (40) caps
  it: no new walker comes while 40 are on the road. It never binds on today's drives (the balance bot's trips have at
  most 18).

**Measured:**
- **Feet** (validate-drive's "persp feet" walkers, Engine Tune 0 / 5, units a second, 90th percentile):
  - ahead of the van, before: slide 277 / 547, 59% / 81% of frames moving backward against the way it faces (the
    moonwalk); after: 3 / 4 past the band, 42-46 while turning in the band, none backward;
  - beside and behind: 6-11 / 13-17.
- **In the van's path**, before: walkers moved away from the van at 0.7 to 5.5 times their own pace and rode the nose
  0.5 to 4.2 s; after: they come at it at their own pace, are on the nose 0.08 to 0.25 s, and press a side 0.6 to
  3.5 s.
- **Walkers in buildings and the river** (every route, walkers coming, nobody shooting; 816 drives over day 1 and 10
  at Engine Tune 0 and day 20 at 5; about 43 million walker frames): before, at day 10, 19,777 walker frames inside a
  building (deepest 97 units), 23,184 in the river (deepest 672) and 98 walkers spawned inside; after, none.
- **Going round:** three walkers of different kinds behind the parked van's grocery, 40 seeds: all 120 come round
  (median 11 s, slowest 20 s).

**Tests added:**
- **`tests/validate-drive.js`:**
  - "persp feet" also checks walkers ahead (planted past the band, under 60 while turning, never backward) and every
    kind in the van's path (its own pace, off the nose within 0.35 s, then pressing a side);
  - "walkers blocked" (new): a walker of every kind in every building part and all along the river is put out;
    walkers behind the grocery come round to the parked van (6 seeds); and over a sample of drives with walkers
    coming none spawns in or ever stands in a building or the river (`--all-walkers` drives every route: 272 drives,
    18,589 walkers, about 20 million walker frames, none in either, in about 5.5 min);
  - "road steps" (new): frames of 0.1 s and 1/30 s against 1/60 s, bit for bit;
  - "walker cap" (new): no walker comes while `ROAD_WALKERS_MAX` are on the road, and they come again under it.
- **`tests/validate-balance.js`** (new, in `npm test`, about 6 s): six cells, 6 seeds a route, against wide bands
  (damage +-50%, wrecked +-30 points, met and scrap +-30%), and a trip driven twice (here and on a worker) is the
  same. It fails on the road before the rebalance (damage 84-94% low).
- **`npm run balance`** (`tests/balance/compare.js`, about 1.5 min on 4 cores): the whole matrix against the target.
  `--danger 3 --day 1,5 --seeds 16` narrows it, `--set "ROAD_DANGER.3.early.group=3"` tries a number without
  editing anything, `--by route` judges each route, `--out trips.jsonl` keeps the trips.

**Still open:**
- danger 5 on day 1 (above);
- fog days and night drives are still not balanced: the bot sees through fog and none of the matrix's days is a
  night; walkers still come from as far off in fog as on a clear day;
- the balance is this bot's difficulty, not a person's: it never misses a turn, never dodges and does not tire;
- the walk-in interiors still clamp a frame at 0.05 s;
- the packs on the first days at dangerous places were judged by numbers; they were looked at in only a few
  screenshots.

### Review fixes (2026-10-17, last)

A review of the whole angled-camera branch (feel, look, balance and regressions) found the problems below; each was
checked again by a second reviewer before it was fixed. Where this section and the ones above disagree, this one is
current: the Ram Plow's damage, the late rows of dangers 2 to 5, the balance matrix's days and where near packs come
from changed here.

**The Ram Plow is worth what it was** (`js/upgrades.js` `ram`):
- **What was wrong:** on the old road a walker that reached the van stayed on it until downed, so the plow hit it
  every second; on the angled road a walker pressed on the van slides off its side after a touch or two (about 1.5
  blows a walker against 2.1). Ram Plow 1 (13 damage) cut a dangerous day-5 drive's damage by only 13 to 35%, against
  46 to 60% on the old road, so clear days 6 to 8, the plow's first days on the economy's schedule, were 24 to 64% harder
  than the old game at dangers 2 to 5 (7 of 8 cells failed).
- **The fix:** the plow's damage is 4 with none, then 28, 40, 52, 64 and 76 (`4 + 12 a level + 12 for having one`,
  was `4 + 9 a level`). The plow itself is the big step: a straight `4 + 16 a level` matched Ram Plow 3 but left Ram
  Plow 1 weak, `4 + 24 a level` the other way round. The garage shows the new number.
- **Measured** (danger 3 / 4 / 5 on day 5, night and fog off, seeds 101 to 148, damage with the plow against without):
  Ram Plow 1 x0.51 / 0.50 / 0.42 (old road 0.54 / 0.47 / 0.40, before the fix 0.87 / 0.80 / 0.65); Ram Plow 3 x0.20 /
  0.23 / 0.24 (old road 0.28 / 0.24 / 0.22, before 0.50 / 0.43 / 0.40).
- **What it moved:** the drives the plow is bought for got easier, so the late rows keep up harder beside the van:
  danger 2 `chase` 0.70 to 0.78 with groups of 1.5 at 1.3 x `DIFF`'s rate (was 1 at 1.4), danger 3 0.72 to 0.74,
  danger 4 0.72 to 0.75, danger 5 0.73 to 0.78.

**Near packs step out of the verge** (`js/perspective.js` `spawn`, `ROAD_OPEN`, `VERGE`; `Game.stepOut`):
- **What was wrong:** on days 1 to 5 at dangers 2, 4 and 5 the packs came 720 to 1,800 units ahead on the open road,
  clear of the haze and 20 to 35 px tall, and faded in there: 24, 25 and 43% of all walkers on day 1 appeared in
  plain view on the asphalt (16% on day 5 at danger 5).
- **The fix:** a walker from down the road that would come nearer than `ROAD_OPEN` (half the view's reach, where a
  plain walker is about 13 px tall on a 720 px window, just short of the haze) comes out of the verge's thicket
  instead, 40 to 140 units past the shoulder beside the van's own road there (js/perspective-art.js grows that
  thicket), and the rest of its group beside it along the verge. Each then **steps out onto the road**, straight across
  it to a place on its own half at random, before it turns for the van.
- **Why it steps out:** packs that only came out of the verge and homed on the van were much easier (danger 2 on day
  1: 41 HP a trip against the old road's 103; danger 5 on day 5: 137 against 314): they met the van from the side and
  the bot shot them while they kept up beside it. Re-fitting the early rows to that (keep-up up to 0.92 to 0.98,
  bigger groups) brought the damage back but not the scrap: the bot downed nearly every walker it met (scrap 26 to
  42% high). Stepped out, they stand where the old road's did, in the van's way, and the early rows fitted before
  hold as they were (danger 2 day 1: 107, danger 4 day 5: 148 against 172).
- **Measured** (the balance bot's trips, 8 seeds a route; on the screen, at least 20 px tall, at least half clear of
  the haze, within the road's half width and 60 of the van's road): danger 2 / 3 / 4 / 5 on day 1 from 23.6 / 6.2 /
  25.2 / 43.1% to 2.0 / 3.1 / 0.5 / 0.7%; danger 5 on day 5 15.5 to 1.2%; day 10 unchanged (1.1 to 1.4%: the haze).

**The balance matrix and its report** (`tests/balance`):
- **Days 3 and a clear day 7** are in the matrix (`matrix.json` `days` 1, 3, 5, 7, 10, 20; `clear`: day 7 drives with
  night and fog off). Their flat targets were driven on 36403cd by the same stage-1 harness, which reproduces the
  frozen cells exactly, and added to `targets.json` (`meta.added`). Day 7 guards the Ram Plow's first days; the anchor
  days 1, 5, 10 and 20 could not see that gap. `npm run balance` is 5,184 trips, about 3 min on 4 cores.
- **compare.js** prints each difference with its band and its combined standard error (`+7% of +-20%, se 5%`), so a
  miss by noise reads as one.
- **Held-out seeds:** the matrix is also judged on seeds 49 to 96 (`--seed0 49`), which none of the tuning saw.
- **Results** (48 seeds a route): 32 of 36 cells pass on the tuning seeds, 31 of 36 on the held-out ones. The code
  before this drop, judged on the same 36 cells: 30 and 26 (it failed danger 5 on day 1, dangers 3 and 4 on day 3 and
  dangers 3 to 5 on the clear day 7, all but one too hard; it had passed 23 of the old 24 cells). "!" is outside the
  band.

| cell | dmg: flat / now | wrecked: flat / now | met: flat / now | scrap: flat / now | tuning seeds | held-out seeds |
| --- | --- | --- | --- | --- | --- | --- |
| d0/day1 | 15.7 / 17.9 | 1% / 1% | 22.0 / 23.2 | 27.9 / 29.6 | pass | pass |
| d1/day1 | 33.8 / 31.4 | 6% / 3% | 18.2 / 16.7 | 25.1 / 22.0 | pass | FAIL (dmg) |
| d2/day1 | 102.8 / 109.2 | 46% / 49% | 22.0 / 22.1 | 29.8 / 32.5 | pass | pass |
| d3/day1 | 176.0 / 207.2 | 81% / 85% | 24.0 / 26.2 | 30.7 / 34.9 | pass | pass |
| d4/day1 | 374.6 / 320.3 | 100% / 99% | 31.5 / 29.8 | 36.8 / 39.8 | pass | pass |
| d5/day1 | 546.5 / 794.8! | 99% / 99% | 35.8 / 30.9 | 37.7 / 55.1! | FAIL | FAIL (dmg, scrap) |
| d0/day3 | 3.1 / 3.4 | 0% / 0% | 23.4 / 25.2 | 33.7 / 37.4 | pass | pass |
| d1/day3 | 9.1 / 6.1 | 0% / 0% | 19.6 / 19.1 | 30.7 / 30.2 | pass | pass |
| d2/day3 | 25.2 / 24.3 | 3% / 0% | 24.0 / 22.8 | 39.4 / 39.0 | pass | pass |
| d3/day3 | 48.1 / 57.2 | 7% / 8% | 25.0 / 27.6 | 41.9 / 47.9 | pass | pass |
| d4/day3 | 173.5 / 150.4 | 52% / 61% | 33.4 / 33.8 | 54.3 / 55.9 | pass | FAIL (died) |
| d5/day3 | 313.2 / 254.3 | 80% / 79% | 38.2 / 36.0 | 58.1 / 67.3! | FAIL | pass |
| d0/day5 | 8.2 / 9.1 | 0% / 0% | 23.2 / 24.5 | 36.5 / 39.0 | pass | pass |
| d1/day5 | 14.8 / 15.0 | 0% / 0% | 18.9 / 18.9 | 30.2 / 31.5 | pass | pass |
| d2/day5 | 36.6 / 33.1 | 0% / 1% | 23.4 / 23.5 | 40.5 / 40.2 | pass | pass |
| d3/day5 | 64.4 / 68.7 | 8% / 8% | 24.6 / 27.3 | 41.9 / 46.3 | pass | pass |
| d4/day5 | 171.6 / 148.3 | 47% / 44% | 32.7 / 34.9 | 53.2 / 54.1 | pass | pass |
| d5/day5 | 314.3 / 298.4 | 84% / 82% | 37.8 / 39.0 | 54.9 / 67.1! | FAIL | FAIL (scrap) |
| d0/day7 | 2.8 / 2.3 | 0% / 0% | 24.7 / 27.6 | 41.4 / 45.1 | pass | pass |
| d1/day7 | 6.0 / 2.0 | 0% / 0% | 20.3 / 20.9 | 35.8 / 36.4 | pass | pass |
| d2/day7 | 15.5 / 10.4! | 1% / 0% | 24.4 / 24.7 | 43.8 / 44.6 | FAIL | pass |
| d3/day7 | 22.3 / 24.1 | 0% / 0% | 26.4 / 28.8 | 48.6 / 54.0 | pass | pass |
| d4/day7 | 50.2 / 57.1 | 0% / 2% | 34.8 / 38.6 | 64.8 / 72.7 | pass | pass |
| d5/day7 | 85.6 / 89.2 | 12% / 13% | 39.8 / 42.9 | 73.5 / 82.5 | pass | pass |
| d0/day10 | 10.0 / 5.0 | 0% / 0% | 25.6 / 27.6 | 60.1 / 64.6 | pass | FAIL (dmg) |
| d1/day10 | 10.9 / 7.8 | 0% / 0% | 20.8 / 20.6 | 52.5 / 53.1 | pass | pass |
| d2/day10 | 23.5 / 25.6 | 0% / 0% | 25.4 / 25.5 | 56.7 / 62.5 | pass | pass |
| d3/day10 | 34.8 / 33.8 | 0% / 0% | 27.1 / 29.3 | 65.9 / 70.2 | pass | pass |
| d4/day10 | 79.0 / 69.6 | 1% / 1% | 36.1 / 41.4 | 83.2 / 92.8 | pass | pass |
| d5/day10 | 119.3 / 107.2 | 8% / 7% | 40.5 / 45.7 | 89.2 / 99.3 | pass | pass |
| d0/day20 | 0.2 / 0.0 | 0% / 0% | 37.9 / 37.1 | 106.6 / 106.0 | pass | pass |
| d1/day20 | 0.2 / 0.0 | 0% / 0% | 31.5 / 29.7 | 89.8 / 91.5 | pass | pass |
| d2/day20 | 0.3 / 0.2 | 0% / 0% | 39.1 / 36.2 | 110.9 / 106.3 | pass | pass |
| d3/day20 | 0.9 / 0.6 | 0% / 0% | 41.6 / 40.3 | 117.3 / 115.2 | pass | pass |
| d4/day20 | 2.0 / 0.6 | 0% / 0% | 56.0 / 57.1 | 144.7 / 152.7 | pass | pass |
| d5/day20 | 3.3 / 3.5 | 0% / 0% | 63.3 / 64.0 | 166.0 / 167.6 | pass | pass |

- **The misses:**
  - danger 5 on days 1, 3 and 5: its damage can be matched, its scrap cannot. The angled bot downs most of the
    walkers it meets there and the old road's did not, and no spawn lever changes that share. The economy's schedule
    first goes to a danger 5 place on day 17;
  - danger 2 on day 7: 10.4 HP against 15.5, 0.1 HP past its +-5 HP floor (it passes held out);
  - held out only: danger 1 on day 1 (-20%, on the band's edge), danger 4 on day 3 (wrecked 10.4 points high) and the
    drive home on day 10 (4.2 HP against 10.0: the Ram Plow halves a drive this mild, and its floor is 5 HP).
- **Clear days 6 to 9 against the old road** (seeds 101 to 148, a check the matrix does not run): days 7 to 9 pass 9
  of 12 cells (before: 5 of 12, every miss too hard, by 24 to 64%); the misses are now too easy (danger 2 on day 9,
  13.9 HP against 21.1; danger 4 on day 9, 57 against 77; danger 5 on day 8, scrap 15% high). Day 6 passes 2 of 3
  (before: none; danger 5's wrecked share is 26% against 43%).

**The road sign never jumps** (`Game.drawSign`, `SIGN_ROOM`, `SIGN_NARROW_W`, `SIGN_GLIDE`, `signSpot`):
- **What was wrong:** the across-the-top place under the minimap, meant for narrow windows, also took over whenever
  the far road's edge came within 186 px of the screen's right edge, which the lagging camera does for a moment in
  bends. The sign then leapt about 1,100 px and back, and a passed sign followed the swinging edge as it faded.
- **The fix:**
  - only the window decides the across-the-top place (narrower than 700 px, or under 160 px right of its middle);
  - anywhere else the sign stands at the right, never narrower than 160 px and never left of the window's middle (a
    road edge left of the middle leaves the right half clear). A sign seen last frame glides after the road's edge at
    0.8 window widths a second at most, and stays put while no edge is beside it. In a bend it may stand over the far
    edge for a moment; walkers are drawn over it again (`drawOverSign`);
  - a passed sign keeps where it stood as the van crossed the stop line, and slides off from there.
- **Measured** (every route at Engine Tune 0, the sign drawn every frame; a jump is over 120 px in a frame while it is
  at least 90% shown): 571 / 643 / 186 / 664 jumps at 1280 x 800, 1920 x 1080, 960 x 1040 and 1366 x 657 before,
  none after (and none at 1440 x 900). It now moves at most 19 px in a frame.

**60 Hz frames run one road step** (`STEP_SLACK`, `stepsIn`): a browser's clock is rounded to 0.1 ms, so its 60 Hz
frames come 16.6 to 16.8 ms apart, and 63% of them ran two half steps (a 59.94 Hz screen every frame). Over the
balance matrix that played 2 to 4% easier than the harness's 1/60 s frames (kills up in 21 of 24 cells, damage down
in all six day-1 cells). A step may now run 2% longer than `ROAD_STEP` (and `DRIVE_STEP`): 16.6 to 16.8 ms frames run
one step, as the harness does, and 1/30 s and 0.1 s frames still run exactly two and six (the balance run's trips are
unchanged to the last number).

**A capped browser keeps its scenery** (`SCENERY_OWN`, `SCENERY_GAIN`, `SCENERY_TRY_SECS`): a browser capped at 30
frames a second (Chrome's Energy Saver on battery, a 30 Hz screen) thinned the scenery to its lowest row within 16 s
and stayed there, though thinning cannot bring capped frames closer. Now, while the page's own draw (`frameStats.ms`)
is under 45% of the interval, the governor's rows down are a trial: once a row has brought the interval down by 10%
it goes on as before (the graphics card's raster can be what is slow, and the page's own draw does not count it); if
even the thinnest row has not, it goes back to where the trial began and steps down no more on that drive while its
own draw stays that small. Measured on the governor itself (300 s of synthetic frames): a 30 fps cap with a 6 ms draw
spent 95% at the lowest row before, 95% at the richest after (one 20 s trial down the rows); a page whose own draw is
most of a frame, and one whose graphics card a thinner row speeds up, settle where they did before.

**The look:**
- **A building's fine details fade in** (`FINE_PX`, `R.fine`, `fine()` in js/perspective-buildings.js): its props, lamp
  posts, panes, posters, shingles and fruit came in all at once mid-screen about 4 to 5 s before parking. They now fade
  in as the building grows from 170 to 220 px across (about a second's drive); `R.lod` is still an integer, for the
  part order's cache.
- **Night's edges are soft** (`NIGHT_FEATHER`): the beam's and the gun lamp's sides fade out over five rings laid round
  them (each 4.5% wider and 5 units more, the lamp 0.022 rad each side more; lit 72, 50, 32, 18 and 7% of the light
  they ring), not in one hard line across a storefront or a barrier. Three rings showed as steps. The rings are filled even-odd, so nothing is lit twice and
  the beam's own light is as before; no blur filter (it would cost on every redraw on a CPU canvas). The glow round the
  van was already soft.
- **No tree stands on a wreck** (`PROP_CLEAR`, `FOOT` in js/perspective-art.js): a tree, dead tree or bush is no longer
  grown inside a wrecked car's or a barrier's footprint (plus 10 units) of the drive's own props; grass still grows
  round them. On four drives 97 trees and bushes stood on 509 wrecks and barriers; none now.
- **The road box lets clicks through** (`css/style.css` `.road-box`): the "TO ... ARRIVE" box sits over the road just
  behind the van, where walkers keep up; it has nothing to click, so presses and the aim now go through it.
- **The map's van has its roof gun again** (`Map.drawRoofGun`): the marker lost it when the top-down turret went; it
  now shows the mount and its barrels (as many as Spread Shot gives, as long as Heavier Rounds make them).

**Smaller fixes:**
- A drive that ends inside the page's own frame (at the door, or the wreck's last moment) is no longer drawn once more
  after `stop()` let go of its squares, plants and pictures (`Game.frame`): that one draw made about 17 squares, 115
  plant squares, the card's full-size canvas and the night layer again, 30 to 50 MB of the 200 to 400 the stop frees.
- Seven limits added on this branch carry their `SCALE:` tag (`FOG`, `NIGHT_BEAM`, `EDGE_STEP`, `ROAD_LATE_DAY`,
  `ROAD_DPR_MAX`, `PREP_SECS`, `Streets.CAM`), and docs/SCALING.md's test times are current (npm test about 3.5 min,
  2.4 times 36403cd's 86 s).
- Gone: `DIFF.sideSpawnChance` (read nowhere), `Draw.van`'s dead `aim`, `flash` and `gun` arguments, and Persp's
  `SPAWN` fallback (the fog test passes the drive's own row); three comments that still spoke of the top-down road.

**Tests added or changed:**
- **`tests/validate-drive.js`:** the every-route sweep draws the sign on every frame at Engine Tune 0 (1280 x 800 with
  the page's HUD) and fails if it moves more than 120 px in a frame while at least 90% shown; "road steps" checks that
  16.6, 16.7, 16.8 ms and 59.94 Hz frames run one road step of four drive steps (1/30 s two, 0.1 s six). The sweep
  takes about 6 s more.
- **`tests/validate-scenery.js`:** "release" ends a drive at the door and in a wreck through `Game.frame` (it found
  130 and 192 squares made again before the fix); the governor leaves a 30 fps cap at the richest row after its trial
  and keeps the row that speeds a page up; no tree or bush on a wreck or barrier.
- **`tests/validate-balance.js`:** a clear day-7 cell (danger 4), and the pop-in check: on days 1 and 5 at dangers 2,
  4 and 5 at most 5% of walkers may appear in plain view on the open road (0.5% now; 24% before).
- **`tests/balance`:** days 3 and 7 with their flat targets, `clear` days, the standard errors in the report.

**Still open:**
- danger 5 before day 7 and the other misses above;
- clear days 8 and 9 at dangers 2 and 4 are now somewhat easier than the old road (they sit between days 5 and 10,
  which pass, on the even blend of `roadRow`);
- night and fog drives are still not balanced against the old road.

## Owner decisions: crossover universes (2026-10-17)

Design only; nothing is built yet. The full canon and the build plan are in `docs/UNIVERSES.md`.

| Question | Answer |
|----------|--------|
| What is the option? | A Universe setting: Off / Captain Leo / Fortitude. One at a time. |
| Reskin or add-on? | Add-on. The current story stays canon in every universe; each universe adds its own storyline on top and never edits a base text. Off is today's game. |
| How does it switch? | In Settings, saved per slot, changeable any time. Each universe keeps its own crossover progress. Old saves read as Off. |
| Who is it for? | The same teen players and rules as the base game. |
| Leo: where and when? | The river town is a colony town on Mira-8, next to Mira-9, about 200 years after Mission One. |
| Leo: what caused the Fall? | The Gray: spores of Mira-8's long-dead sky-forest, dug up by miners across the river. The Mirans had warned the colony. |
| Leo: Leo's crew? | Legends from about 200 years ago. Sool the Miran is still alive and is the living link. |
| Leo v1 | Sky (Mira-9), radio (the three-note knock, a Miran voice), journal lines, crew talk, and a Tomas quest chain rebuilding a broken Bolt-model robot dog. No found items. |
| Fortitude: where and when? | Earth, hundreds of years after Book 4. Only Book 1 events are named; Books 2 to 4 happened but are never mentioned. |
| Fortitude: what caused the Fall? | The Waiting Vault across the river: a public cryosleep vault whose timer and cooling failed together. The sleepers woke wrong. |
| Fortitude: the book's characters? | Legends only, never heard or met. |
| Fortitude v1 | Sky, radio (Fortitude-style bursts), journal lines, crew talk, found Book 1 items, and a Pip quest chain decoding the bursts the way Ava did. |
| Endings | Both storylines stay open, like the River Convoy. |
| Quest chains (2026-10-17, later) | Five quests each: Tomas's robot dog (Leo), Pip's decoding (Fortitude). |
| The robot dog (Leo) | Follows you in the yard and in buildings and rides in the van. A weak helper: zaps slow or stagger walkers. Too many bites shut it down until Tomas repairs it at the cabin for scrap. |
| The bursts (Fortitude) | Decoded, they are old Accord records: an automatic Book 1-era archive still broadcasting. Who keeps it running stays open. |
| Mr. Reyes (Fortitude) | Claims descent from Dr. Camila Reyes; unproven and never confirmed. |
| Radio pace | The knock and the bursts come about every 3 days, beside the day's base broadcast. |

Judgment calls (cheap to change):

- **Both origins sit across the river**, because a base note already says the Fall began as "some
  sickness across the river".
- **Mira-8 is Earth-like**, seeded with Earth life, because base texts name birds, fish, the sun and
  a moon. Mira-8 keeps its own small moon; Mira-9 is a separate, huge pale disk.
- **Pip is named after PIP**, the ship's helper on Skip-One (Leo crew talk), to turn the name clash
  into a story beat.
- **The real dog stays** in the Leo universe; the Bolt-model robot dog is a second companion.
- **The Fortitude sky** is the old Indestructium shipyard ring with Mars as a bright point, both
  from Book 1.

### Built (2026-10-17): judgment calls

The design is `docs/UNIVERSES.md` ("How it works, as built"). Cheap to change:

- **Pacing by the universe's own count, not the day.** A ledger line on every second day page, a broadcast on
  every third day the radio hears the news, each in order. A player who switches a universe on late starts at its
  first line, and switching away and back loses nothing. Crew topics and quest days still use the game's day.
- **A crossover quest is its giver's own track** beside the base one (one open on each). The base quest is offered
  first when both could be. Errands still start after the base quest 1.
- **Pip's Fortitude track waits for the Radio room** (`pip-fort-1` when: room radio), since it decodes what comes
  on the radio.
- **The Fortitude keepsakes are Pip's quest objects**, not extra stash loot: the same pickup, tag and backpack
  path the base quests use, so nothing new can break the stashes, and the decoding gives each a reason.
- **The robot dog is named Rivet** (by Tomas, "because it is held together with them"), after Koen's Bolt. Its
  numbers: 60 health, a 6-harm zap every 1.8 s within 4.5 tiles that halves a walker's speed for 1.6 s, 20 scrap
  to fix (`WORLD.ROBO`). It never zaps or is bitten by the tutorial's practice walker. It does not shelter: it stays
  with you in a wave. Shut down, it stays home on trips.
- **Tomas fixes Rivet without a walk**: when you arrive home or a wave is cleared, if the base has the scrap, told
  in that moment's toast. No new crew report (that would need words at six levels for one line).
- **The sky is in the yard only** (not on the road or at the river). Mira-9 sits to the northeast; the ring is
  highest to the north, Mars low to the southeast.
- **Settings line, toasts and the slot summary are one level of English**, like the game's other engine strings.
- **God mode lists a universe's quests only while it is on**, so a quest can never be jumped to where its object
  would not show.

### Notes under the cabin door: Captain Leo (2026-10-22)

**Asked:** "For games in the captain Leo universe or the fortitude universe insert a note that automatically opens
the next 3 time a player logs on. The notes should be about 200 words long each and hint to being in those
universes. By the end of Note 3 it should be clear that you are in that universe." Then: "For Captain Leo only add
the 3 notes. If some content that should have already been read is used, that is ok."

| Question | Owner's answer |
|----------|----------------|
| Which universes? | Captain Leo only, for now. |
| What is a log on? | Once per real day: the first time the slot is opened that calendar day. |
| How long? | About 200 words at levels 4 to 5, following the note range at the other levels. |
| Who writes them? | An unknown writer, left at the base. |
| Hold the existing Leo content back until note 3? | No. Nothing is held back; repeating what the ledger already said is fine. |

Judgment calls (cheap to change), all in `docs/UNIVERSES.md` "The notes under the cabin door":

- **After the tutorial's yard part** (`Tutorial.done("ready")`), so a note never covers a tutorial card.
- **No catch-up:** one note per log on day, even after a gap of several days.
- **Old Leo saves get the notes as read** if they already have Leo day pages (they have seen the storyline): the
  notes are in the backpack, and none opens by itself.
- **The writer is not Sool** (Sool lives on Mira-9). They sign every note with the knock, heard it as a kid, and
  their identity stays open.
- **The note opens before an unread day page**, and the backpack lists it again under "Notes under the cabin door".
- **Engine strings** ("Under the cabin door", "Note 1 of 3 · no name signed") are one level of English, like the
  other engine strings.

## Driving lag on the owner's PC (2026-10-17)

**Reported:** "The driving is lagging a lot." The owner's FPS meter (hardware acceleration on, per chrome://gpu):

| | Paused | Driving |
|---|---|---|
| Frame rate | 28 fps (35.6 ms) | 9 fps (107 ms, the governor's smoothed 114 ms) |
| The page's own draw | 8.1 ms | 12.4 ms |
| Scenery row | 4 of 4 | 4 of 4 |

**Read:** about 90% of a driving frame is outside this code: the browser's raster, compositing and the graphics card.
The scenery governor was already at its thinnest row and cannot help: plants are not the cost. Driving costs about
70 ms a frame more than paused, only 4 ms of it in the page's draw. **Likely cause, not proven on the owner's
PC:** the ground squares. Their upload and smaller copies run on the card after the code returns, so `BUDGET`
(7 ms of the code's own time) lets a fast processor send several a frame. A slow frame lets the van cover more
ground, which wants more squares the next frame. Context: until PR #31 (this morning) only base to grocery used the
angled camera. On the same drive here, the flat camera's code took 1.6 ms a frame and the angled one 19 ms.

**Owner decisions:**
- Make the tile budget react to the real frame time, not just the game's own time.
- Lower the drawing resolution automatically when frames stay slow. This reverses "a dpr that changed with the
  governor was rejected": one resize hitch a row is far cheaper than 9 fps.

**Built:**
- **Squares on slow frames** (`js/perspective-gl.js` `TILE_SLOW_MS` 40):
  - **The interval:** `PerspGL.slowGap` smooths the real frame interval (`g.rafMs`) over about half a second. Not
    counted: pauses, the van waiting at its door, gaps over 250 ms.
  - **The cap:** past 40 ms a frame draws at most `max(1, round(2 * 40 / interval))` squares (2 at 45 ms, 1 from
    54 ms). One hole near the van can still go past the cap, as it can past the time budget.
  - **Not affected:** the van's wait at its door and a drive's first 4 frames.
  - **Threshold:** 40 ms is over a 30 fps cap's 33.3 ms, so Chrome's Energy Saver keeps every square.
- **The resolution governor** (`js/perspective.js` `RES_LEVELS` 100 / 80 / 65 / 50%; `resStep`, `resScale`):
  - **What it scales:** the road's canvas, and with it the card's ground, are drawn at a share of their device px
    (`game.js` resize; the browser scales them up).
  - **What it reads:** the scenery governor's smoothed interval, so the same frames count (no pause, fade, door
    wait or the drive's first 1.5 s).
  - **Stepping:** a row down after 2 s over `RES_SLOW_MS` 36 ms. A row up after 10 s under `RES_FAST_MS` 20 ms;
    that wait doubles (up to 8 times) for a row it had to leave. Each change holds both governors for 2 s.
  - **Applied between frames:** `Game.frame` resizes after the draw that changed the row.
  - **Kept:** for later drives, and outside god mode in `localStorage` `zsr-road-res`, so a slow machine starts
    where it ended.
  - **The minimap** keeps the device's px (`Game.miniDpr`).
- **The FPS meter** adds `squares N/frame` while capped and `pixels N%` below full.

**Measured** (headless Chromium `--disable-gpu`, 1920 x 1080 at 125%, base to hospital, interleaved runs, frame
interval median over the drive's second half). This container has no real graphics card, so these are directions,
not the owner's numbers:

| | Before | Squares cap only | Both |
|---|---|---|---|
| Frame interval | 167-200 ms | 150-167 ms | 83-100 ms |

- **At 1280 x 720 at 100%:** 83 to 50 ms.
- **The resolution row settles** at 50% here.
- **Squares missing under the view:** about 155 a frame before and after. This machine never catches up either way,
  and the cap does not add holes.
- **Tests:** validate-scenery checks the resolution governor (a 30 fps cap keeps full pixels; 107 ms frames step
  it down one row at a time to 50%, holding the scenery governor; pauses say nothing; fast frames climb back after
  the wait) and the squares' cap (none at 33.3 ms, 2 at 45 ms, 1 at 107 ms). `npm test` passes.

**Open:**
- **Check on the owner's PC.** If the FPS meter shows `pixels 50%` and frames still over 36 ms, the next step is a
  cheaper frame (fewer squares kept sharp, cheaper walkers), not more rows.
- **50% looks soft** on a 1080p screen. It is the floor; the owner may prefer 65%.

## Owner decisions: a 3D yard, crew and van (2026-10-18)

The owner asked for every building and sign in the yard to be 3D with views from every side, the crew to
be 3D like the walkers, eight paint options for the van, and a yard van with more angles that looks like
the van on the road (a sloped windshield). Answers to the clarifying questions:

| Question | Owner's answer |
|----------|----------------|
| How do yard props become 3D? | Live 3D models in the comic style, drawn from the player's real angle like the walkers, redrawn only when that angle changes by a step (about 10 degrees), so standing still costs nothing. Not pre-drawn fixed views. |
| Which props? | Every billboard prop in the yard: signs and plaques, the big build props (tanks, towers, dishes, the well, drums, flags, lamps, the scarecrow ...), the porch props (bell, bench, posts), and the chickens and goats. |
| The building shells (sheds, huts, garage, cabin)? | Left as they are: they are already raycast boxes that show every side. |
| A sign from behind? | Text on both sides (it is a reading game). |
| Which characters? | June, Tomas and Pip, the stray dog and Rivet the robot dog. This reverses "The crew stay flat 2D" (Walkers v2, 2026-10-15). |
| How are the crew built? | On the walkers' skeleton: the same ink style and light, human faces (no glowing eyes, no gore), child proportions for Pip, today's outfits and props. |
| How do the crew move? | Smooth animation; they face their task and turn to face the player when talked to; a real run to the shelter and a hunched pose there; they sit on the porch bench and the cabin chairs instead of the floor. |
| Portraits (crew card, tutorial card)? | Stay the 2D comic portraits. |
| How do the 8 paint options work? | Buy each paint style once; the player can switch only among the ones bought. |
| Which 8? | Keep the 6 (Primer Gray, Matte Black, Rust Bucket, Olive Drab, Hazard, Convoy Red) and add a purple and a neon green: **Night Violet** (silver lightning bolts) and **Radioactive** (black toxic drips). |
| What does a look change? | The full look: body, roof, trim and bumper, wheel rims, and the decal on every side and the hood. |
| Price and gate? | Today's prices (20 to 40 scrap and a typing round) and the Garage gate stay. The two new looks need the top Garage level (as Convoy Red does), at 45 and 50 scrap. |
| Where does the new 3D van show? | Everywhere: the yard, River Landing, the road, the garage preview, the title screen and the workbench side view. The map icon stays top-down art with the new paints. |
| Speed? | Small cost, tested: a full yard with the crew out at most 25% slower than today, a heavy wave at most 35% slower, the road no slower; the automatic quality steps stay. |
| Delivery? | Three stages pushed to this branch (van and paint, then the crew, then the yard props and signs), no pull request until asked, a playable test build at the end. |

### Stage 1 built (2026-10-18): the van and the paint shop, judgment calls

**The 3D core (`js/model3d.js`).**
- Models are convex parts of flat faces, drawn with plain canvas 2D calls in the comic style: each face
  lit by the caller's own light, ink on creases (faces meeting at more than 28 degrees), the silhouette
  and part edges, decals and text laid on faces. No WebGL, no images (as for the walkers).
- Parts are ordered by the plane between them (worked out once per model), not by distance alone:
  distance put a wheel over the nose. Only pairs that overlap on screen are compared (a part's box is
  cut at the near plane, never taken as the whole screen), then sorted topologically; a cycle is broken at
  the part on it that waits on the fewest (the farthest of those). Both were needed beside the van's cab,
  where the gun drew over the body. Pairs with no plane fall back to their centres' distance.
- A face another part covers is kept but never drawn (it still orders the parts).

**The van (`js/van3d.js`).**
- One model in the road's units (118 long, 66 wide, roof 50), drawn everywhere the van shows. In the
  yard it sits on its two tiles at 1/62.5 tiles a unit (0.8 tiles to the roof, today's height).
- Cheap where the road needs it: wheels are flat 10-sided discs over a dark well band; bumpers are
  bands; mirrors are thin cards (detail 0 only). Detail 1 drops fine marks (pinstripes, rivets,
  seams, wipers, small gear); detail 2 keeps the body, wheels and plow.
- Gear steps: Ram Plow grows every level (saw teeth from 3, a hazard edge at 5; sized so level 5
  does not take over the picture; its tips show past the mirrors from behind from level 1). Engine
  4 to 5 lights the light bar and adds a second stack. On Convoy Red's pale bumpers the armor-1
  plates are dark steel so the step shows.
- Olive Drab's stencil reads "B-66" with a ringed star on the hood and roof; Primer Gray (no decal)
  gets primer panels so its decal colours are used too.
- Dents (no gore): tier 1 two hollows a side, a claw scratch each side and one at the back; tier 2
  adds more hollows, one on the front and the roof, and grime.
- The yard's van carries a still roof gun built from the gun upgrades, at the road gun's mount
  (`Van3D.GUN`); the road keeps its own aimed gun.

**The paint shop (`js/state.js`, `js/base.js`).**
- `upgrades.paint` stays the worn look's index (every reader of `stats(u).look` kept working);
  `upgrades.paintOwned` lists the looks bought. An old save at paint k owns 0 to k and keeps wearing
  k; no save version bump (the fill runs when the field is missing). `upgradeSave` now also fills any
  missing upgrades key.
- Code that treats every upgrade alike (`canBuyUpgrade("paint")`) points at the first look not owned;
  `buyUpgrade("paint")` buys and wears it. `Upgrades.buy` never buys paint (it had no callers).
- The paint card sits full width under the Garage's preview so the preview stays in view while
  trying looks on; each look is a small side-on picture with its decal, so lightning, drips and
  flames are told apart at a glance. Locked looks can still be pointed at to try them on.
- Wearing a look is free and immediate; buying is a typing round like any upgrade.
- Fixed UI words for the decals (`DECAL_WORDS`), not reading-level text.

**The parked van in the first-person view (`js/modelsprite.js`).**
- A model is drawn squashed sideways exactly as the walls and floor are, so it sits on its tiles and
  matches the sheds beside it (walkers stay unsquashed: they are figures).
- Between redraws the picture is mapped through the model's bounding box from the eye where it is
  now (each column's ray meets the box; that point seen from the old eye gives the picture column and
  the height). The first design (angles scaled about the model's bearing) let the van slide on the
  floor by 8 to 20 px while walking; this keeps visible corners within about 1 px. Turning in place
  is exact and never redraws.
- A face the old picture saw edge-on that turns into view forces a redraw ("fold"), or the van would
  show too narrow at a corner for a few frames.
- Fog and detail go by the eye's distance to the model, so turning never changes them.
- The model governor follows the walkers' governor row (and one row more once the floor's slow step
  fired); model redraws never move the walkers' governor.
- A soft contact shadow is drawn into the picture. River Landing's van tiles now show the turnout's
  dirt (they were grass under the old box). A hurt walker's health bar is not drawn through the van.

**The road, the title, the Garage preview, the workbench, the map (`js/perspective.js`, `js/bench.js`,
`js/sprites.js`).**
- On the road the van is lit by the road buildings' light (their added shade turned into a brightness,
  1 + shade / 128) and fades into the haze by colour as they do. The hurt flash is a red tint.
- Detail by the van's length on screen: full from 140 px, no fine marks from 60 px. The title and the
  Garage preview always use full detail.
- The road no longer draws the old top-down roof picture (its exhaust puff never showed anyway); the
  model costs less a frame than the old textured box did (0.6-0.7 ms against 0.9 ms, headless).
- The workbench shows the van from its right side, a little toward the nose and from a little above,
  with the gun as before.
- The map icon takes each look's decal colours (Convoy Red's flames are now orange and yellow; they
  were near black), bumpers and hubs.

**Polish after the first look (2026-10-18).**
- From the road camera (behind and above) the looks differed mostly by body colour: every look now has a
  design on the roof and on the back doors at detail 1 (Hazard bands and chevrons, Convoy Red flames off
  the windshield and up the back corners, Night Violet a pair of bolts each side of the gun, Radioactive
  sludge rails, a trefoil and drips over the back windows, Rust patches, Olive stars and B-66, Matte Black
  pinstripes, Primer panels). Decals wholly under the roof rack are skipped. A design may lay a piece over
  the fittings (the front bumper's hazard band and B-66 showed under the bumper before). `VAN_OPS` at
  detail 0 rose from 1400 to 1450 (Convoy Red seen from straight above: 1441).
- Armor plates take the paint: steel mixed 55% toward the body colour and 12% darker, with their ink,
  bolts and shade (bars over windows and the grille stay bare steel). Under full armor the van still
  wears its look; before, Armor 4-5 hid most of it under grey steel.
- The Garage's preview looks at the van from the front-left (140 degrees round from behind, pitched
  16 degrees, a narrower 44-degree view so the plow is not twice the tail's size), in the same road
  scene, with the road's aimed roof gun (the model's still gun reads as boxes from the front). It shows the
  van's dents (repairing redraws it). The title keeps its view, pixel for pixel.
- The road's light and ink rule live once, in `js/perspective-buildings.js` (`PerspBuild.LIGHT`,
  `inkW`); the van reads them (an even light if they are not loaded).

**Review fixes (2026-10-18).** A five-angle review with an adversarial check of each finding confirmed 16; all fixed
with a test that failed before:
- Armor 5's roof plates are laid under the paint job, so each look's roof design shows over them (Night Violet's bolts
  had gone under steel). The road check holds every look at 1.5% under full armor and 1% with every upgrade at its top.
- The roof gun's undersides and the drum's inner end are drawn (the yard's eye is below the gun): only faces that really
  sit against another part are hidden; a ray-cast test enforces it. The mirror glint stays inside the mirror.
- `Van3D.sig` names each gun level (two guns could share a model past level 9); every upgrade test reads its top level
  from `Upgrades.DEFS`, and the looks' save order is pinned by name (any price may be appended).
- The parked van: a hurt walker's health bar is hidden only where the van's picture really covers its head (its opaque
  runs per column, read back once per picture and only when a walker stands behind it), and a walker the van wholly
  hides is not drawn (it took live redraws); a window resize redraws a picture that grew; a plowed van maps between
  redraws through its body, not its plow wings (it redrew every frame creeping along it); a face turning into view
  redraws that frame (it showed as a gap for one).

**Measured (headless Chromium, no GPU, a 4-core container shared with other work, so directions):**
- Yard, full build, the frame median against the commit before: standing near the van -11%, walking
  round it +10% (p95 +4%), far +1%, a heavy wave of 30 walkers -0.5% (p95 +4%). Empty yard: within
  -6% to +4% (one p95 +18% walking round it). All inside the owner's bars (25% / 35%).
- Road: the van's own draw 0.6-0.7 ms against 0.9 ms; the road's frame no slower.

**Final review fixes (2026-10-18).**
- Decal lines are cut at the near plane segment by segment (`js/model3d.js` pathOf), as faces and ink edges already
  were. Standing against the van's side, a pinstripe or door seam with one end behind your eye vanished whole (in up to a
  third of headings at arm's length) and popped back as you walked.
- Every look now has a front part, as the owner asked ("a decal on every side"): the grille, the lamps and the bumper
  leave almost no paint on the van's front, so the four looks that had none there lay theirs over the bumper (Matte
  Black's twin stripes, Convoy Red's flames, Night Violet's pair of bolts) or run it down over the grille and lamps
  (Radioactive's sludge from under the hood's lip), as Olive Drab's number and Hazard's stripes already did.
- `DEFS.paint`'s `max` and `costs` are read from `PAINT_LOOKS`, so a ninth look is one row.
- Not measured: with wreckers on the van, each redraw of its yard picture is read back (`getImageData`) for the walkers'
  health bars; cheap headless, untested on a real GPU. Worth a profile on the owner's PC.

### Stage 2, wave 1 (2026-10-18): the crew's and the dogs' 3D rigs, judgment calls

**People on the walkers' rig (`js/walker3d.js` human mode, the looks in `js/walker3d-crew.js`).**
- People are registered with `Walker3D.addHuman` into `Walker3D.HUMANS`, never `TYPES` (the walker tests iterate the
  walkers). Their code lives inside `js/walker3d.js`, since it needs that file's private joints, projection and fit;
  a walker draws exactly as before (a test hashes every walker draw against a fixture recorded before people joined).
- Poses: stand, walk (and the run, `st.run`), talk, work (by job: June gardening on her knees with a trowel, Tomas on one
  knee hammering a nail into a board, Pip writing on a clipboard), sit (on a seat `st.seat` tiles high, or the floor:
  June knees up, Pip cross-legged), read, cower (hunched, hugging the knees or hands over the head). `headYaw` turns the
  head (and 15% the shoulders) toward something while the body keeps facing its task.
- Faces are human: eyes with pupils that blink once a pose loop (never at its ends), brows, a nose, a mouth that opens
  talking, June's round glasses; no glow, no gore, no claws at any setting. Hair: bun, curly, short. Clothes: June's
  open cardigan and gardening gloves, Tomas's rolled-sleeve coveralls (the name patch is a red scrawl, not a name) with
  the red rag, Pip's orange hoodie with the walkie clipped on and the pencil behind the ear. Colours are js/crewart.js's
  (a test reads them from its source), so the 3D crew match the 2D portraits.
- Proportions: grown-ups' heads about 1/5.5 of their height, Pip's about 1/4.5. Each look is modelled about a unit
  tall and drawn `PERSON_H` (0.905 tiles) times `CREW[id].scale`, read from the facts each draw: June 0.81, Tomas 0.905,
  Pip 0.67 tiles. An unknown crew id draws the stand-in "person" (`Walker3D.humanId`).
- Props are drawn with the arm that holds them (or as their own part just before both hands for an open book, the ledger
  on the lap, the walkie in both hands). Working or cowering, June lays her ledger beside her and Tomas his wrench.
- Sitting, the figure's floor spot is under the seat's middle with the feet forward; a seat higher than the legs reach
  (Pip on a grown-up's chair) is lowered to what they reach, on tiptoe first.
- The colour table walkers and people share grew from 16384 to 32768 slots (people about double the colours in use).

**Animals on a four-legged rig (`js/beast3d.js`, the looks in `js/beast3d-looks.js`).**
- A standalone module in the walkers' style (ink outline, flat fills, the same camera-space light, fog steps, detail
  0/1/2, the same `cam` contract), since the walkers' helpers are private. Body plans: four legs, or two legs with wings
  (the hooks are ready for the chickens).
- The dog keeps the 2D picture's sides: the patch over its right eye, its left ear up and its right ear flopped. Fur
  bodies are one inked blob (rump, belly, chest, neck, upper legs); scruff tufts show only from the side.
- Rivet is built from boxes (it reads robot and matches the 3D van); its one side eye became a visor band seen from every
  side; its lights glow unfogged and cut out halfway into "off".
- Poses blend by their parameters through standing (as walkers); the tail wags three times a pose loop in every pose, so a
  pose change never jumps it. Bark lines fly out to both sides when it barks straight at you.
- Box heights: dog 0.40 tiles, Rivet 0.36.

### Stage 2, wave 2 (2026-10-18): the crew, the dog and Rivet in the yard and the cabin, judgment calls

**One pool with the walkers (`js/interior.js` live figures; owners `js/crew.js`, `js/robodog.js`, `js/building.js`).**
- A prop with a `fig` record (`liveFigure`) is drawn as a live walker is: the same canvas pool, redraw cap and near
  places, freed when its prop leaves the scene or is hidden, all of them when you leave. The governor now counts frames
  with only the crew on screen, not only walkers. Without Walker3D's people or Beast3D loaded, the crew and dogs keep
  their flat sprites (a test drops those files and plays on).
- Smooth by default: the heading turns at the look's turn rate, steps follow the distance walked, a pose eases out of
  the old one before into the new one (0.45 s to sit, kneel or get up), a pose loop is 3.5 s, the head turns at 5 rad/s.
  Far figures redraw their idle loop in fewer steps (posts scene: 1.07 to 0.74 redraws a frame).
- Animals get room under their feet for near paws (at most 1.4 times their height); people use the walkers' sizing.

**What they do.**
- Every post has a `face` (the task: a bed, a plot, a note on the wall). Talked to, the head turns to you first; past its
  reach (0.95 rad) the body turns too, in the talk pose; afterwards they go back to the task. A seated crew member stands
  up to talk (the seated pose has no talking mouth) and sits back down after.
- Waves: the crew run to the shelter and cower facing its door; the dog gallops after them and lies low facing it.
- Every repair job uses the hammer kneel.
- The dog looks at you within 2.5 tiles and turns all the way round when petted; it gallops from 1.2 tiles a second (all
  of it by 3.0) and wags harder near you. It never follows anyone onto the bench or a bed.
- Rivet turns to the walker it zaps, flashes when bitten and lies still when off.

**Seats (`CREW_SEATS` in `js/story-crew.js`, read off the furniture: bench 0.154 (0.17 once the bench was 3D, stage 3),
dining chair 0.161, bed 0.32 tiles).**
- June: the porch bench at (6.5, 1.45) (stage 3 stood the 3D bench against the wall and her seat with it: 1.87), facing
  north over the yard. Tomas (Gus's room): the very edge of Gus's bed at
  (22.7, 6.99), facing south, his head turned to Gus's keep-out sign (a figure stands on the floor line at its spot: at
  6.88, 0.12 into the bed, he hung 24 px up the bed's side; review, 2026-10-18). Pip: the chair at (15.45, 2.5) facing north to the
  radio (radio shelf), and at the dining post the chair at (15.45, 3.5) facing west to the table.
- A sitter is drawn 0.05 tiles in front of a chair or bench and 0.25 in front of a bed's edge, so the seat never covers
  them.
- Pip's radio chair is 1 tile from the radio, inside the 1.5 tiles posts keep from the cabin's spots (the post's own tile
  passes). Kept: Pip at the radio is the story, and from the south E goes to the radio by design; you talk to Pip from
  the side (tested).
- The speech bubble's tail (`--tail-top`) and the tutorial's arrow point at the figure's real head (`crewHeadTop`), lower
  when seated.

**Measured (headless Chromium, no GPU, 1280 x 720, every room at its top level, medians of 3 interleaved runs, render
time against 3f897f8).** Crew at their posts in view +9% (p95 +3%); Tomas 1.6 tiles away at the van +14% (p95 +18%);
the crew wandering −2%; a heavy wave on day 20 (about 20 walkers) +2%. Bars: 25% calm, 35% heavy wave. What is left is
mostly pasting the wider 3D pictures (1.2 to 1.3 times as wide as tall, the flat sprite 0.75).

**Known.** A crew member up close costs about 14 to 18% more render: the renderers do not report the area they drew, so
the transparent part of a wide picture is still pasted. In the dining room the table can hide Pip from some angles.

**Review fixes (2026-10-18).** An animal's one-shot pose (a bark, a zap, a bleat: shorter than its loop) starts at its
loop's beginning and breaks off at once into a walk: the dog no longer slides 1 to 2.4 tiles in its braced bark when a
wave starts (it barks, then gallops). Rivet's 3D zap holds 0.7 s (out of a sit, into the zap, one zap: Beast3D's own
timings), so its sparks reach full size (they peaked at 19%). Without the 3D modules the flat crew sprites ignore seats
and sit on the floor at the post, exactly as before 3D.

### Stage 3, the models (2026-10-18): judgment calls

**The yard's props, signs, plaques and porch (`js/yardmodels.js` contract, `js/yardmodels1.js`, `js/yardmodels2.js`).**
- 33 models, each a port of its 2D sprite (same parts, colours and comic ink), built in prop units (1 = the sprite's height
  at scale 1) so the yard's placements stay as they are. A model's +x is its own right, so what a sprite draws on its
  right sits at -x and the front view matches the sprite.
- The view squashes the world sideways (1.4); round things are drawn 1.25 to 1.35 times wider than their height gives,
  so they read round as the sprites did, while every plan stays inside the tile (or foot) its prop blocks.
- Signs and plaques carry the room's name on both faces, fitted to the board (it grows with the text-size setting);
  a wrecked plaque wears the red and white WRECKED tape round its board. Damage tints a build's props toward grime (cracked
  and wrecked) and adds cracks, claw gouges and, wrecked, holes and breakage (a snapped sunflower, slack guy wires, a
  dish knocked askew, a torn flag, a bent whip, a dark beacon and lamp, a snapped pump handle).
- The guy wires are three anchors at 120 degrees, two wires each, inside the plot (the sprite's flat fan reached past
  it). The beacon sits on a short arm off the whip's base; lit it glows at every detail level (it is always small on its
  tower). The well's roof is a real gabled roof on two posts (the sprite drew it round "because a sprite always faces you").
- The water tanks, the yard's biggest builds alone on 3x3 plots, set their own canvas-call ceilings (900 and 700 at
  detail 0); every other model fits the default `YARD_OPS`. The tire stack and the spool keep a plain core drawn at every
  detail with the bulged parts at full detail only.
- The porch bench's seat is 0.17 tiles high (at the porch's scale 0.34): June's seat.

**The farm animals (`js/beast3d-looks2.js` on `js/beast3d.js`).**
- The goat (cream with the brown flank patch, dark horns swept back, a grey beard, side ears the sprite lacks: a 3D head
  without ears read wrong from the front) and the hen (white, red comb and wattle, yellow beak and legs, folded wings, a
  tail fan) at the size the yard stands the sprites (goat 0.66 tiles, hen 0.34). Like walkers and unlike props they keep
  screen proportions (not squashed). Every hen and goat looks alike, as in 2D; the seed varies head tilt and tail.
- New poses appended (the dog's and Rivet's indices unchanged): graze, peck, flap, bleat; a hen's sit settles on her
  belly. The dog and Rivet draw call for call as before (a hash fixture recorded before the change proves it).

### Stage 3, the yard (2026-10-18): judgment calls

**The props, signs, plaques and porch as models (`js/modelsprite.js` modelProps, `js/yard.js`, `js/house.js`).**
- Every yard prop whose art has a model is drawn as it, turned to its plot's front (and its build's own turn); so are the
  porch's posts, bell and bench, turned to face the yard. Solidity, cover, paths, wreck spots and E to read are the
  sprites'. A prop whose model will not build keeps its sprite (logged once).
- Models sort by their own turned footprint, not the tile they block: the guy wires by their tower's tile (they never hide
  a walker), the bench by its back (so a sitter is drawn in front of it).
- A lot sign stands solid across 3 tiles of its lot's front row (a narrower lot: 1); its board is about 2.2 tiles wide,
  capped to that foot at Large and Huge, and its letters widen up to 1.3 times where the board has room. Plaques stay one
  tile wide (their row is often taken: a tank's foot and pipes, a floodlight), so long names read at about 60 to 65% of
  the old billboard's letter height. A trap on one of a lot sign's two new side tiles goes back to stock.
- Props take 0.75 of the walls' fog, so a far prop is not darker than the building behind it. Round contact shadows sit at
  foot height; parts lifted 0.45 tiles or more and the guy wires cast none.
- The lab's level-3 vent moved onto the ridge (the roof's outline cut it); the radio's second level-3 dish faces the plot's
  left. The tire stack and the spool change detail more gently; wreck debris turns with its plot's front; the office
  closet's drum stays a sprite.
- The porch bench stands against the cabin wall (y 1.86), and June's seat moved with it (1.87); `CREW_SEATS.porchBench` is
  the 3D bench's seat (0.5 units at the porch's scale 0.34: 0.17 tiles), and the crew's test reads it off the model.
- Pictures: a model out of view costs one circle test and is never drawn; a picture up to 256 x 256 px is kept while out
  of view, all of them capped at 6M px (24 MB), the longest unused first (peak about 3.1 MB walking). Nothing redraws
  every frame: standing, only the blinking beacons (about 20 in 600 frames); walking, about 1.5 a frame, under the cap.
  `Model3D.text` steps by the text's own size (the van's text looks the same), and `MESH_KEEP` is 128.

**Review fixes (2026-10-19).** Standing on a prop you can walk onto (a stake, the guy wires, books, a can, debris) with
its middle behind you, the picture's map wrapped its two angles apart and every column fell off the picture: the prop
vanished and redrew every frame (in a quarter to a third of facings). The angle is now wrapped as one, and a test stands
on every such prop facing four ways. The canvas sweep builds its oldest-first list only when over budget (it was every
frame). Every lot sign width the yard can put up (each text size on each plot) must be one the sign model is checked at
(the widths were typed in by hand).

**The farm's hens and goats as live 3D figures (`js/yard.js` `ANIMALS`, `b.flock`, `yardAnimate`).**
- Each is a live figure in the walkers' pool (Beast3D's chicken or goat), on its sprite's prop, which stays the fallback.
- At each spot they rest a while (hens 1.5 to 5 s, goats 2.5 to 7 s; the sprites walked on at once) in one of their own
  poses, by weight: a goat grazes (6), stands (3) or bleats once (1: the bleat's own 1.1 s less its ease back out, so it
  never starts over); a hen pecks (6), stands (3), settles down (1.5) or flaps (0.6, 1.4 s). Then they get up, turn to
  the next spot (only once standing) and walk to it (never sliding, never sideways, never turning while sitting, grazing
  or pecking: a test fails when any of these happens), and one standing within 2.5 tiles of you looks at you.
- Hens walk at 0.45 tiles a second (the sprites' 0.6 read as a scurry on the 3D gait's quick steps); goats at 0.35.
- The pens' low fences hide most of them from outside, as they hid the sprites.
- Their pictures redraw at most 15 times a second (`ANIMAL_EVERY`; their place on screen moves every frame), and Beast3D
  now reports the box it drew in, so only that is pasted (its pictures are as wide as every pose from every side, 1.4 to
  1.7 times their height). Measured first, five animals near you redrew 4 pictures a frame and pasted 2.2 ms of mostly
  clear picture (a canvas just redrawn costs its whole size to paste on a software canvas): +51% render looking over the
  pens. A walker or a crew member still pastes its whole picture (Walker3D does not report its box yet).

**Measured (headless Chromium without a GPU, every room at its top level, the crew out, medians of 3 interleaved rounds,
render time against 3f897f8, before the project; mean / median / p95).** Standing +4 / +5 / +5%; turning in place +4 to
+15 / +2 to +19 / +2 to +12% (two runs); walking a lap of the yard past the farm +16 / +18 / +17%; a heavy wave of 30
walkers +4 / +5 / +4%. Standing at the pens with all five animals within 1 to 4 tiles, the worst view: +23 / +26 / +38%
(before the two fixes above, +51%). Bars: 25% calm, 35% heavy wave; the pens close up are the one view at the bar, on a
machine with no GPU (a GPU pastes pictures far more cheaply).

## Owner decisions: field repair and the full keyboard (2026-10-21)

- **Field repair.** Out at a place the van can be patched up to 75% at 5 times the usual price. Asked and answered:
  offered when the player walks out of a building (River Landing's exit is the same hook, so it is offered there
  too); the price is the cabin's base rate (1 scrap per 3 health, at least 5) for the health up to 75%, times 5,
  even when the Garage makes cabin repairs free; the prompt tells the player it costs 5 times more.
  Judgment calls: offered only below 75% (nothing to buy above it); the cap is 75% of the trip's own ceiling, so a
  hungry trip patches to its lower ceiling; paid from this trip's scrap first, then the saved scrap (the HUD shows
  them as one number); not committed mid-trip, it is saved with the trip at home like the trip's scrap. Short on
  scrap, the prompt still shows with the patch button greyed out, as the yard's "Fix the van?" does.
- **The typing diagram reaches the right edge.** [ ] \ after P, ' and Enter after ;, and Backspace over the right
  end of the top row (there is no number row), all right-pinky colors. Show only: no drill uses them, so the
  stages and saved progress are unchanged. The right Shift widened so all three rows end at the same edge; the key
  size's width bound went from 6.8vw to 6vw to fit 13 keys a row.
- **A slider for how much to repair (2026-10-21, later).** Owner: "choose how much they want to repair the van via
  sliding", on every paid repair (asked: the trip patch, the yard's "Fix the van?" and the Garage tab). The slider
  picks the health to fix up to, in whole points, from one above today's to the top (full at the cabin,
  fieldRepairCap on a trip); `State.repairRange` gives all three their range, start and price. Judgment calls: it
  starts at the most the scrap on hand pays for (full when it can), so a player short of a full fix can still buy
  part of one instead of seeing a greyed-out button; the per-repair floor (repairMinScrap, times fieldRepairMult on
  a trip) still applies, so many tiny patches cost more than one big one; free Garage repairs have no slider; the
  dialog focuses the slider so the arrow keys move it.
- **The crew shut the cabin door behind them in a wave (2026-10-21).** Owner: "When the crew runs inside during a
  wave make sure they close the door." They already shut a door they opened themselves; now, running to the shelter,
  an outer cabin door they pass that you left open is shut behind them too,
  by the same rule (once they are clear, nobody is in the doorway, and you and the dog are not right at it).
  Judgment calls: only doors they actually run through, so a back door nobody uses stays as you left it, and so does
  every door when the crew were already inside; a broken door cannot shut; inner doors are left alone (the shelter's
  has its own rule); in the calm an open door you left is still yours to leave open.

## Judgment calls: the game audit (2026-10-22)

The owner asked for a full audit of where the texts and docs disagree with the game, with a fix for everything the
evidence settles. The report, with every open question and a proposed fix for each, is `docs/AUDIT.md`. The calls
below were made during the audit, where verifiers split on the same pattern in different buildings.

- **Walkers in buildings stand until they wake.** Texts that said walkers pace, drift, roam or wander before they
  hear you were reworded to match the engine (every building walker starts asleep and still, js/interior.js), in
  every building but the mall, whose crowd loop is an open question for the owner (docs/AUDIT.md). This closes the
  "text claims the engine still does not keep" list of 2026-10-15 (Walkers v2). If idle wandering is ever added
  to the engine, the old wording can come back.
- **Signs hang beside doors, never on them.** tests/validate-world.js puts every sign on a wall tile, so texts and
  facts that put a sign on or over a door now say beside or by it.
- **Jo's antenna on the Water Tower is built.** The owner approved it as built for the art (2026-10-17, the Water
  Tower row: "(all built)") and five of six levels of Priya's note say so; the level-6 sketch note that called it a
  plan, and level 4 of Priya's note that said "we never finished", now agree.
- **DESIGN.md stays a log.** No earlier entry was rewritten; the corrections below point at the old lines instead.
- **Compass words.** A bare bearing the map contradicts by 45 degrees ("Station 12, the fire station north of
  here", which is northeast) was fixed in the fact and all six levels. Route and idiom uses ("north up Hill Road",
  "gone north to the Public Library") are left for the owner (docs/AUDIT.md, Compass and left/right words).
- **Fix all says what it fixes.** The office computer's three Fix all buttons (fence, cabin, builds) read "Fix k
  of n for M scrap" when the scrap covers only part; the partial fix itself is unchanged.
- **The Hollises' garden.** Kate's note asks the crew to keep the garden going, so June's garden topic now says the
  cabin has a garden "again" at every level, and STORY.md says the Hollis beds had gone to bare dirt.

### Corrections to earlier entries

These earlier lines no longer match the game. They stay as written; the game is as described here.

- **Why caches need the note** (Judgment calls, 2026-10-12): the main note "also reveals the next place" usually,
  not always. Four end-of-chain places (St. Anne Annex, Ridge Lumber, Northgate Mall, the Public Library) reveal
  none.
- **Why the fence is patched between waves** (2026-10-12): superseded. The fence never patches itself. A hole stays
  until it is paid for (1 scrap): E at the gap, Fix all at the office computer, or Tomas in the calm. Building
  Walls up rebuilds the whole fence (GAME_SPEC, The fence, traps and kits).
- **Why dead ends scale with grade** (Reading expansion): levels 1 to 3 get two dead-end notes (the lock decoy among
  them), levels 4 and 5 three, level 6 four: (2, 2, 2, 3, 3, 4), as js/story.js and GAME_SPEC have it.
- **Yard lots became plot signs** (Merging the bigger buildings): walking up to a plot sign and pressing E opens its
  panel; E or walking off closes it.
- **Not in this drop**, painted text: text painted on signs, walls and landmarks inside the buildings does not grow
  with Huge text, but the yard's lot signs and plaques do (`SIGN_SCALE` in js/yard.js).
- **Not in this drop**, profiles: per-player profiles came as the four labeled saves, each with its own settings and
  tutorial progress. A parent view of words read is still not built (`stats.wordsRead` is counted per save and
  shown nowhere).
- **Rivet's zaps** (crossover universes, 2026-10-17: "small zaps that slow or stagger walkers"): as built, a zap
  slows a walker; it does not stagger it.
- **Poses** (smoother corners, 2026-10-16): a road walker claws for 0.4 s after hitting the van, while its 1 s hit
  cooldown is still above `CLAW_HOLD`, which is 0.6.

## Owner decisions: audit follow-ups (2026-10-22)

The owner read the audit's open list and asked for items 1 to 9 and 11 to 17 to be fixed, choosing where a choice
was needed (item 10, the last working van, stays open). docs/AUDIT.md lists them under "Decided by the owner and
fixed".

- **The ledger agrees with the radio.** A Radio room can be built by day 4 or 5, so journal day 11 and Pip's pip-t6
  now say Jo talks on the radio from a rooftop, not that people only say so. The day-22 page says Ruby went looking
  for Dev, in the past, so it stays true when it repeats after the radio has her safe with him.
- **Repeating pages are habits.** Entries 21 to 30 repeat every ten days, so day 21 (June reads the five rules on
  the door out loud) and day 24 (Pip keeps the ledger on cold mornings) describe what they do, not a first time.
- **Day 4 is the biggest wave yet, not the first.** Waves start on day 1, so day 1's page no longer says nothing
  came, and day 4 is the biggest group so far (levels 3 and 6 retitled "The Biggest Wave Yet").
- **Ruby went back east.** Radio-16 says Ruby had gone back east to scout Ridge Lumber when Dev's message reached
  her, which is why she still needed the message after Rosa told her where Dev went.
- **Tomas stops hoping once the radio says Mr. Ortiz is safe.** Owner: "Hide it after radio." A new crew `when` key,
  `radioBefore: n`, tells a topic only while fewer than n broadcasts have been heard (`radioHeard`, js/crewstate.js);
  tomas-t5 has `radioBefore: 15`, radio-15 being Theo saying Dev and Mr. Ortiz are staying with him. Nothing new is
  saved. Journal-9 is written once, on day 9, before radio-15 can play, and stays as written.
- **Nurse Ada wrote the St. Anne Annex door note.** Owner: "Nurse Ada." Doc Lin never reaches the hospital, so the
  door note is Ada's, who stayed inside, at all six levels; where it speaks to Lin, Ada is still waiting for her.
- **Sergeant Vega is she.** Owner: "She." Level 6's radio-30 now says "her", and STORY.md's people table records it.
- **The convoy's vehicles have no set jobs.** Owner: "No roles." The firehouse plan at levels 4 to 6 and Chief
  Dunn's level-4 broadcast no longer say which vehicle carries whom or hauls what, and Kate's fridge note no longer
  calls the trucks Vega's (they are Chief Dunn's fire trucks; Vega has a van). The base facts about the boats (ten
  people and their bags each; not enough boats yet) stay.
- **June's first-aid book line is one story.** Owner: "Tomas, late night." At every level the june-4 journal line
  ends with Tomas finding June still reading late and June answering as a student. Judgment call: level 1 is at its
  word limit and must name June, so it says only "Tomas calls me Student June." It is words only, not a fact. The
  june-2 line's per-level tails were left as they are.
- **The pharmacy's decoy sticky note is neat ink at every level.** Levels 3 and 5 had pencil or bubbly writing; they
  now match levels 1, 2 and 4.
- **The robot dog's battery is nearly dead, not dead.** Owner: "Nearly dead battery." Quests 1 and 2 have the dog
  stand, sit and beep, so quest 3 says the old battery is nearly dead and only a Bolt-model cell fits it; levels 4 to
  6 say it wakes for a minute, then slumps, instead of calling it a statue.
- **The Fall began as a sickness across the river, in the base game.** Owner: "Add to all levels, but not the
  Fortitude/Captain Leo universes." Dev's shift list at the Gas-N-Go (gasngo-dead1) has a new last fact, "Ruby's
  call was about the news: some sickness across the river. Probably nothing.", and every level carries it. The
  crossover texts were not touched; UNIVERSES.md says which parts are base facts.
- **Mr. Reyes's topic is written.** Owner: "Write the topic." Tomas's tomas-fort-t3 (Fortitude, day 9 and 2 stars)
  tells that Mr. Reyes of Reyes Hardware says his family goes back to Dr. Camila Reyes; nobody can prove it either
  way, and Tomas likes the story, true or not.
- **Strict eight-way compass for these two.** Owner chose northwest and northeast where the map says so: the class
  went northwest to the Public Library, and St. Anne Annex is northeast up Hill Road from the Water Tower. This
  narrows the compass call earlier today for these two; the other route and idiom uses stay open in docs/AUDIT.md.

## Owner decisions: audit items 18 to 45 (2026-10-22)

The owner answered the rest of the audit's open list (item 10, the last working van, stays open). docs/AUDIT.md
lists every answer under "Decided by the owner".

- **The Well adds on top of the Water room.** Owner: "Well adds on top." Yard healing (`footRegen`) now stacks
  across rooms, like food and medicine (`ADD` in js/state.js effects()), and the Well gives +1, +2, +3 instead of
  2, 3, 4. With Water 1, which the Well needs, the yard heals at 2, 3, 4 as before; with Water 3 it reaches 6. The
  computer's Well lines and GAME_SPEC say so. The balance harness never builds the Well, so `npm run balance` is
  unchanged.
- **Yard signs say what the yard builds.** Owner: reword the signs (Well, Water) and add a tank (Garden). The Well
  is a roofed well with a crank at level 2 and a hand pump with a trough at level 3; the Water room's first build
  is three rain barrels under funnels, with a filter on the tap; the Garden has two raised beds, and at level 3 a
  greenhouse and a water tank, which the yard now draws (a small yTankStand in BUILDS.garden).
- **The garden is in front of the cabin.** Owner: reword the texts. Every text that put it behind the cabin or
  house now says in front of it, where the plot is.
- **The armor plate's chalk note says "a door".** Plates go into fence walls and cabin doors and windows, not the
  van.
- **Kate's note is on the fridge.** Owner: draw it there. A new 'fridge' note kind (js/houseart.js) draws the note
  under the orange fish magnet on a fridge set into the kitchen wall; the free-standing fridge prop is gone and a
  counter stands in its place, so the kitchen's solid tiles (and the cabin raid's seeded spots) are as before.
- **The cabin has a woodstove.** Owner: add it. hWoodstove stands against the living room's west wall by the
  armchair. The chimney the audit cited is drawn only on the town map's cabin.
- **The house notes are fifteen, not one per room.** Owner: correct the docs. STORY.md names the five rooms
  without a note (the hallway, the second bathroom, and the office, linen and toy closets). The earlier line "on the walls of every
  room" (the walk-in cabin, 2026-10-13) is superseded by this.
- **The pump house holds a second water filter.** Owner: add it. "waterFilter" is appended to the Water Tower's
  cache and a fourth cache tile sits at (16,4), after the others in reading order, so old saves keep their spots.
- **Theo's "crates near the big red wheel" stays.** Owner: leave it (ambiguous, not wrong).
- **Ridge Lumber's boats are out of sight.** Owner: reword. Levels 5 and 6 keep them out past the log pile, beyond
  the back fence, under tarps; nothing says the player has seen them.
- **The quest-2 jar shows its sensor.** Owner: draw it. A new sensorJar kind (js/crewart.js) is used by Tomas's
  Captain Leo quest; Rosa's jar of beans keeps the old kind.
- **The kiln padlock takes a code.** Owner: reword. No level calls it a dial, wheels or something to spin.
- **Mars sits east-southeast.** Owner: change the doc. UNIVERSES.md now matches the art (az PI/6); the earlier
  "Mars low to the southeast" (crossover universes, 2026-10-17) is superseded.
- **Fix all braces cracks too.** Owner: "Code follows the spec." The computer's fence row counts holes and cracked
  segments, Fix all prices both and mends holes first, then braces cracks, as far as the scrap goes; the yard's goal
  line counts cracks too. One under-half rule, fenceCracked() in js/yard.js, serves E, Fix all and the computer.
- **Tomas fixes only broken doors and windows.** Owner: "Broken only." His cabin job no longer spends scrap on a
  door or window that is merely cracked, which now waits for E or the computer, as his lines and CREW.md always
  said.
- **The mall: every walker near you turns.** Owner: soften the text. The guard's notes, the radio and the level-6
  tip no longer say one sprint turns the whole floor; "walk, and most of them stay put" stays.
- **Road screams stay as they are.** Owner: leave it. On the road a scream still reaches about 10% fewer walker
  tiles than GAME_SPEC's figures (the 56-unit road tile); nothing was changed or noted elsewhere.
- **Left or right wall, with a landmark.** Owner: allow it. STORY.md and TEXT_GUIDE.md now allow "the left or right
  wall as you walk in", always paired with a landmark; a bare "left of" or "right of" is still out.
- **Level 1 may quote lists and use greetings.** Owner: allow them. TEXT_GUIDE.md now lets a level-1 note quote a
  board or a ledger as list items, and use greetings and sign-offs ("Reyes here.", "Theo out.", "Good reading.").
- **Side buttons, the Settings line and .claude/settings.json stay.** Owner: keep touch support; keep the earlier
  Settings call; leave the permission file.
- **econ.js was a one-off.** Owner: say it was not kept. The balance files say the per-day loadouts came from a
  one-off script that was not saved, and the loadouts table in tests/balance/loadouts.json is the record. The
  earlier claim that a player first goes to a danger 5 place on day 17 rests on that table.

### Follow-ups to this morning's owner fixes

A read-only verifier pass checked the first sixteen owner fixes again; these are the calls it led to.

- **How it works no longer says nothing came on the first night**, at any level, to match journal-1.
- **The convoy's "no roles" now holds everywhere**: Vega watches from the road, Lin and Luis ride "with the
  convoy", Dunn's list saves seats without trucks, Ortiz fixed "both of the station's fire trucks", and Dunn's
  level-6 plan has the boats carry people and their bags along the river.
- **Mr. Reyes's family story is past tense and needs his door note.** His store is overrun, so tomas-fort-t3 says
  he always told everyone, and it waits for the hardware-door note (the crew name a place only once a note or the
  ledger has), besides day 9 and 2 stars. The earlier entry's "(Fortitude, day 9 and 2 stars)" is superseded.
- **June answers as a student at level 5 too** ("Near midnight Tomas found me there"), and each level keeps its
  file's own way of quoting speech. The earlier entry's level-1 judgment call stands.
- **The radioBefore key is range-checked and tested** (validate-world, validate-crew).

### Follow-ups to the answers on items 18 to 45

A second read-only verifier pass checked the answers above; these are the calls it led to.

- **The mall, everywhere.** The radio-9 fact now says the walkers near anyone who runs come running, and the mall's
  door notes (levels 4 to 6), radio-9 (levels 2, 3 and 6), Mrs. Greer's radio-26 and Luis's patrol log say the same:
  the crowd drifts together, but only the walkers near a runner turn.
- **No convoy roles, the last ones.** Vega's level-6 note no longer has the boats float the river where the road
  fails; Carla's level-5 sketch counts the boats, the trucks and the van together for the chief's list; level-5
  radio-25 just says there are not enough boats.
- **The Water room's lines name the Well.** At levels 2 to 6 the computer's Water lines give the room's own rate
  "plus what the Well adds", since yard healing now stacks.
- **The yard's goal line sees a crack at once.** It refreshes the moment a fence segment drops under half
  strength; Tomas's fence job, his tip, the fence's cracked look, E and Fix all all use the one fenceCracked() rule;
  a test pins that Tomas leaves a cracked window alone.
- **Small level drift cleared**: one crank origin (a bicycle part), two beds where the signs said one, no gate the
  yard does not draw, the pump stands beside the well, Mr. Reyes's family claim stays his at level 1, and the
  armor plate's second tag no longer mentions driving.
