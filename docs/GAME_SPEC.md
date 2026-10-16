# Zombie Survival: Game Spec (v3)

Decisions confirmed with the owner on 2026-10-12 (v2: map, cabin defense, first-person
buildings), 2026-10-13 (v3: the world shows every upgrade, unique buildings with
landmarks and a map, driving by lanes and signs) and 2026-10-15 (walkers v2: six kinds drawn as
live 3D models, wreckers and wrecked builds, breaches that draw only the walkers near them,
random spawns in buildings, no walker counts on screen).

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
   storage, the radio shelf in the dining room tunes in to today's broadcast and shows past days, the typewriter is typing practice, and the big
   bed heals fully for a minute of the calm. The computer, radio shelf, typewriter and bed wait
   while a wave is on. Doors open and shut with E; walkers break shut doors, smash windows
   and climb in, and walk through open doors. A quarter of each wave's walkers make for the
   cabin, break in and wait inside until you come for them (the wave lasts until they are
   cleared: see "No walker counts on screen" under Walkers); another quarter are wreckers,
   which claw the van and the room builds once inside the fence (see "Wreckers and wrecked
   builds"). A fence hole draws only the walkers within 8 tiles' walk of it outside; the rest
   keep clawing their own segment. The base is the only
   place the game saves: on arrival, after every build action, and after every wave.
2. **Map.** A fixed, hand-drawn city of 15 locations plus the base, with named streets and
   side streets. Only some are known at first; notes and the Radio room reveal the rest.
   Pick a known destination; the route is drawn and listed in words ("The way there").
3. **Road.** Top-down driving in world space, the camera turned so the van always heads up.
   Length is set by map distance, walker density by the destination's danger and the day
   count; every walker kind comes, the rarer ones more often as danger and days grow. The road
   never shows the route: the player navigates by lanes and signs (see Driving below).
4. **Location.** A door note is shown first (added to the backpack). Then free-roam
   first person inside a building with its own floor plan: WASD to move, mouse to look,
   click to fire, E to interact, M for the map of what you have seen. Four landmarks, one
   per corner, are what the notes steer by. Walkers inside start at random spots on every
   fresh visit (the ones a note names, by the spot it names) and come for you. Items sit on
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
- **Why read**: the door note says how many walkers (at least; where it or a graffiti says
  some stand, they do) and where the items are, by landmark;
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
| Radio | Reveals locations; later shows which still hold items. The yard gets a radio tower (timber, then steel on guy wires, then a red and white broadcast tower); the dining-room set grows with it |
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
and they are cover, and wreckers claw them down (below). Walls levels 0 to 3 change the fence
(pickets, braced planks, corrugated metal with spikes, concrete blocks with razor wire, each
with a cracked look).
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
- **Breaches draw only the walkers near them** (`DEFENSE.breachRange`, 8). A walker outside the
  fence goes for a hole only when one is within 8 steps' walk of it along open ground outside,
  and then for the nearest; every other walker keeps clawing its own segment. A corner hole
  (no open ground on both sides) is never used. When a hole opens or is mended, the walkers it
  concerns re-plan at once (one on the fence line, one outside whose nearest hole in range changed,
  one whose path crosses that hole); the rest re-plan on their own clock, so a mended hole sends
  its walkers back to clawing where they stand. A walker outside with no hole in range never
  searches for a way in: it claws its own segment. Raiders and wreckers obey the same rule outside
  the fence.
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

## Wreckers and wrecked builds (2026-10-15)

- **Roles.** Each wave walker rolls once: 25% raiders (the cabin), 25% wreckers, 50% attackers
  (`DEFENSE.raidShare`, `wreckShare`). Outside the fence a wrecker is an ordinary attacker.
- **Inside the fence** a wrecker claws the nearest free spot of a room build or the van, by walking
  distance (one wrecker a spot), at its claw rate (`fenceDps x wreckDps`). It turns on you for
  good once hurt (traps too), once you are within 5 tiles (`wreckProvoke`), or 30 s after it got
  inside (`wreckSeconds`); with nothing left standing it comes for you.
- **A build's strength** is `DEFENSE.buildHp` by its level (120, 180, 260) and lasts between waves
  (`save.builds`). Under half it shows cracks; at 0 it is wrecked: a taped "WRECKED" plaque, cracks,
  debris, dark beacons. It keeps its footprint. A wrecked build gives no room bonus until it is
  fixed; its built level still counts for room requirements, the crew's posts and the art, but a
  crew topic about the room (the free van repair, the daily broadcast, the garden's food) waits
  until it is fixed. A wrecked Radio hears no broadcast that day and cannot be tuned in.
- **Fixing:** 3 scrap a build (`SETTINGS.buildRepairScrap`). E at it in the yard ("Press E to fix
  the wrecked Garden (3 scrap)", or brace a cracked one), mid-wave too, but not while a wrecker
  claws it; the office computer's Builds row ("Fix all for N scrap", N = 3 x every wrecked and cracked
  build: wrecked first, then cracked, as far as the scrap goes); or Tomas in the calm (wrecked builds
  only, after the fence). Upgrading a room puts its build up whole. A wrecker harms its target only
  while it claws (a screamer wrecker yelling at you takes nothing off).
- **The van.** Wreckers stop at 30% of its health (`vanWreckFloor`), so a trip never starts
  wrecked; "They are wrecking the van!" once a wave. Its body dents under 75% and 50% health.
- **Where it shows.** The HUD goal adds " · wrecked: Garden and Well"; a toast when a build falls and
  when it is fixed; the lot panel's status and a "Wrecked" row; the room card in the build menu;
  the Garage tab says "Fix the Garage" when a wrecked Garage caps an upgrade. Pip warns about
  wreckers once a room with a plot is built; Tomas lists the wrecked builds and what fixing them
  costs (the same total as the computer's Fix all: 3 scrap for each wrecked or cracked build), and does not
  say "Nothing needs fixing" while any build is cracked or wrecked.

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
- Leaving a building stores its state for the rest of the trip (walkers with their kind,
  health, look and facing, scrap piles, doors). Going back in on the same trip finds it exactly
  as left. Driving home clears it.
- From the map, the place you are parked at offers "Go in" / "Go back in" (the door note is
  shown only the first time).

## Walkers (2026-10-15)

The owner's decisions are in `DESIGN.md` ("Walkers v2"). The kinds are facts, one row each in
`WORLD.WALKER_TYPES`; every mix, menu, look and test reads its keys, so a new kind is a new row
(`docs/SCALING.md`, "Add a walker kind"). In-world the word is always "walker".

| Kind | Health | Speed (tiles/s) | Bite | Reach (tiles) | Claw (a second) | Scrap | Look and walk |
|------|--------|-----------------|------|---------------|-----------------|-------|---------------|
| Walker | 30 | 1.25 | 12 | 0.85 | 6 | 2 | messy brown hair, torn blue-grey tee ripped over the ribs, torn jeans; a shuffling limp, one arm reaching |
| Runner | 18 | 2.4 | 9 | 0.85 | 4 | 3 | lean, an indigo hoodie with the hood up; a fast sprint, leaning forward, arms pumping |
| Brute | 90 | 0.95 | 22 | 0.9 | 14 | 5 | huge shoulders and hands, a small bald head, a torn ochre tank; a slow heavy stomp |
| Lanky | 40 | 1.5 | 14 | 1.25 | 7 | 3 | very tall and thin, arms past the knees, long stringy hair, a hospital gown or a long coat; a long stiff stride |
| Armored | 60 | 1.0 | 14 | 0.85 | 10 | 4 | riot gear (helmet, cracked visor, vest, pads) or a firefighter's helmet and turnout coat; a stiff march |
| Screamer | 22 | 1.35 | 8 | 0.85 | 4 | 3 | thin and ashen, long tangled hair, a torn maroon top, a very wide mouth; jerky and twitchy |

Health grows with the day (x (1 + 0.1 (day - 1)) in buildings and alarms, 0.08 in the yard and at
the river; `WALKER_HP_STEP`); each walker's speed is its kind's +-10%; the Medbay cuts bites; claws
hit the fence, the cabin's doors and windows, the room builds and the van. Glowing yellow eyes on
every kind.

- **Where each kind comes from** (`WORLD.walkerWeights`, then `pickWalkerType`):
  - Buildings, by danger and day: runners from danger 2 (danger 1 from day 6), lanky from danger 2
    and day 3, screamers from danger 2 and day 4, brutes from danger 3 (danger 2 from day 10),
    armored from danger 3 and day 5; a danger-1 place on day 1 has plain walkers only. Themed
    places (`WALKER_THEMES`): armored at the police station and the fire station, lanky at the
    hospital and the library, screamers at the school and the mall, brutes at the lumberyard; there
    the kind comes from day 1, and by day 5 it is the likeliest after the plain walker.
  - A building's alarm: the place's weights times `ALARM.mix` (more runners, fewer brutes and
    armored, no screamers).
  - Yard waves, by day: runners from day 2, lanky 3, screamers 4, armored 5, brutes 6 (a heavy wave
    brings brutes from day 1).
  - River Landing (`RIVER.walkerMix`): walkers, then runners from day 2, lanky 3, screamers 4,
    brutes 6; never armored.
  - The road: every kind on every trip, the rarer ones more often with the trip's danger and day
    (`road.w`).
- **The screamer.** An awake screamer that sees you within 8 tiles screams (again after 12 s): it
  stands 1.2 s, head back and arms up, and every awake walker within 10 tiles, itself included,
  moves 30% faster for 5 s (frenzy, `WORLD.SCREAM`). Sleepers sleep on. On foot a toast says "A
  scream! Walkers near it speed up." (at most every 20 s); on the road a "SKREE!" burst, the sound,
  and frenzied walkers show red eyes, a glow on the ground and speed lines. A walker killed does
  nothing more that frame, so a sleeping screamer killed by the shot that wakes it never screams.
- **The lanky** bites from 1.25 tiles, but never round a wall's corner.
- **On the road** each kind has its own top-down look in the same colours, its own speed, size,
  damage to the van and knockback (the brute and the armored hardly move when hit); the lanky reaches
  the van from farther off, and half of an armored walker's hits glance off its gear in grey sparks.
  A ram by the van is a hit like a shot: the walker flashes and bleeds the way the van pushes it.
  A hurt walker's health bar stays level on the screen however the road turns.
- **Downed walkers** collapse their kind's way (walker and screamer crumple, the brute topples like
  a tree, the lanky folds forward, the armored drops to its knees and pitches forward, the runner
  tumbles) and fade over 2 s. No bodies stay; a downed walker is never shot at, solid or counted.
- **Gore** (`SETTINGS.walkerGore`, on): blood smears and ribs through torn shirts on the models, a
  short dark-red spray on every hit (a ram on the road too) that lands as splats, a pool under a
  downed walker. Off: grime instead, no ribs, no spray, no pool. Grey sparks off armor show either
  way. The reading text has no gore at all.
- **No walker counts on screen.** The HUD has no walker box in any scene; the yard's phase box says
  WAVE or HEAVY WAVE; the river's toast says something is coming. Door notes and Ruby's graffiti keep
  their counts ("at least eight"), which grow with the day (`SETTINGS.walkersPerLocation`).
- **Walkers waiting in the cabin** (a judgment call beside the owner's no-counts answer, `DESIGN.md`)
  hold a wave open out of sight, so the label says where they are, never how many: "WAVE · walkers
  in the cabin" (or "HEAVY WAVE · walkers in the cabin") while any walker stands in the cabin (off the
  porch) and you are outside it. "Walkers got into the cabin. They wait in there: clear it out." is
  said once a wave. Once the whole wave has come and every walker left is in the cabin, "Walkers are
  waiting in the cabin. Clear it out." shows at once and every 20 s while you stay out (never right
  after the first toast), and the van ("Not now. Walkers are still in the cabin."), the bed, the
  computer, the radio shelf and the typewriter ("Not now: walkers are still in the cabin.") and
  their hints name the cabin; with a walker anywhere else they say the old lines.
- **Where a building's walkers start.** Every fresh visit puts the count on random floor you can
  walk to (never in a locked room), at least 6 steps from the door, out of earshot of it where there
  is room (at least 6.5 tiles in a straight line: a sleeping walker within 6 wakes, `Interior.HEAR`),
  about 3 tiles apart, never on an item, a note spot, a quest spot, the gun or the pole. A walker a
  door note, a note or a graffiti names (`NOTES[id].walkers`) starts within 3 steps of the named spot
  (of the landmark itself when the note names one: "one by the robot" starts within 3 steps of the
  robot), in its room, or inside the named area: "one by the
  robot" is one, and nobody else starts beside the robot; "most near the back" is over half; the
  hospital's walkers all stand in the dark rooms; the police station's big one is its only brute. Going
  back in on the same trip finds them as you left them (kind, health, look and facing).
- **Practice and god mode.** The tutorial's practice walker is a plain walker. God mode's Spawn
  walker puts any kind in front of you, or on the road ahead of the van.

## River Landing and fishing (2026-10-14)

- Frog Lane leaves River Road at a corner with no place on it (`WORLD.JUNCTIONS`), runs paved
  through the corner, then dirt, to a turnout at **River Landing** (an outdoor place: no building).
- Chief Dunn's fishing pole lies in Station 12's equipment bay; its tag (read on pickup, kept in the
  backpack) reveals River Landing. It is a trip item until home, like a gun.
- At the bank, first person: the dock, a sign, the chief's note on the dock post. 6 (or Q) holds the
  pole; click to cast onto water, wait 7 to 20 s for a bite, click within 2 s to land it. Taking a
  gun props the pole on the bank (line in); a bite then rings its bell until the pole is taken back.
- 1 food per fish, 4 a trip, then the river rests 3 days (`WORLD.RIVER`). Walkers come out of the
  trees every 45 to 90 s, one or two, their kinds by the day (`RIVER.walkerMix`); the toast never
  counts them ("Something is coming out of the trees!").
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
  puts it back where it was. Switching guns: 1 to 5, Q, or the mouse wheel. While the read
  panel is up and too long to show at once (a yard plot's sign, a long note), the wheel scrolls it
  and switches nothing.
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
  (walkers pour in, through the way out too, so there is no leaving: you go down; their kinds are
  the place's alarm mix, never a kind a note keeps to one, at most `ALARM.cap` 40 inside at once,
  and the ones from deeper in start on floor that walks to you with the doors as they stand, else
  behind a door, never in a locked room), a booby trap
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
  scrap, notes, keys, food, the nearest build) and June's journal entry. Once the Radio room is
  built, the day's broadcast waits at the radio in the dining room: E there tunes in. Thirty of each are written; after day 30 the last ten repeat. Every
  page is kept in the backpack.

## The crew at home base (2026-10-14)

June, Tomas and Pip live at the cabin. The full design and the contract between its files is
`docs/CREW.md`; the owner's answers are in `DESIGN.md`.

- **Wandering.** In the calm each walks between their own spots in the yard and the cabin
  (`CREW[id].posts`; some only once a room is built), rests in a pose (stand, sit, work, read) and
  moves on. Not solid: walkers ignore them and shots pass them by.
- **Talking.** Look at one and press E: a comic speech bubble (the read panel), the yard running:
  what they did for you since you last talked, one useful tip with live numbers, and the next
  story topic (or a mood line). Tomas tells about the lanky and the armored, and Pip about the
  screamer, at the first talk after one is first met (`save.met`); Pip warns about wreckers once a
  room with a yard plot is built, and Tomas lists wrecked builds. The first talk each day earns
  trust. A long bubble pages with E.
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
  then wrecked room builds (3 scrap each, no star needed; a cracked one is left to you), and the
  cabin's doors and windows from two stars; he tells you in his next bubble. June patches
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
  crew member (E; not the dog), use the office computer (E, then Step away or E again), then the ready card (P
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

**Walkers are live 3D models** (2026-10-15; owner decision 1). `ZSR.Walker3D` (`js/walker3d.js`,
the six looks as data in `js/walker3d-looks.js`) draws a jointed figure with plain canvas 2D calls
(no WebGL, no image assets) in the ink-outline comic style with simple light shading, from any
side: walk cycles per kind, idle breathing, bite, claw, scream, the hit flash and the fall. Each
walker and downed walker on screen gets its own pooled canvas, redrawn at its size on screen only
when it looks different, then projected, depth-sorted and clipped per column like any sprite; a
walker hidden by walls gets no render. Fog is baked into its colours (its eyes keep their glow).
Under a ceiling and in the cabin a walker is capped at 0.98 tiles (the whole figure shrinks). Its
health bar sits just over its head, as wide as it is to hit. A head that points face down (a body
fallen on its face) draws no face, jaw or visor and sorts by its real depth, so a body lying away
from you hides its head. Detail goes by height on screen:
full (fingers, ribs, sheen) over 160 px, less over 64 px, a silhouette with head and eyes below.
**The redraw budget:** the 3 nearest full-detail walkers redraw every frame they change; the rest
take turns, each at most every 2nd frame, at most 10 redraws a frame in all, with less detail; a
picture never drawn yet, a hit's flash and a near walker's out-of-date picture draw at once. A
frame-time governor (`LIVE_LEVELS`) steps to fewer redraws, a 0.7 resolution and less detail when
frames stay slow, and up to the first design's settings (24 redraws, 400 px pictures, full detail
for every walker) when they stay fast. Blood drops and splats are cached sprites, drawn only with
gore on. On the road walkers stay top-down drawings (`js/sprites.js`), one look per kind in the 3D
looks' colours, except on the angled test drive (Home Base to Corner Grocery, `PERSP_ROUTES` in
`js/game.js`): there they are these live figures seen from above, at on-foot size against the van, with
the road's behaviour (scream and frenzy, clawing at the van, each kind's fall, blood with gore on, health
bars), drawn under the interiors' governor rows on the walkers' own time (`js/perspective.js`).

## First person (desktop)

Raycast renderer on canvas, no engine, no dependencies. Grid interiors from
`js/layouts.js`, comic shading (flat colors, ink edges, halftone). Mouse look
via pointer lock, with arrow keys as a fallback for turning. Walkers are live 3D models
seen from every side (see Rendering notes and Walkers); they path to the player, and a hit
tests the walker's radius, not its picture. Hits are tested along the
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
and its set traps return to stock), each room build's strength (`builds`: room id to health left;
no key = whole, 0 = wrecked), the walker kinds met (`met`: kind id to the day one was first seen or
hurt; kept on a trip only if it gets home), typing progress, best score. Only written at the base. An
older save gets guns on load: the pistol, with mods carried over from its gun upgrades.
`zs.settings.<n>` holds slot n's settings; `tutorial` there is `null` (none done) or the done tutorial
card ids, written at once (missing in an older slot = none done, so it does the tutorial too).

## Content files

`js/world.js` holds the facts (item names included, and the walker kinds, their mixes and the
rules that keep the notes' walker positions true); `js/layouts.js` holds the floor plans,
the landmarks the facts point at, the story places (note spots, signs, stash, key) and the walker
anchors and zones those rules name;
`js/story.js` and `js/story-home.js` hold the story facts; `js/streets.js` holds street names
and side streets. `js/content/levelN*.js` hold the words at each level: How it works,
controls, base room texts, road signs and cards (`levelN.js`), every building's notes, signs
and key (`levelN-places1.js`, `levelN-places2.js`), and the journal, radio, tags and plot
signs (`levelN-home.js`), and the crew's talk, tips, reports and quests (`levelN-crew.js`,
`levelN-crew2.js`, `levelN-quests.js`); June's first-run tutorial is `level1-tutorial.js` alone, read at every
level. `npm test` checks that every level has the same keys as the world,
that lengths match the level, that notes name their building's landmarks, that every story
note, key, stash and sign works in every building, that every note's walker positions hold on
every visit, that every route drives correctly, and that every piece of art exists (every walker
kind with a 3D look and a road look in matching colours).
