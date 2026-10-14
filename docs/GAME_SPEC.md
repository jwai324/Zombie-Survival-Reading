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
   phases: **calm** (no walkers, 4 to 7 minutes; go inside to build, or leave in the van),
   then a **wave** that is sometimes nothing, sometimes a few walkers, sometimes a lot.
   The dinner bell on the porch calls the next wave at once; gunshots in the calm bring it
   sooner. Walkers claw through the fence; the Walls room makes it stronger.
   The cabin (v3, 2026-10-13) is the Hollis family's house, walked into from the yard,
   laid out from the owner's floor plan: porch, foyer, office, dining room, kitchen with
   four cabinet runs and a pantry, ping pong room, living room, master bedroom and bath,
   three kids' rooms, a second bath, closets and a rear play room. The office computer
   opens the build menu, which pauses the yard: upgrade rooms with items plus scrap, the van
   and gun in the garage, the doors and windows in the House tab. The pantry lists food and
   storage, the radio shelf shows past days, the typewriter is typing practice, and the big
   bed heals fully for a minute of the calm. The computer, radio shelf and typewriter wait
   while a wave is on. Doors open and shut with E; walkers break shut doors, smash windows
   and climb in, and walk through open doors. A quarter of each wave's walkers make for the
   cabin, break in and wait inside until you come for them. The base is the only
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
   shelves and floors; a locked cache room holds the best items and opens only when you do
   what its note says (see **Locks** below). Scrap piles give scrap. Press E at the entrance
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
  anytime; it changes words, never facts. The one exception is June's first-run tutorial:
  one level-1 text for every reader (owner decision, 2026-10-14).
- No questions anywhere.
- **Backpack**: every note read is kept with its title, the location, and where in the
  building it was found. Opens from the base, the map, and inside a building (pauses).
- **Why read**: the door note says how many walkers and where the items are, by landmark;
  the inside note says how to open the cache (a code, a stuck lock's moves, which drawer, which
  alarm button; the lock holds you to it), what a mistake costs, what is
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
| Water | Faster health regen in the yard (without it the yard heals 1 per 15 s; never on the road or in buildings); level 3 starts buildings at full health |
| Garden | Food per day (each trip eats one food; no food means a weaker van) |
| Radio | Reveals locations; later shows which still hold items |
| Medbay | Less on-foot damage; one revive per trip; less van damage |
| Archive | Notes show what is left at a place; map shows caches and stock |
| Well (late) | Needs Water 1. Clean water: faster yard regen, full health on entry at level 3. The Farm and the Lab need it |
| Farm (late) | Needs Garden 2 + Well. Crop field, chicken coop, goat pen: 2 / 4 / 6 food a day on top of the Garden |
| Lab (late) | Needs Medbay + Well. Makes medical kits: one every 2 days, then 1 a day, then 2 a day |

A level can carry `requires: { room: level }`; the build button says which room to build first.
Food and medicine from different rooms add up; every other effect takes the best level.

## The yard shows the base

Every room except Walls has its own plot in the yard (55 x 68 tiles, 210 fence segments; the
cabin, about 25 x 26 tiles, sits at the south end).
Level 0 is a staked lot with the room's name on a big sign; levels 1 to 3 are distinct,
bigger builds made of walls, roofs, see-over low tiles and props, with a name plaque and
stars. They go up the moment the room is built. Builds are solid: walkers path around them
and they are cover. Walls levels 0 to 3 change the fence (pickets, braced planks,
corrugated metal with spikes, concrete blocks with razor wire, each with a cracked look).
The cabin's doors (a bar, steel sheets, a security door) and windows (boards, shutters,
steel plates) have their own levels in the House tab. The van in the
driveway shows armor plates, the ram plow, engine gear (rack, exhaust, snorkel, light bar)
and the paint. The van's roof gun on the road shows Heavier Rounds (longer barrels, a brake
from tier 3), Rate of Fire (vented jacket, drum, cooling fins, a bigger drum, copper at the
top tier) and Spread Shot (one barrel per round). The gun in your hands shows its own mods
(see Guns). A light wave comes from two sides, a heavy one from every side.

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
  (at least 5), free once the Garage room is built. Do it in the cabin's Garage tab, or at
  the van: starting it with less than full health asks "Fix the van?" first (Fix it / Go as
  is; Esc stays in the yard). Short on scrap, the fix button is greyed out.

## Driving: lanes, signs, side streets

- Every place sits at the end of its own short drive off the corner where its roads meet (a
  place with one road, at the end of that road). A drive starts in the first place's parking
  spot and ends in the destination's.
- The van drives in the left of its two lanes; past side streets that lane goes straight. A
  turn into a side street on the right uses the right lane; on the left, a turn lane that
  opens on the far left. At a junction there is one lane per road out, left to right in
  the order the roads turn, each with a painted arrow, and the sign says where each lane goes.
  There is no straight-on lane there: the right lane takes the road furthest right, extra
  lanes open to the left, and the van's own left lane takes whatever road it points at (with
  two roads out, the left one).
- Decision points along a route, in order: the corner of the place the drive sets out from
  (the van drives up that place's own drive to it, with one lane per road out; a place with one
  road starts on it), then side streets (dead ends, no through roads, closed roads) and real
  junctions; at the corner of every place the route passes (Home Base too) its drive is one more
  lane (a wrong one), and the last decision is the destination's corner, where its drive is the
  right lane, then the van parks at the door. A place with one road has no last decision: the
  road runs on to it. Signs name a place only when the player knows it; otherwise the street
  (a drive of an unknown place: Parking lot).
- At Huge text the road's top row keeps to one line (van health and pause, plus scrap from
  1000 px wide), and signs shrink to fit under it.
- The lane the van is in when it crosses the white stop line decides. A wrong lane drives a
  little way down the wrong road, then a card says what went wrong ("Wrong way! That road goes
  to ...", "That is ..., not ...") with three choices: try again (the drive restarts from where it
  set out; damage, scrap, kills and miles stay), the town map (pick any drive from where the van
  set out), or go back to where the van set out (a building: straight back in as you left it;
  the cabin: back out of the trip, as the map's yard button, and no day passes).
- The roof gun fires at the pointer; shots carry the van's own speed, so on screen they fly
  straight at it. Aim assist (Settings) bends a shot only onto a walker right under the pointer;
  with no pointer yet it takes the walker closest to straight ahead.
- The minimap (top left, under the HUD's top row) turns with the van, shows known roads, side
  streets and places (each one's building, as on the city map, at the end of its own short drive), and flags
  the destination. It never draws the route.

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

## River Landing and fishing (2026-10-14)

- Frog Lane leaves River Road at a corner with no place on it (`WORLD.JUNCTIONS`), runs paved
  through the corner, then dirt, to a turnout at **River Landing** (an outdoor place: no building).
- Chief Dunn's fishing pole lies in Station 12's equipment bay; its tag (read on pickup, kept in the
  backpack) reveals River Landing. It is a trip item until home, like a gun.
- At the bank, first person: the dock, a sign, the chief's note on the dock post. 6 (or Q) holds the
  pole; click to cast onto water, wait 7 to 20 s for a bite, click within 2 s to land it. Taking a
  gun props the pole on the bank (line in); a bite then rings its bell until the pole is taken back.
- 1 food per fish, 4 a trip, then the river rests 3 days (`WORLD.RIVER`). Walkers come out of the
  trees every 45 to 90 s, one or two.
- Cargo food (crates and fish) adds to the crew's food at home.

## Guns

| Key | Gun | What sets it apart | Hidden at danger |
|-----|-----|--------------------|------------------|
| 1 | Pistol | Carried from day one. Steady, cheap to mod | (start) |
| 2 | Double pistols | One in each hand, fired left and right in turn: twice the rate, a little wilder | 1 to 2 |
| 3 | Machine gun | Hold to keep firing; loud | 2 to 3 |
| 4 | Heavy machine gun | Belt-fed; every round goes through two walkers; you walk 20% slower; the whole block hears it | 4 to 5 |
| 5 | Bow and arrow | Hold to draw, let go to shoot; a full draw hits hardest; silent; longest range | 2 to 4 |

- A new save hides each found gun in a random building within its danger range, no two in
  the same building. Inside, it lies on a floor tile well away from the door, the same tile
  on every visit. Walk over it to pick it up: it goes straight into your hands.
- A gun picked up on a trip is a trip item: it is yours once you get home, and a death
  puts it back where it was. Switching guns: 1 to 5, Q, or the mouse wheel.
- Every gun has a range (nothing farther is hit), a spread (random aim error, wider while
  moving), and a noise radius (walkers that close hear the shot; the bow makes none).
- **Mods**, in the cabin's Weapons tab: Damage (+25% a tier), Range (+25%), Fire rate (12%
  less time between shots; the bow draws and nocks faster), Accuracy (30% less spread).
  Three tiers each, paid in scrap (dearer for the bigger guns), each one a typing round at
  the workbench. Only guns you own can be modded.
- **Every mod tier shows on the gun in your hands**, and on its picture in the Weapons tab:
  - Pistol and double pistols: Damage adds a compensator (longer, more ports, then a gold
    barrel); Range the barrel's crown and fiber-optic sights, a long slide, a red-dot sight;
    Fire rate windows in the slide, front serrations and top cuts, a red slide release and
    trigger; Accuracy a laser under the frame, a light, the laser on (a beam to the crosshair).
  - Machine gun: Damage a ported brake, a fluted heavy barrel, a boxy brake; Range a longer
    barrel, a scope, a longer barrel and sunshade; Fire rate a see-through magazine, two
    clamped together, a drum; Accuracy a tan handguard and foregrip, a laser, the laser on.
  - Heavy machine gun: Damage a longer flash hider, a brake, a bigger brake and red-tipped
    rounds; Range a longer barrel, a scope, both longer; Fire rate a bigger ammo box, a heat
    shield on the shroud, copper shield and cooling rings; Accuracy as the machine gun.
  - Bow: Broadheads a three-blade head and a cresting wrap, a carbon shaft, a big head on a
    brass collar with long vanes; Stronger limbs a laminate stripe, thicker dark limbs, black
    limbs with white tips; Draw speed string silencers, a quiver of three, five and a brass
    nocking point; Sight pins a sight ring with one pin, three, five and a stabilizer.
- The van's turret on the road is a separate gun, upgraded in the Garage tab.

## Reading expansion (2026-10-13)

Every level carries at least four times the reading it had before. All of it is native to
the game and none of it is quizzed.

- **More notes per building.** Besides the door note and the main note: a two-note trail
  (`trail1` says where `trail2` is; `trail2` appears once `trail1` is read and says where the
  key is) and dead-end notes placed by reading level (2 at levels 1 to 3, the lock decoy among them, 3 at
  levels 4 and 5, 4 at level 6). Some dead ends are decoys: wrong codes, emptied rooms.
- **Stashes and the key ring.** Every building has a small locked stash room (`Q` door, `k`
  spots in its floor plan, two good items that never come back). Its key is hidden in another
  building (`y` spot), visible once that building's `trail2` is read. The notes say where by
  that building's landmarks and rooms, like every other note inside. `KEYS` in `js/world.js` is a ring
  through all fifteen places. A key picked up is a trip item: yours once home, lost on death.
  Keys are listed in the backpack and the cabin's stock tab by how they look (where each was
  found, its tag, the clue note), never by what they open. At a stash door you pick which key
  to try; only the `trail2` note says which key fits. A wrong key jams the stash (a crowbar opens
  it), snaps off and is gone, or just will not turn, as that note warns (`stashFail`).
- **Locks** (`LOCKS` in `js/world.js`, `js/locks.js`). Every cache lock is real. Its answers are
  rolled per save and filled into the notes' `{placeholders}`, so they cannot be shared or
  memorized from another save. Kinds: a keypad code; moves pressed in order on word buttons (up,
  right, lift, pull, twist left ...); a search at a fixture beside the main note (which drawer,
  watering can, key, breaker box or book) that finds the door's key or badge; an alarm panel on a
  named wall (press the right button first). A mistake costs what the note warns: the alarm
  (walkers pour in, through the way out too, so there is no leaving: you go down), a booby trap
  (you go down), or a jam (only a crowbar opens it; crowbars are built at the workbench, 20 scrap,
  carried on every trip, spent on use). Jams and broken keys are saved. Every building's `dead2`
  note is a decoy with a clearly different wrong answer, at every reading level. Typing "god mode"
  within 2.5 seconds at any lock prompt opens it.
- **Wall signs and graffiti.** Four per building (the layout's `signs`: a wall tile and the
  face they are painted on). Walk up and look at one and a panel shows it; no key press, no
  pause. Extra notes stand on the layout's numbered `spots`.
- **Item tags.** Every item has two tags (label, sticky note). On pickup the tag shows for
  as long as it takes to read at the reading level's pace (60 words a minute at level 1 up to 150
  at level 6); E closes it and its "Picked up" message early. It is kept in the backpack.
- **Plot signs.** Every room's plot in the yard has a sign (a plaque once it is built). Walk
  up to one and press E, and a panel says what it is, what the next level needs, and why it is locked (the
  same facts as the cabin's build menu); the outdoor rooms (Garden, Farm, Well, Water, Power,
  Radio, Lab) also have a hand-painted text for the empty lot and each built level.
- **The day page.** Day 1 and every arrival home show a page: a recap of the trip (items,
  scrap, notes, keys, food, the nearest build), June's journal entry, and, once the Radio room
  is built, one broadcast. Thirty of each are written; after day 30 the last ten repeat. Every
  page is kept in the backpack.

## The crew at home base (2026-10-14)

June, Tomas and Pip live at the cabin. The full design and the contract between its files is
`docs/CREW.md`; the owner's answers are in `DESIGN.md`.

- **Wandering.** In the calm each walks between their own spots in the yard and the cabin
  (`CREW[id].posts`; some only once a room is built), rests in a pose (stand, sit, work, read) and
  moves on. Not solid: walkers ignore them and shots pass them by.
- **Talking.** Look at one and press E: a comic speech bubble (the read panel), the yard running:
  what they did for you since you last talked, one useful tip with live numbers, and the next
  story topic (or a mood line). The first talk each day earns trust. A long bubble pages with E.
  When they ask something, take something, or Pip wants to name the dog, E again opens the crew
  card (it pauses; Yes / Not now; locked in a wave).
- **Story quests.** Five per crew member, in order, gated by trust stars and days (2, 4, 8, 13, 19;
  the dog on day 28) and offered only once the building is known. One object, one building, on a
  fixed spot beside a landmark the request names with the place, the direction from the cabin and
  the room's sign. It appears once accepted; a trip item (yours at home, lost on death). June's
  handed over in person for supplies, sometimes a perk (more food a day, more van health, scrap a day, free crew repairs, a longer lookout warning,
  a bigger patch-up, a cheaper crowbar) and a payoff topic.
- **Errands.** After a crew member's first story quest: N of an ordinary item that a known place
  stocks, brought home within some days, then handed over (taken from storage). One story quest
  and one errand can be open at once.
- **Trust.** Points shown as 0 to 5 stars. Up: a talk a day, errands, quests. Down: hurt in a raid,
  an errand late, a request given up (in the backpack's Crew section).
- **Jobs.** Tomas fixes fence holes and cracks in the calm at the usual scrap when the base can pay,
  and the cabin's doors and windows from two stars; he tells you in his next bubble. June patches
  you up once a calm (one star). Pip calls the next wave's size and sides as lookout (one star).
- **Waves.** The crew hurry into the office closet and shut its door. A raider that forces it and
  stands among them for 6 seconds hurts one off-screen (at most once each per wave): a shout, 1
  medical kit from storage or else 2 food, and trust. Nobody dies; nothing is shown.
- **The dog.** Pip's fifth quest. The stray sits in a building; E holds out Pip's treats and it
  follows you (walkers ignore it) to the van. Home, you name it (Pip's three ideas, or your own).
  It follows Pip, shelters with the crew, barks at a wave, and eats 1 food every 2 days. The ledger
  no longer wishes for a dog once it is home.
- **Where it shows.** The backpack's Crew section (stars, open requests to reread or give up,
  finished quests), the day page (June's ledger line, the day after the hand-over), the city map (a marker where an object
  waits), the building's goal line.

## The first-run tutorial (2026-10-14)

June talks the player through the controls the first time. The owner's answers are in `DESIGN.md`
("Owner decisions: the first-run tutorial"); the logic is `js/tutorial.js` (no DOM), the card, panel and
arrow `js/tutorial-ui.js` and `css/tutorial.css`, the words `js/content/level1-tutorial.js`.

- **A card, then try it.** A card (June's face, name and words, the keys and the mouse it pictures)
  freezes the game until Got it (or Enter; it arms after half a second). Esc, P, Space and every game
  key do nothing while it is up; nothing is skippable. Then a "Now you try" panel under the HUD's top
  row says what to do, with the yard checklist, while the game runs. A card that closes in first person
  takes the mouse back; only the click that takes it back (when Got it could not) never fires.
- **The yard part**, on every stay at home until it is done (new saves after How it works, old saves
  on their next Continue): walk and look around (W A S D and the mouse), open and close the backpack
  (B, or the HUD button, which the card rings), stop a slow practice walker (click or Space), talk to a
  crew member (E; not the dog), use the office computer (E, then Step away), then the ready card (P
  pauses, the Pause button ringed; walk to the van). A step done early is ticked and its card skipped.
  In the try steps an arrow points the way to the walker, the nearest crew member, the computer (along
  the walkable way, through the cabin's doors) or the van, at the screen's edge when it is out of view.
- **The hold.** Until every basic is done (`Interior.yardHold`): a fresh first calm stands still (the
  phase box says QUIET; no wave, shots do not shorten it), the dinner bell refuses, Pip calls nothing,
  the crew offer no cards, and E at the van gets June's word on what is left ("The van has to wait.
  Next, ..."). The bed, the pantry, the typewriter and the crew's talk and jobs work as usual. The last
  basic ends the hold and starts the normal first calm (`DEFENSE.firstCalmSeconds`). The hold never
  outlives the yard scene (`startLoop` and `stop` clear it).
- **The practice walker.** One walker at half speed, a bite of 5, 30 health, no scrap, coming in 6 to
  11 steps away on the player's side of the fence and of every shut door. It never takes the player
  below half health (in the hold it is the only harm in the yard, so the tutorial cannot kill), never
  claws the fence or the cabin, and comes again near you when stuck out of sight.
- **Screen cards,** each once per save: the town map (on opening it), the road (the first drive; the
  road waits under it before its first sign), the door note (before it opens), a building (inside;
  the Map button ringed), the first lock (a hint only: read the note, do just what it says; any lock
  puzzle, never the crowbar prompt) and the river.
- **Replay.** "Show tutorial again" in the pause menu clears every card: in the yard the yard part
  starts over, elsewhere that screen's card shows now and the rest come on their next visit. It is off
  during a wave and while a card is up.
- **Where progress lives.** `settings.tutorial`, the done ids, in the slot's own settings, written at
  once: death, quitting and a refresh keep it. A basic is marked when it is done, a card on Got it.
- At Huge text the card is one scroll, as the crew card (June's face and name, the words, the
  pictures, then Got it; Enter works from anywhere), a ring is dropped for a hidden HUD button or when
  the window leaves the card too little room beside it, and the try panel shows only its line.

## The workbench (typing)

Room builds, van and van-gun upgrades, gun mods, and trap crafting open the workbench: a garage scene
with a typing round in front. The first time, a lesson shows traditional home-row finger
placement. Every round starts after a five-second countdown. There are 28 stages: F and J,
D and K, S and L, A and ;, the home row, home-row runs, home-row words, G and H, words with G
and H, a home-row check, the top row a pair at a time (E I, R U, T Y, W O, Q P), a top-row
check, home and top row words, the bottom row a pair at a time (V M, C comma, X period, B N,
Z), all the rows, short words, longer words, phrases, sentences, then faster sentences. A
stage moves up after 3 or 4 good rounds (90% accuracy or better); a sloppy round still builds
but does not count. Typing practice in the cabin is free and counts. Each round has a timer; running out offers a retry with new targets. Nothing is
spent until the round is finished. Repairs need no typing. Word, phrase and sentence pools
come from the reading-level text files.

## Saves

Up to four labeled saves (one per player), picked on the title screen; a name is asked for
when a slot is created. An older single save migrates into slot 1. The base is still the
only place the game saves. Each slot's settings (reading level, text size and the rest) are its
own and written when changed; they also keep the slot's tutorial progress (`settings.tutorial`),
written at once wherever the player is, so death or quitting never brings a seen card back.

## Rendering notes

Wall texture columns are sampled left to right as seen from each face, so signs read
correctly from any side. Counters, tables, beds, crop beds and the fence are low see-over
tiles with a lit top face, drawn in depth order with sprites. Roofs of the yard sheds
come from a list of roofed blocks. The cabin is a walk-in house under the open sky
(`setHouse`): a ceiling is cast over its tiles, its outline carries a hip roof (heights on
the tile corners, highest a few tiles in from the edge), a doorway seen from outside shows
the roof over it and the rooms beyond, and from inside, what lies past an opening is
clipped at the opening's top (the ceiling hides the rest). Floors and ceilings are cast at reduced
resolution with a texture per tile kind; buildings have a wall style and a light level.
Landmarks and yard props are sprites; a footprint landmark is spread over its tiles of
floor (the view is 2 tan(FOV / 2) times taller than wide). Art registers through
`ZSR.Draw3` (`registerTexture`, `registerSprite`, `registerFloor`).

## First person (desktop)

Raycast renderer on canvas, no engine, no dependencies. Grid interiors from
`js/layouts.js`, comic shading (flat colors, ink edges, halftone). Mouse look
via pointer lock, with arrow keys as a fallback for turning. Walkers are billboard
sprites (gaunt, grimy, no gore); they path to the player. Hits are tested along the
crosshair line within the gun's range: walls and cover (tall solid props, landmark
footprints) stop a shot, counters and the fence do not. The gun in hand is a small 3D
model drawn in perspective; at rest it is drawn once per look and screen size and moved
with the walk bob, and a shot, the bow's draw or a switch draws it live. Touch-only
devices are not supported yet: the title screen says so and does not start a game.

## Text size

Normal, Large (1.3x), Huge (1 inch). Huge applies to everything: reading text, buttons,
menus, HUD. Layouts collapse to one column.

## Full screen

A full-screen button sits in the top-left corner on every screen while the page is not full
screen; the HUD's top rows and the menus shift right and down to clear it. It hides once full
screen and comes back on exit (Esc). Browsers without the Fullscreen API (iPhone Safari)
never show it.

## Save format

`zs.slots` is the slot index (active slot, labels); `zs.save.<n>` holds one base save: day,
scrap, food, inventory, room levels, van and van-gun upgrades, guns (owned, in hand, mods,
where each unfound gun is hidden, and the seed that picks its floor tile), known locations,
per-location state (items taken, cache opened, stash opened and taken, explored tiles as a
packed bitset), stash keys found, item tags read, the day log (journal and radio entries by
index, recap numbers), broadcasts heard, backpack notes, packed kits, fence health per segment,
trap stock and set traps, the crew (trust, talks, topics told, quests and errands, reports, the
dog), the yard grid version (`yardV`: an older yard's fence is rebuilt whole
and its set traps return to stock), typing progress, best score. Only written at the base. An
older save gets guns on load: the pistol, with mods carried over from its gun upgrades.
`zs.settings.<n>` holds slot n's settings; `tutorial` there is `null` (none done) or the done tutorial
card ids, written at once (missing in an older slot = none done, so it does the tutorial too).

## Content files

`js/world.js` holds the facts (item names included); `js/layouts.js` holds the floor plans,
the landmarks the facts point at, and the story places (note spots, signs, stash, key);
`js/story.js` and `js/story-home.js` hold the story facts; `js/streets.js` holds street names
and side streets. `js/content/levelN*.js` hold the words at each level: How it works,
controls, base room texts, road signs and cards (`levelN.js`), every building's notes, signs
and key (`levelN-places1.js`, `levelN-places2.js`), and the journal, radio, tags and plot
signs (`levelN-home.js`); June's first-run tutorial is `level1-tutorial.js` alone, read at every
level. `npm test` checks that every level has the same keys as the world,
that lengths match the level, that notes name their building's landmarks, that every story
note, key, stash and sign works in every building, that every route drives correctly, and
that every piece of art exists.
