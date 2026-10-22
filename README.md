# Zombie Survival

Run the last working van out of a boarded-up cabin at the edge of town. Drive to the gas
station, the grocery, the hardware store, the precinct, the hospital. Read the notes the
people before you left. Clear the walkers, open the locked rooms, bring back what the base
needs, and hold the fence when the waves come.

A grounded survival-comic game for teens. Reading is never quizzed; it is useful. The
reading level is switchable from 1st to 6th grade and changes every note, sign, and
instruction in the game without changing the facts (June's first-day tutorial is the one
exception: it is written once, in level 1 words, for everyone). The reading text has no gore;
the walkers' art shows some blood and ribs through torn shirts, and one switch,
`SETTINGS.walkerGore` in `js/world.js`, turns all of it to grime.

**The walkers** are live 3D figures in the game's comic style, seen from every side: six kinds,
each with its own walk (the shuffling walker, the sprinting hooded runner, the huge brute, the
tall lanky that reaches farther, the armored in riot gear or a firefighter's coat, and the
screamer, whose scream makes the walkers near it faster for a while). Which kinds you meet depends
on the place's danger, the day and the place itself (armored at the police and fire stations,
lanky at the hospital and the library, screamers at the school and the mall, brutes at the
lumberyard). A downed walker collapses and fades. No HUD box or wave label counts them: you see
them (a door note still says at least how many wait inside).

## Play it

No install, no build step, no dependencies.

- **Double-click `index.html`.** It runs straight from the file.
- Or serve the folder with anything static: `npm start` (uses `http-server` on port 8080),
  `python3 -m http.server`, GitHub Pages, Netlify, or a Vercel static deploy.

The game needs a keyboard and mouse: a touch-only phone or tablet gets a notice on the title
screen and cannot start a game. On a touchscreen laptop the map also takes touch and the road
shows two lane buttons.

On your first day June walks you through the yard (walk and look, the backpack, a slow practice
walker, the crew, the office computer) before the van will leave, and gives one short card the first
time you reach the map, the road, a door note, a building, a lock and the river. Nothing is skipped;
Show tutorial again is in the pause menu.

## The loop

1. **Home base, cabin defense.** First person in the yard. Time runs in phases: a long calm
   (nothing at the fence; go inside to build, or leave in the van) and waves that are
   sometimes a few walkers and sometimes a lot, from two sides or from every side. The
   dinner bell on the porch (E) brings the next wave now; gunshots in the calm bring it
   sooner (the bow is silent). Walkers claw through the fence; the Walls room makes it
   stronger. A hole draws only the walkers near it; the rest keep clawing their own stretch.
   Holes never close on their own: stand at a gap and press E (1 scrap each) or
   fix them all from the computer. Set traps with T and R. A quarter of a wave are wreckers:
   inside the fence they claw the van and your room builds until you shoot one or come close
   (or half a minute passes). A wrecked build gives nothing until it is fixed (3 scrap: E at it,
   Fix all on the computer, or Tomas in the calm). The base is the only place the
   game saves.
   **The cabin is a house you walk into** (the Hollis family's; the plan is `WORLD.HOUSE`):
   porch, foyer, office, dining room, kitchen and pantry, ping pong room, living room,
   bedrooms, baths, closets and a rear play room, each furnished. E at the office computer
   opens the build menu; the pantry shelves list food and storage; the radio shelf in the
   dining room tunes in to today's broadcast and shows past days of June's journal and the
   radio; the typewriter in the play room is
   free typing practice; the big bed heals you fully for a minute of the calm. Notes the
   Hollis family left on the walls are read up close. Its doors open and shut with E:
   walkers walk through an open one, pound a shut one down, and smash windows to climb in
   (you cannot climb out). About a quarter of a wave's walkers make for the cabin, break in and wait
   inside; the wave lasts until they are cleared out, and while you are outside the wave label
   reads "WAVE · walkers in the cabin" (where, never how many). E at a broken door or window fixes
   it (2 scrap); the computer's House tab makes doors and windows stronger.
   **What you build is what you see:** every room has its own plot in the yard, a staked lot
   with its name on a sign until it is built, then a bigger build at each level (a lean-to tool
   shed, then a shed with a roll-up door, then a metal workshop; rain barrels, then a tank on a
   stand, then a tall tank with a ladder).
   Walk up to a plot's sign (or its plaque once built) and press E to read what the next level
   gives and needs and what must be built first; the seven outdoor rooms (Garden, Farm, Well,
   Water, Power, Radio, Lab) also carry hand-painted words about what stands there, or could. The Walls level is the fence itself (pickets, braced planks, corrugated metal, concrete
   and razor wire). The van in the driveway shows its armor,
   plow, engine gear and paint, and its roof gun shows heavier rounds, rate of fire and
   spread. The gun in your hands shows its own mods: a heavier muzzle, a longer barrel and
   sights, a smoother action, a steadier grip (the bow: broadheads, stronger limbs, a smoother
   draw, sight pins).
   **The crew.** June, Tomas and Pip live at the cabin with you. In the calm they wander
   between their spots in the yard and the cabin (June in the living room and the garden, Tomas at the
   van and the garage, Pip at the radio). Look at one and press E: a speech bubble shows what they
   did for you, one useful thing (food left, the van, the fence, the next wave, your keys) and a
   piece of their story, while the yard keeps running. When they have a favor to ask, E again
   opens a card. Five story quests from each of them send you to bring one object home from one building (Pip's fifth is the dog, below), and
   their words say where: the place, which way from the cabin, the room's sign and a landmark.
   The object is there only once you say yes. Bring it home and hand it over in person for
   supplies, sometimes a lasting help (more food a day, a cheaper crowbar, free fence fixes, a
   longer warning of the next wave) and a new story; June writes it up in her ledger. After their
   first quest they also ask for errands: a few of an ordinary item within a few days. Trust grows
   as you talk (once a day) and bring things home, and drops when they get hurt, an errand runs
   late or you give one up; their stars open new stories, quests and jobs. Tomas fixes fence holes
   and cracks in the calm at the usual scrap, then wrecked builds (and the cabin's doors and windows
   at two stars) and tells you later; he and Pip also tell you about the lanky, the armored and the
   screamer once you first meet one; June patches you up; Pip, as lookout, calls the next wave. In a wave they hide
   in the office closet, and a walker that forces its door can hurt one of them, which costs a
   medical kit (or 2 food). Pip's last quest finds the stray dog that barks past the trees: hold
   out Pip's treats and it follows you to the van; at home you name it, and it follows Pip, barks
   at walkers and eats a little food. The backpack's Crew section keeps every request to reread,
   and the city map marks where an object waits.
2. **Map.** A fixed city of 15 places and River Landing, with named streets and side streets. Only a few
   places are known at first; the notes you read and the Radio room reveal the rest. Pick a
   destination: the route is drawn and "The way there" lists it in words. Each step is
   numbered to match a badge on the board and shows the lanes its road sign will show, the
   right one lit. Every place sits at the end of its own short drive off the corner where its
   roads meet (a place with one road, at the end of that road), so the route runs from its icon
   down its drive, along the roads, and up the destination's drive to its icon. The board zooms (+ and - buttons or keys, the wheel, a pinch) and drags;
   Route frames the whole drive, 0 or All shows the whole city, and a step in the list zooms
   to that turn.
3. **Road.** Driving, seen from behind and above the van. Aim with the mouse, hold to fire (click a
   walker and the shot is led to meet it). The road does not show the
   route: before every junction and side street a sign says where each lane goes, and A and D
   (or the arrows, or the side buttons) change lanes. You set out from the parking spot at the
   end of your place's drive and drive up it to its corner. Past side streets your usual lane
   (the left one) goes straight. At a junction every road out gets its own lane, left to right,
   each with a painted arrow, and at a place its own drive gets one too; your usual lane may be
   one that turns (with two roads out it takes the left one), so match the arrow on the sign.
   At the end, take the lane for the destination's drive at its corner and park at the door
   (River Landing and Ortiz Auto sit at the end of their one road: drive on to the end). Be in
   your lane before the white stop line. A wrong turn lets you try again from where
   you set out (damage, scrap and kills stay), open the town map, or go back to that place. The minimap in the corner shows where you are
   and flags where you are going.
4. **Building.** The note at the door tells you how many walkers wait inside (at least) and where the
   things are, by landmark: every building has four, one in each corner (the tire tower, the
   fire truck, the giant globe). The walkers start in different spots every visit, except the ones a
   note says stand somewhere ("one by the robot"): they are there. Inside, first person: W A S D to move, mouse to look, click
   to fire, E to read notes and to open and close doors (walkers cannot open them), B for the
   backpack, M (or the Map button) for a map of the parts you have seen. The locked cache room
   holds the best items, and the note inside says how to open it and the way there. **Every
   lock is real:** type the keypad code, press the stuck door's moves in order (up, right, lift,
   pull ...), open the right drawer or can, press the right alarm button first. The answers are
   different in every save. A mistake costs what the note warns: an alarm (walkers pour in, even
   through the way out, until you go down), a booby trap (you go down), or a jammed lock that only
   a crowbar opens (build crowbars at the workbench; each one is spent on use). Typing
   `god mode` within 2.5 seconds at any lock prompt opens it. Go back in from the map and the building is exactly as you left it; what you
   have explored is kept once you are home.
   Items sit on shelves and floors, and each has a tag you read as you pick it up. Every
   building also has a locked **stash** whose key is hidden in a *different* building: one
   note leads to a second, and the second says where the key is and which stash it opens (the
   keys form a ring around the town). A key only says how it looks: at a stash you pick which
   key to try, so reread the note. A wrong key jams some locks, snaps off in others, and does
   nothing in the rest, as the note warns. Walls carry signs and graffiti you read by walking up
   to them. Every building has a decoy note with a wrong answer for its lock; higher reading
   levels place more notes, some of them wrong or out of date.
   Four more guns lie on the floor of four buildings, different ones in every save:
   double pistols, a machine gun, a heavy machine gun, and a bow and arrow. Walk over one
   to pick it up; bring it home to keep it. 1 to 5, Q or the mouse wheel switch guns (while a sign or note too long for its panel
   is up, the wheel scrolls it instead).
   **Fishing.** Chief Dunn's fishing pole lies in Station 12's locked equipment bay (the chief's note says which key opens it). Its tag says
   where his crew fished, and reading it puts **River Landing** on the map: Frog Lane leaves River
   Road square to it between Greenhouse Row and the Water Tower, the asphalt gives out just past the
   corner, and a dirt road runs west to the river's edge. The van parks at the end; the river is west
   of the dock, as on the map. Get out, walk down the dock, and press 6 (or Q)
   for the pole. Click to cast, then click again the moment the float dips (about 2 seconds). Look
   around freely: the line stays out to the bobber. Take a gun with the line out and the pole is
   propped on the bank; a bite rings its bell and the fish stays on until E at the pole takes it
   back. Each fish is 1 food once home, 4 a trip, then the river rests 3 days. Walkers come out
   of the trees now and then (one or two, every 45 to 90 seconds); a shot brings the next sooner.
   Food crates and fish feed the crew when you get home.
5. **Home again.** Cargo is unloaded, a day passes, the crew eats one food, the game
   saves, and you read the day's page: a recap, June's journal, and (once the Radio room is
   built) a broadcast from Jo or one of the town's voices. In the yard, every room's plot has a sign
   (a plaque once built): walk up to it and press E to read what the next level gives and needs and
   why it is locked; the outdoor rooms (Garden, Farm, Well, Water, Power, Radio, Lab) also carry
   hand-painted words about what stands there. Build rooms with items plus scrap, upgrade the van and its gun, mod your guns
   (damage, range, fire rate, accuracy) in the Weapons tab, craft traps:
   each one is a short typing round at the garage workbench, after a five-second countdown
   (the first time teaches home-row finger placement). The stages go slowly: the home row a
   pair of keys at a time, its runs and words, a home-row check, then the top and bottom rows
   a pair at a time, and only then words, phrases and sentences. A stage moves up after 3 or 4
   good rounds (90% accuracy or better); free practice rounds in the cabin count too. Repairs
   are instant: a slider picks how much health to buy (1 scrap for every 3 health, 5 scrap at
   least), up to full; with the Garage built the fix is free and goes straight to full. Out on a
   trip, leaving a building with the van under three quarters of its health offers a field patch
   up to that mark, at five times the cabin price, Garage or not.

Death (wrecked van, down inside a building, overrun in the yard) reloads the last save.
Up to four players keep their own labeled saves, picked on the title screen.

## Project layout

```
index.html              all screens
css/style.css           comic-book styling; every size in rem so Huge text (1 inch) scales everything
css/crew.css            the crew's speech bubble
css/tutorial.css        June's tutorial card, the ring on a HUD button, the "Now you try" panel and the arrow
css/bench.css           the workbench overlay: the garage scene behind, the typing game in front
css/god.css             god mode: the menu over everything, and the badge that says nothing is being saved
js/layouts.js           THE BUILDINGS: one floor plan per place, its four landmarks, wall decor, palette,
                        and its story places: note spots, wall signs, the stash room and the key
js/world.js             THE FACTS: items, base rooms, the yard and its plots, map locations, roads, the key ring, notes
js/story.js             story facts inside buildings: trail and dead-end notes, wall signs, stash keys
js/story-home.js        story facts at home: June's journal, the radio, item tags, the yard plot signs
js/story-crew.js        the crew's facts: who they are, their spots, rules, talk, tips, reports, errands
js/story-quests.js      the crew's story quests (one object, one building each) and the dog
js/story-leo.js         crossover facts, the Captain Leo universe (UNIVERSES.leo): its journal, radio, crew topics
                        and Tomas's robot dog quests, and Rivet the robot dog (ROBO)
js/story-fortitude.js   crossover facts, the Fortitude universe (UNIVERSES.fortitude): its journal, radio, crew
                        topics and Pip's quests (the keepsakes)
js/streets.js           street names, side streets, lanes and decisions for a route, road text fallback; corners shaped
                        for the angled camera (cornerSpin), braking by sharpness, the river's one course (RIVER)
js/content/levelN*.js   THE WORDS at reading level N (1..6): levelN.js (how it works, controls, road, rooms,
                        typing), levelN-places1.js and -places2.js (every building), levelN-home.js (journal,
                        radio, tags, plot signs, the day's recap, the cabin's wall notes and upgrade cards, River
                        Landing), levelN-crew.js (the crew's talk, tips, reports, the dog),
                        levelN-crew2.js (more tips and reports: the walker kinds, wreckers, wrecked builds),
                        levelN-quests.js (the crew's story quests and errands), levelN-leo.js and
                        levelN-fortitude.js (the crossover universes: T.universe.leo / T.universe.fortitude
                        journal lines and broadcasts, and the crew's crossover talk and quests; see
                        docs/UNIVERSES.md)
js/content/level1-tutorial.js  June's first-run tutorial: level 1 only, read at every reading level
js/locks.js             the locks: answers rolled per save, the {placeholders} they fill in the notes, the lock
                        prompt (keypad, moves, choices, stash keys, crowbar), god mode, fixture art
js/state.js             settings, the base save, the in-memory trip, room effects, explored maps, the key ring
js/crewstate.js         the crew's save state: trust, talk, requests, rewards and perks, reports, the dog, their words
js/xoverstate.js        the crossover universes' save state: which universe is on, each one's journal and radio
                        progress, and Rivet the robot dog
js/interior.js          first-person engine: raycaster, low see-over tiles, roofs, floors and ceilings,
                        props, walkers (what each does, the scream, the downed, the blood; each drawn live into
                        a pooled canvas, with a frame-time governor), shooting and switching guns, reading
                        signs up close, HUD plumbing
js/walker3d.js          the walkers' live 3D models: joints, gaits, poses, falls, levels of detail, canvas 2D only
js/walker3d-looks.js    the six walker kinds' looks, as data (Walker3D.addType)
js/walker3d-crew.js     the crew on the walkers' rig: June, Tomas and Pip's looks, as data
js/beast3d.js           the animals as live 3D jointed figures: the stray dog, Rivet, the goats and the hens
js/beast3d-looks.js     the stray dog's and Rivet's looks for beast3d.js
js/beast3d-looks2.js    the goats' and hens' looks for beast3d.js
js/model3d.js           still 3D things drawn in the comic style with plain Canvas 2D calls (no WebGL)
js/van3d.js             the one 3D van everywhere it is seen (yard, river, road, garage, title, workbench): paint,
                        armor, plow, engine gear, dents by health, the roof gun
js/modelsprite.js       still 3D models standing in the first-person view (the parked van, the yard's props, signs,
                        plaques, the porch)
js/yardmodels.js        the yard's props, signs and plaques (and the porch's) as 3D models: the contract;
                        yardmodels1.js and yardmodels2.js hold the models, room by room
js/building.js          building mode: layouts, landmarks, decor, items, notes, cache, stash and key,
                        wall signs, guns on the floor, the M map
js/yard.js              yard mode: plots and their builds per level, fence by Walls level, traps, waves, the bell and
                        gunfire, which fence holes draw which walkers
js/yardwreck.js         wreckers: the van and the room builds they claw, wrecked builds and fixing them
js/crew.js              the crew in the yard and cabin: wandering, the shelter, raids, Tomas's repairs, the lookout,
                        the talk bubble, the dog at home
js/robodog.js           Rivet, Tomas's robot dog (Captain Leo universe): it follows you in the yard and inside
                        buildings and zaps walkers
js/crossart.js          crossover art: Rivet the robot dog, the zap spark, the sky over the yard (Mira-9 or
                        the shipyard ring) (docs/UNIVERSES.md)
js/crewart.js           crew art: June, Tomas and Pip in five poses, the dog, portraits, quest objects
js/river.js             River Landing: the bank, walkers out of the trees, fishing (cast, bite, hook, the pole
                        propped on the bank and its bell), the sign and the dock note
js/riverart.js          River Landing art: water, the sign, the dock post, the bobber, trees and reeds, the pole
                        lying on a floor and propped on a bank, and the pole in your hands
js/house.js             the cabin in the yard: rooms and furniture, doors and windows (break, fix, upgrade), raiders,
                        what E does inside (computer, pantry, radio shelf, typewriter, bed, dinner bell), wall notes
js/houseart.js          cabin art: siding, roof, doors and windows by level and damage, wallpapers, wall notes,
                        floors and ceiling, furniture
js/sprites3d.js         first-person textures and sprites, the registration API, the 3D guns in hand
                        (each showing its mods)
js/decor.js             wall decor faces (signs, posters, lockers, notice boards ...)
js/landmarks1.js        landmark art: gas station, grocery, hardware, pharmacy, auto shop, electronics, garden
js/landmarks2.js        landmark art: precinct, school, fire station, hospital, water tower, lumber, mall, library
js/yardart.js           yard art: every plot at every level, fence by Walls level
js/game.js              the road: world-space drive, lanes, signs, turns, wrong-way restarts, minimap
js/perspective.js       the road camera, every drive (angled, from behind and above the van): the camera (it follows
                        lazily through a turn while the van brakes by the turn's sharpness; game.js drives both; a
                        narrow window sees wider), the ground warped
                        on the 2D canvas when there is no WebGL, everything standing (plants, wrecked cars, barriers,
                        barrels, signs, crates, buildings, the van and its roof gun), the walkers as the buildings'
                        live 3D figures seen from above (on-foot size, sprinting to keep up, screams, claws, falls,
                        blood with gore on, health bars, under the buildings' governor rows), the aim, where walkers
                        come from, night (the headlights' beam down the van's heading) and fog (the haze come in
                        close), the scenery governor (thinner scenery on a slow machine), the wait at the door for
                        the first view, freeing it all at a stop, the title screen's and the garage's still scene,
                        frameStats and walkerStats (a frame's cost)
js/perspective-buildings.js  each place's own 3D building on the angled road (a row of parts per place id: the cabin,
                        the Water Tower seen far off, the gas canopy, River Landing's dock ...), the side streets'
                        standing ends, the names painted on the signs and the name boards
js/perspective-gl.js    the angled camera's ground on the graphics card: squares of the road's art drawn once, kept
                        (as many as the window needs), within a frame budget, most visible first, the ones a turn
                        will need drawn ahead
js/perspective-art.js   the angled camera's pictures: trees, bushes, tall grass, barrels, sign boards, barrier
                        stripes; the overgrowth on the ground; the plants over the land, made a square at a time
                        as the view reaches it, seeded by place, none in the river
js/map.js               the city map, street names, side streets, "The way there"
js/base.js              the build menu at the cabin's computer (rooms, garage, weapons, traps, house, stock, repairs, hover tips)
js/typing.js            the workbench typing game (finger lesson, stages, countdown, timer, retry, practice)
js/tutorial.js          June's first-run tutorial, the logic (no DOM): the yard's basics and the hold on waves and
                        the van, the practice walker, the arrow's target, one card per new screen, progress, replay
js/tutorial-ui.js       the tutorial you see: the card, the "Now you try" panel, the arrow, the key listener
js/bench.js             the garage workbench scene behind the typing game
js/backpack.js          the backpack (medical kits, notes) and the note reader
js/sprites.js           the road's flat art (the van's roof seen from above, the ground, roads, lanes, each place's
                        lot at the end of its drive, junk lying flat, particles), the signs and the name boards
js/upgrades.js          van and van-gun upgrades (the road)
js/weapons.js           guns carried on foot: stats, mods, where each one is hidden
js/audio.js             synthesized sound effects
js/main.js              screen flow
js/god.js               god mode: the owner's test sandbox (type !godmode), nothing saved while it is on
docs/GAME_SPEC.md       the design as agreed
docs/TEXT_GUIDE.md      how to write the six reading levels from the facts
docs/STORY.md           the people, the story threads and the key ring
docs/CREW.md            the crew at home base: the design and the contract between its files
docs/SCALING.md         growing the game: limits the city is near, add-a-place checklist, save compatibility
docs/UNIVERSES.md       the Captain Leo and Fortitude crossover universes: canon, rules, what each adds
DESIGN.md               the dated log of owner decisions and judgment calls (record new ones here)
CLAUDE.md               standing notes for future builds (the game will grow; read docs/SCALING.md first)
tests/                  world, weapons, text, streets, drive, scenery, engine, crew, art, typing, god-mode and balance validators, script
                        syntax check, word counter; tests/balance: the road's balance run (npm run balance)
```

## Editing content

- **Change a fact** (where an item is, a lock, who wrote a note): edit `js/world.js`, then
  update the six level files so the words still carry the fact. `npm test` checks that
  every level has every note, that numbers, people and revealed place names survive, and that
  each note that gives a way names the building's landmarks.
- **Change a building:** edit its floor plan in `js/layouts.js` (the legend is at the top).
  The notes describe positions, so a moved room can make a note lie: `npm test` checks
  reachability, landmarks in their corners, the stash, the key, the note spots and the signs,
  and that the facts still name the landmarks; read the notes for that place again after any move.
- **Change the words only:** edit the `js/content/levelN*.js` files. Keep to the calibration
  table in `docs/TEXT_GUIDE.md`. `node tests/count-words.js` shows words per file; every
  level must keep at least four times its pre-expansion reading (`npm test` checks).
- **Change a story fact** (a trail note, a sign, a key, a journal day, a broadcast): edit
  `js/story.js` or `js/story-home.js` (or, for a crossover line, `js/story-leo.js` /
  `js/story-fortitude.js`, see `docs/UNIVERSES.md`), then the six levels. See `docs/STORY.md`.
- **Change the crew** (a story topic, a quest, an errand, a spot they stand on): edit
  `js/story-crew.js` or `js/story-quests.js`, then the six levels (`levelN-crew.js`,
  `levelN-quests.js`). `docs/CREW.md` has the shapes and rules; `npm test` checks the spots, each
  quest's object spot beside its landmark, the gates, the rewards and every text at every level.
- **Change the tutorial's words:** edit `js/content/level1-tutorial.js` only. It is level 1 for every
  reader (owner decision), so there are no other levels to update; `npm test` holds it to level 1
  (see `docs/TEXT_GUIDE.md`, "June's tutorial"). Which cards exist, what each pictures and the yard's
  steps are `CARDS` and `YARD_STEPS` in `js/tutorial.js`; see `docs/SCALING.md` before adding one.
- **Add a location** (the full checklist and the save rules are in `docs/SCALING.md`): add it to `LOCATIONS`, `LOCKS`, `NOTES`, `KEYS` and `ROADS` in `js/world.js` (and a
  `NOTES[id].walkers` rule for any text that says where walkers stand), give it a street name (and
  side streets if you like) in `js/streets.js`, draw its floor plan, landmarks and story places in
  `js/layouts.js` (and their art), add its story in `js/story.js`, its building on the angled road
  in `ROWS` (`js/perspective-buildings.js`), then write its texts at all six levels.

## Tuning

- Walker kinds (health, speed, bite, reach, claws, scrap, where each comes from, their road stats):
  `WALKER_TYPES` in `js/world.js`; the screamer's scream `SCREAM`; themed places `WALKER_THEMES`; the
  alarm's pace and mix `ALARM`; the river's `RIVER.walkerMix`; the gore switch `SETTINGS.walkerGore`.
  Their looks: `js/walker3d-looks.js` (on foot and on the road). How
  many redraw a frame: the `LIVE_*` constants and the governor's `LIVE_LEVELS` in `js/interior.js`.
- Walkers inside buildings: `SETTINGS.walkersPerLocation` (how many) and `walkerSpawn` (how spread out)
  in `js/world.js`; where a note says some stand, its rule in `NOTES[id].walkers`. How near a sleeping
  walker hears you (and how far from the door they start): `HEAR` and `HEAR_SPRINT` in `js/interior.js`.
- Locks: `LOCKS` in `js/world.js` (what each cache asks, what a mistake costs, what a wrong stash key
  does) and `TOOLS` (the crowbar's price). The alarm's pace, mix and cap: `ALARM` in `js/world.js`.
- The cabin: `HOUSE` (plan, rooms, notes, what E uses) and `HOUSE_UPGRADES` (door and window strength and
  cost) in `js/world.js`; furniture and room looks in `js/house.js`. A moved wall can strand a note or
  a doorway: `npm test` walks every room, reads every note and uses every spot.
- Fishing and River Landing: `RIVER` in `js/world.js` (fish a trip, rest days, bite and hook seconds,
  cast distance, walker timing, where the pole lies, the bank's grid). Frog Lane's paving: `SURFACE`
  in `js/streets.js`. The words: `T.river` in each `js/content/levelN-home.js`, facts in
  `RIVER_FACTS` (`js/story-home.js`).
- Waves at the base: `DEFENSE` in `js/world.js` (fence strength, calm length, raiders, wreckers, the builds' strength,
  how far a hole draws walkers, the bell, gunfire, rest, wave mix, counts,
  how many sides a wave comes from).
- Road difficulty: `DIFF` in `js/game.js` and each kind's `road` row in `WORLD.WALKER_TYPES`; how often walkers come
  by danger and day, in what groups, from where and how hard they keep up: `ROAD_DANGER` there (and `KEEP`), checked
  with `npm run balance` against the old top-down road's numbers (`tests/balance`); lane and junction geometry:
  `GEOM` in `js/streets.js`; how the corners are shaped for the angled camera and how hard it brakes by sharpness:
  `CAM`, `COMFORT` and `GEOM.backMax` there (`CAM` mirrors `PERSP`). The road camera: `PERSP` in `js/game.js` (its pace and shots; the corner
  braking `brake`, `brakeIn`, `brakeOut`; the lazy camera `look`, `lookRamp`, `camW`, `camPace`; the van's nose
  `nose`), `Persp.cfg` in `js/perspective.js` (pitch, view, how far it sees) and `Persp.minAspect` / `maxFov` for narrow windows, the
  walkers' `TILE` and `LIVE_BUDGET_MS` there, the scenery governor's `SCENERY_BUDGET_MS` and `SCENERY_LEVELS`,
  night's `NIGHT_BEAM` and fog's `FOG`; the roadside's reach `SCENERY_REACH` in `js/game.js`.
  Each place's building on the angled road: its row in `ROWS` in `js/perspective-buildings.js`.
- Base rooms, recipes, and effects: `BASE_ROOMS` in `js/world.js`; what each level looks like
  in the yard: `BUILDS` in `js/yard.js`.
- Van and van-gun upgrades: `js/upgrades.js`.
- The tutorial: `TUNE` (card timing, the walk step, the arrow) and `PRACTICE` (the practice walker's
  speed, bite, health floor and distance) in `js/tutorial.js`.
- Guns on foot (damage, fire rate, range, spread, noise, pierce, mod prices, which danger
  levels each one can be hidden at): `js/weapons.js`. How each sits in your hands and what
  each mod tier adds to it: `POSES` and the gun models in `js/sprites3d.js`.

## Privacy

Everything stays in the browser's `localStorage`. No accounts, no network calls other than
loading three Google Fonts (the game falls back to system fonts offline).
