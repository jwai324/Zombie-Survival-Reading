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
| What else does E do inside? | Pantry: food and storage. Radio shelf: past days. Typewriter: typing practice. Big bed: full health for a minute of the calm. |
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
- **Walkers and the van stand up in the art the game already has.** Walkers are the interiors' standing
  sprites (two walk frames, the hit flash), a little over life size so one down the road still reads as a
  target. The van's walls are the yard van's faces (cab, body with its door and number, the back doors,
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
