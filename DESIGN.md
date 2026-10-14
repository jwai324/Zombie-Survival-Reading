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
- **Cheats:** can't die (no harm to you, the van, the fence or the cabin; booby traps only toast),
  hold the calm, start a wave now, clear all walkers, heal to full.
- **Not in it, by the owner's choice:** opening caches or stashes (the lock prompt's own "god mode"
  phrase, js/locks.js, still opens any lock), showing lock answers, and setting room levels.
- **Judgment call:** a lock prompt must be closed (Esc) before the menu can move you, because the
  prompt closes only through its own keys.

## Owner decisions: the radio in the dining room, a tower in the yard (2026-10-14)

| Question | Answer |
|----------|--------|
| Where is the radio? | The whole radio shelf (the radio and June's ledger) moved from the living room to the dining room. Pip's radio post moved with it. |
| What does it do? | Each day's broadcast waits there: E tunes in (it is no longer on the arrival page, which says where the news is). Once heard, E opens the journal and every broadcast, as before. Before the Radio room is built, E there reads the journal. |
| Does it change with the Radio room? | Yes. Level 0 a dead radio; 1 the dial glows; 2 a ham set and speaker, and Pip's map and list of voices on the table; 3 a mic, headphones, an ON AIR light, and a cork board of the town in the corner. |
| The yard | Tower only, on the same 3x3 plot: a timber tower (about 2 tiles), a steel lattice on guy wires with a dish and a beacon (about 3.6), a red and white broadcast tower with two dishes, two beacons, an equipment hut and solar panels (about 5). |
| Judgment calls | Only the newest day's broadcast waits: an older one never tuned in to shows with its day. Old saves (no `tuned` field) count every broadcast as heard. The radio's words count toward words read when it is first shown. |
