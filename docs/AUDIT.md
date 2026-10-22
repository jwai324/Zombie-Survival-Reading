# Game audit, 2026-10-22

A full audit of where the game's words (notes at all six reading levels, signs, the journal, the radio, crew talk and quests, the crossover storylines, How it works, controls, UI strings) and its docs (GAME_SPEC, STORY, CREW, UNIVERSES, TEXT_GUIDE, SCALING, README, CLAUDE.md, DESIGN.md) disagree with what the code does, or with each other. The owner asked for a report plus a fix for everything the evidence settles; judgment calls stay open below, each with a proposed fix.

## Results

| | Count |
|---|---|
| Findings reported by the auditors | 462 |
| Distinct findings after merging duplicates | 387 |
| Confirmed in full | 263 |
| Confirmed in part (claim or fix corrected) | 101 |
| Refuted | 23 |
| Fixed on this branch | 316 |
| Open for the owner | 44, plus one question raised inside a merged finding |
| Dropped (not a defect, or not worth a change) | 27 |

Severity of the distinct findings: 2 high, 71 medium, 314 low. Most are level drift: two reading levels of one note telling the reader different concrete things (a weekday, a count, a colour, where something hangs).

The two high findings:

- **validate-drive keeps every draw call of dead sections: 2.3 GB leak, OOM.** The drive validator kept every draw call of three finished test sections and ran out of memory at the default heap. Fixed in commit `bcaca93` (see Test health).
- **Level 6 trail1 sends the twins to the rigged bottom drawer.** Level 6 school-trail1 says Ms. Adler leaves food in the bottom drawer of her desk and asks the reader to eat it; the desk's drawers are the cache search fixture and two of the three (whichever are not the rolled {pick}) are air-horn alarms, so in two saves out of three the bottom drawer sets off the alarm (walkers pour in until you go down). Status: fixed.

## How it was run

- **Find.** 54 read-only auditors, one per scope: each of the 15 buildings (grid walk, locks, reveals, walker rules, items, all six levels), the journal, radio, cabin, tags and plot signs, crew talk, tips and quests, both crossover universes, How it works, controls, the tutorial and every UI string, each doc in sections, DESIGN.md read as a dated log (only the latest decision on a topic counts), a tone sweep and a story-continuity sweep.
- **Merge.** Duplicates reported from different sides were merged, keeping the best evidence.
- **Verify.** Every finding was checked by two independent verifiers: one reproduced it from the files (walking grids, computing bearings, tracing code), the other judged it against the project's own rules and checked the fix against the validators. A third verifier settled every disagreement.
- **Review.** I classified each one as fix, owner decision or drop, and made a few consistency calls where verifiers split the same pattern (see Judgment calls).
- **Fix.** Fixers worked in batches by file family. An independent checker read each batch's diff against the instructions and the validators, and a repair round fixed what it rejected. `npm test` passes on the result.

## Test health

`tests/validate-drive.js` died with "JavaScript heap out of memory" at Node's default heap in the audit container, so `npm test` could not pass there without a bigger heap. Three recording canvas contexts kept logging every draw call after their test section ended, because the game keeps the canvases. Each section now stops recording and drops its log when it is done. The test passes at the default heap in about 130 s with the same output (commit `bcaca93`).

## Open: decisions for the owner

Each item says what disagrees and the fix the verifiers propose. Nothing here was changed.

### The day pages, the radio and crew talk out of step

The journal page for a day is fixed, but the radio and the crew's topics depend on what the player has built and heard. These pages can contradict what the player already knows. One rule settles all six: either the fixed pages may lag the radio (record it in DESIGN.md), or the pages get reworded or gated.

- **Journal day 11 still hears static after Jo is on the radio** (medium). journal-11 (always day 11) says Pip's dial finds 'only static', that 'people say someone named Jo talks on the radio', and that Pip 'has started a list of every voice' whose first name is June; pip-t6 (day 11) repeats this. Where: `js/story-home.js:74`, `js/story-home.js:75`.
  Proposed: Owner decision, recorded in DESIGN.md together with the related journal/radio repeat-window findings. The side DESIGN.md:204 points at is the fixed-day journal. Cheapest route: (1) In js/story-home.js journal-11, keep fact 1. Change fact 2 to 'There was only static from the loose dial, but Pip is sure there are voices out there.' Change fact 3 to 'Jo talks on the radio from a rooftop.' Change fact 4 to 'Pip keeps a list of every voice the crew hears, and the first name on it is June.' (no 'started').
- **Repeating journal-22 says Ruby still seeks Dev; radio says reunited** (medium). journal-22 ("People say Ruby is looking for Dev") is in the repeat window, so it is written again on days 32, 42, ... for ever. The radio's repeat window (radio-21 "Ruby and Dev say hello", radio-30 "Ruby and Dev are safe at the Water Tower") and radio-17 ("She and Dev are together again") say Ruby found Dev. Where: `js/story-home.js:138`, `js/story-home.js:287`.
  Proposed: If the owner chooses the text-only route: js/story-home.js:140-141 change fact 2 to "People say Ruby went looking for Dev, and Dev left messages for her wherever he went." and fact 3 to "Pip says people who keep leaving messages find each other." (keep facts 1 and 4); then reword journal[21] in js/content/level1-home.js through level6-home.js so no sentence asserts Ruby is searching now or that the story has no ending: level 2 drop 'is out looking', level 4 drop 'the one with no ending yet' and the quoted 'they will find each other', level 5 drop 'how many walkers stand between those walls' and the 'matter of time and paper' line, level 6 dro …
- **Repeating pages 21 and 24 narrate one-time events** (low). Entries 21-30 repeat for ever (cycleLoop), but journal-21 adds the town's rule to the door ("so it goes on the door too") and journal-24 has June teach Pip the ledger "just in case" (level 6: "I did something I have been putting off"). On days 31, 41, ... the rule is added to the door again and Pip is taught again. Where: `js/story-home.js:135`, `js/story-home.js:152`.
  Proposed: Owner decision: either accept (record in DESIGN.md that repeating pages may retell a day) or reword journal-21/24 facts and texts as habits ("June reads the five rules on the door out loud", "June has Pip keep the ledger on cold mornings").
- **June describes waves on day 1 and 3; journal says first walkers came day 4** (low). The ledger dates the first walkers to day 4 (journal-1 "nothing came" on day 1, journal-4 "the first walkers came to the fence at dusk"), but the game sends waves on day 1 after the tutorial hold and June's day-1 and day-3 topics (june-t2, june-t4) already treat waves as known; journal-1 and journal-4 are the stale side, not journal-4 alone, and DESIGN.md:204 lets the owner keep the ledger as a fixed once-per-level s … Where: `js/story-crew.js:144`, `js/story-crew.js:155`.
  Proposed: Owner decision between: (A) accept the gap under DESIGN.md:204 and add a line to DESIGN.md recording it as known; (B) soften the ledger: js/story-home.js journal-4 fact 1 "The first walkers came to the fence at dusk." -> "The biggest group yet came to the fence at dusk." and fact 3 "June learned that they come in waves, with calm in between." -> "June has learned that they come in waves, with calm in between.", plus journal-1 fact 5 "You took the first watch at the window, and nothing came." -> "You took the first watch at the window."; carry both into js/content/levelN-home.js T.journal[0] and T.journal[3] at all six levels (drop "Nothing ca …
- **Radio has Ruby learn Dev's whereabouts she already knew** (low). After Rosa told Ruby (a day behind Dev at Greenhouse Row, next door to the Water Tower) that Dev went north to the Water Tower, radio-15/16 still have Ruby need Dev's radio message and set out west from Ridge Lumber on the east side; the detour is never explained. Where: `js/story-home.js:287`, `js/story.js:226`.
  Proposed: Owner decision. Lightest stitch if wanted: js/story-home.js radio-16 add a fact 'Ruby had gone back east to scout Ridge Lumber when the message reached her.' carried into T.radio[15] at level1-home.js through level6-home.js; alternatively soften garden-trail1's level texts (level2-places1.js:340 'ran north', level4/5/6 'north to the Water Tower') to Rosa pointing her on without naming the tower, keeping the fact 'told her where he went'.
- **Tomas can still 'hope Ortiz is out there' after Theo's radio said he is safe** (low). tomas-t5 (day 9, 1 star) and journal-9 have Tomas hoping Mr. Ortiz is 'still out there', and nothing stops a player from hearing them after radio-15 has told the cabin where Ortiz is; the rule in STORY.md:125 gates the crew's answer on Dev's note only, so the overlap is a design gap, not a false fact. Where: `js/story-crew.js:223`, `js/story-home.js:283`.
  Proposed: Owner call. Options: (a) accept the overlap (the rule in docs/STORY.md:125 stands, tomas-t5 and journal-9 stay); (b) add a `radioBefore` key to crewWhen in js/crewstate.js (false once save.radioHeard >= N) and set tomas-t5 to when {day: 9, stars: 1, radioBefore: 15}, which is engine work; (c) reword the hope as past in the fact (js/story-crew.js:223 'Tomas hoped for a long time that Mr. Ortiz was still out there somewhere.') and all six tomas-t5 texts plus journal-9 (js/story-home.js:64 and six levelN-home.js), which touches 13 texts for an edge case.

### The convoy, the Hollises and the vehicles

STORY.md now says only that the Hollises left to join the convoy. Kate's fridge note still says they went north on 'Sergeant Vega's trucks', while the convoy never leaves on the page and its trucks are Chief Dunn's.

- **How-it-works calls the crew's van the last working van in town** (low). The game's pitch calls the crew's van 'the last working van in town' (docs/GAME_SPEC.md:11, README.md:3, howto at levels 2-6, the base intro at levels 5-6, a level-5 typing phrase) while the story has other running vehicles (Dev and Ortiz's truck, Vega's van, Dunn's fire trucks). Where: `js/content/level6.js:10`, `js/story.js:292`.
  Proposed: Owner decision. If the owner retires the hyperbole: change 'the last working van in town' to 'the only van the crew has' in js/content/level2.js:10, level3.js:10, level4.js:10, level5.js:10, level6.js:10; change js/content/level5.js:59 'the last van in town' to 'the crew's one van'; leave level6.js:59 'the last van anyone has seen running' (already hedged) and the typing phrase; update docs/GAME_SPEC.md:11 and README.md:3 to 'your crew's one battered van'. Then run node tests/validate-text.js.
- **Who carries the people who cannot walk far: boats (L5) vs Vega's van (L6)** (low). Levels 4, 5 and 6 of firehouse-trail1 each give the convoy vehicles different jobs: L4 trucks haul the heavy load and boats carry people and bags; L5 the van scouts, trucks carry people, water and food, boats carry the heavy loads and those who cannot walk far; L6 the van carries those who cannot walk far and the boats everyone else. Levels 1-3 assign no roles. Where: `js/content/level5-places2.js:137`, `js/content/level6-places2.js:116`.
  Proposed: Owner picks one manifest (van's job: scout, carrier of those who cannot walk far, or unspecified; who carries the heavy loads). If the owner declines to choose, apply the role-neutral default: js/content/level4-places2.js firehouse-trail1: 'They carry people and bags, while the trucks haul the heavy load.' -> 'They carry people and bags.'; js/content/level5-places2.js firehouse-trail1: 'Sergeant Vega's van, out front, scouting the road ahead.' -> 'Sergeant Vega's van, with Vega at the wheel.' and 'floating alongside on the river with the heavy loads and anyone who cannot walk far.' -> 'floating alongside on the river with people and bags.'; j …
- **Kate's note hangs on a cork board, not the fridge** (low). The fact and all six levels say the note is on the fridge under a fish magnet; the game hangs it on the west wall at (11,10) two tiles south of the fridge prop at (12,8), and draws it as a cork board (NOTE_KIND kitchen: 'cork'). Where: `js/story-home.js:564`, `js/world.js:255`.
  Proposed: Owner picks one route; (a) is recommended because 'the note on the fridge' is a story image used far beyond the kitchen note. (a) ART, no text changes: in js/houseart.js add a NOTES kind (e.g. 'fridgeDoor') that draws a white fridge-door panel (handle, a magnet or two, in the style of the hFridge sprite at houseart.js:1674-1700) with Kate's paper note held under the orange fish magnet (reuse the oval/poly/circle magnet drawing from the cork kind, houseart.js:912-915), and change js/house.js:51 NOTE_KIND kitchen: 'cork' -> that new kind; NOTE_KINDS at houseart.js:1140 and the preview sets at :2233/:2244 pick it up automatically.

### Compass and left/right words

Two direction words are 45 degrees off the map, and the bible's ban on left/right inside buildings is looser in practice. Decide once whether prose directions follow the validator's eight-way rule.

- **The Public Library is north-west of the school, texts say north** (low). school-trail1, dead3, sign3 and every level say the class went "north" to the Public Library; by map coordinates the library (560,180) from the school (690,300) is dx -130, dy -120, bearing 137 degrees, as much west as north (the lumberyard's trail2 says "north and west" for the same place). Where: `js/story.js:484`, `js/story.js:512`.
  Proposed: Owner decision: either accept "gone north" as the town's idiom (STORY.md uses it that way) and leave it, or change the two facts, sign3 and the six levels to "north and west" / "up north and west to the Public Library".
- **Hospital is north-east of the tower, texts say north** (low). The hospital lies northeast of the Water Tower (44 degrees, Hill Road's own heading) while js/world.js:749 and the six panel texts say 'north up Hill Road'; this follows the game's loose four-point convention for reveal directions (no reveal note uses 'northeast', several 39-55 degree bearings are called 'north') and no validator or guide checks it, so it is a convention-level choice, not a lone error. Where: `js/world.js:749`, `js/world.js:540`.
  Proposed: Owner decides once, for the related group (garden-firehouse-north, school-library-direction-north, pip1-gasngo-west-not-8way), whether reveal directions follow the eight-way rule. If strict: in js/world.js:749 change 'is north up Hill Road' to 'is northeast up Hill Road' (one word, matching the validators' DIRS spelling at validate-text.js:446 and validate-world.js:1116), and in the six watertower-panel texts: level1-places2.js:172 'Take Hill Road north to get there.' -> 'Take Hill Road northeast to get there.'; level2-places2.js:166 'It is north, up Hill Road.' -> 'It is northeast, up Hill Road.'; level3-places2.js:166, level4-places2.js:187 …
- **Bible bans left/right inside; three main notes name left/right walls** (low). The docs ban 'left of'/'right of' inside, which the texts honour; they are silent on 'the left/right wall as seen from the entrance', which js/world.js:640 and tests/validate-world.js:76 define and which three main notes (Signal Electronics, 4th Precinct, Northgate Mall) and firehouse-dead2's found string use. Where: `docs/STORY.md:239`, `js/world.js:705`.
  Proposed: Owner picks one: (a) clarify the docs: docs/STORY.md:238-240 and docs/TEXT_GUIDE.md:62-64 add 'a wall may be called the left or right wall as seen from the entrance (js/world.js:640), always paired with a landmark; never a bare "left of" or "right of" a landmark', and add a dated DESIGN.md entry recording it; or (b) reword the three facts (js/world.js:705, :722, :767) and the found string (js/story.js:399) to drop the wall, e.g. 'its panel is by the coffee machine in the lobby', carried into all six level texts (grep 'left wall|right wall' in js/content/level*-places*.js, 32 hits) and re-run npm test.

### Yard plot signs and tags against what the yard builds

Several plot signs describe props or effects the yard does not build. Either the words change or the yard gains the props.

- **Well signs promise faster yard healing that a built Water room cancels** (medium). Every level's Well level-1 and level-2 signs (and the fact) say the Well makes you heal faster / even faster in the yard, unconditionally; effects() takes the best footRegen across rooms, so with Water 2 (regen 2) the Well's level 1 (regen 2) changes nothing, and with Water 3 (regen 3) neither Well 1 nor Well 2 (regen 3) changes anything. Where: `js/story-home.js:478`, `js/content/level3-home.js:33`.
  Proposed: Owner decision: either (a) make the Well's footRegen add on top of the Water room's (put footRegen in state.js ADD for the well only, or raise the Well's values to 4/5/6 in world.js 103-105 so each Well level beats Water 3), or (b) reword the Well facts (story-home.js 477-479) and all six levels to the absolute rate the computer already states ("the yard heals at rate 2", like T.base.rooms.well.next) instead of "faster".
- **Well sign puts the hand pump at level 2; the yard builds it at 3** (low). The Well's level-2 sign (fact and all six levels) says a hand pump with a filter has replaced the bucket, and the level-3 sign says a wired pump fills a tank; the yard's level-2 build is a roof and a crank for the bucket (the bucket prop is still placed), the hand pump first appears at level 3, and no level has a tank (level 3 pipes to a trough). Where: `js/story-home.js:478`, `js/content/level2-home.js:33`.
  Proposed: Either move the yard's builds up one step (yard.js BUILDS.well: level 2 gets the yPump, level 3 a wired pump with a tank prop such as yTankStand) or reword the Well facts and six levels so level 2 is the roofed well with a crank and level 3 the hand pump and trough.
- **Garden sign: one bed and a water tank; yard builds two beds, a greenhouse** (low). The Garden level-1 sign (fact and every level) says one raised bed; the yard builds two. The level-3 sign says a water tank feeds the beds through a hose (the level even costs a water tank); the yard's level-3 build is a hoop greenhouse behind two beds, with no tank or hose. Where: `js/story-home.js:452`, `js/yard.js:189`.
  Proposed: Smallest change is text: story-home.js 452 "two raised beds are planted with seeds" and 454 "a greenhouse stands behind the beds, and a water tank feeds them" (then the six levels); or add a yTankStand prop to BUILDS.garden[2] in yard.js and keep the words.
- **Water level-1 sign: one filtered barrel; yard builds three rain barrels** (low). The Water level-1 sign (fact and all levels) describes a single filter sitting on top of the one barrel from the empty lot; the yard's level-1 build is three rain barrels under tarp funnels, with no filter prop. Where: `js/story-home.js:489`, `js/content/level2-home.js:41`.
  Proposed: Text: story-home.js 489 "three rain barrels under funnels, with a filter on the tap" and the six levels; or swap one yRainBarrel in yard.js 169-171 for a filtered-barrel prop.
- **Garden texts put the beds behind the house; the plot is in front** (low). The yard data puts the garden plot north of and in front of the cabin (front door faces north toward the plots), but the garden is called 'behind the cabin/house' in the level 5 and 6 Garden room desc, the YARD_LOTS garden lot and both June journal facts in js/story-home.js and their words at all six levels in js/content/levelN-home.js, plus Kate's fridge note at level 6 only. Where: `js/content/level5.js:94`, `js/content/level6.js:94`.
  Proposed: Owner decision. Option A (texts): drop or replace 'behind the cabin/house' (e.g. 'across the yard', 'by the fence', 'in front of the cabin') in js/story-home.js:21, :50, :447; js/content/level5.js:94 and level6.js:94; the garden lot text and the 'cabin in daylight' and 'Before the Fall' journal entries in js/content/level1-home.js through level6-home.js (lines listed in reason); and level6-home.js:430. Option B (data): move YARD.plots.garden south of the house (rows 60-62 are inside the fence; js/world.js:349, and the paths at js/world.js:356 and the garden's face) and leave the texts.
- **Armor plate tag says it bolts onto the van; only the fence and cabin use it** (medium). The armor plate's chalk note points the player at the van door, a build that never consumes the item (plates go into Walls 3 and the cabin's Doors and Windows; van armor costs scrap); the note is in-world and not false, so this is a low-severity misdirection about the item's use, not a factual error. Where: `js/story-home.js:430`, `js/content/level4-home.js:204`.
  Proposed: If the owner wants tags to steer toward the real build: js/story-home.js:430 change "A chalk note: bolt it onto the van door at chest height." to "A chalk note: bolt it onto a door at chest height."; then in each js/content/levelN-home.js tags.armorPlate[0] replace "the van door" with "a door" (level1 'Chalk says to bolt it on a door.', level2 'Chalk note: bolt it onto a door.', levels 3-6 'bolt it onto a door at chest height'); keep level 5's 'before you reach the van' (loot is carried to the van) and leave tag[1] untouched. Each tag loses one word and stays inside its level's tag range (tests/validate-text.js:23-28).

### Who wrote St. Anne's door note

- **St. Anne Annex's door note is signed by Doc Lin, who the radio says has never reached the hospital** (low). The hospital door note (NOTES.hospital.door, js/world.js) is 'Written by Doc Lin' and describes the inside, while the grocery and pharmacy trail notes and the radio have Lin still trying to reach St. Anne Annex. Where: `js/world.js:740`, `js/story.js:121`.
  Proposed: Owner call: credit the door note to Nurse Ada (who stayed inside) or to Ruby (who has been in, per hospital-trail2 and hospital-sign2), at all six levels; or make it a note Lin left at the ambulance doors before she was turned back.

### Places where the game, not the text, may be what should change

Each of these is a mechanic the agreed design or the texts describe one way and the code does another. Changing the code changes play, so it is your call.

- **Spec says Fix all braces cracked fence; it mends holes only** (medium). docs/GAME_SPEC.md says a cracked fence segment can be braced "the same way" as a hole, i.e. with E at it or the cabin menu's "Fix all" button; in the code the computer's fence row counts and prices holes only (js/base.js fenceRow, hook main.js:533 fenceHoles) and its button calls Interior.repairAllHoles, which loops over fenceHoles() alone (js/yard.js), so cracked segments are braced only by E in the yard (yardFacing … Where: `docs/GAME_SPEC.md:136`, `docs/GAME_SPEC.md:137`.
  Proposed: docs/GAME_SPEC.md lines 136-137: "A cracked segment (under half strength) can be braced with E at it for the same 1 scrap (Tomas's fence job braces cracks too); the computer's Fix all mends holes only." Alternatively (owner decision) extend js/base.js fenceRow and js/yard.js repairAllHoles to include cracked segments.
- **Computer's fence row says 'Fence: whole' while segments are cracked** (low). The Rooms tab's fence row counts only holes (fenceHoles: segments with no health entry) and prints 'Fence: whole' otherwise. The fence also has cracked segments (health under half), which SETTINGS.fenceRepairScrap is documented to brace and which Tomas's fence tip counts and reports; those never show on the computer and its Fix-all never prices them. Where: `js/base.js:344`, `js/yard.js:791`.
  Proposed: Owner picks one of: (a) grow the code: have the fenceHoles hook (or a new fenceDamage hook) return { holes, cracks } using the same under-half rule as yard.js:1302 / crewstate.js:375-378, print 'Fence: N holes, M cracked', price Fix all at (holes + cracks) * fenceRepairScrap and make repairAllHoles brace cracks after holes; or (b) shrink the docs: change docs/GAME_SPEC.md:136-137 to say a crack is braced only by E in the yard (or by Tomas) and change base.js:344 'Fence: whole' to 'Fence: no holes'. Decide together with fix-all-label-partial and doc:spec-1/spec-fence-fix-all-cracks.
- **Doc and words say Tomas fixes broken doors; code fixes any damaged one** (medium). docs/CREW.md (twice), the tomas-t8 topic and the cabin/cabinFree reports say Tomas fixes the cabin's BROKEN doors and windows; js/crew.js targets every outer door or window below full strength (b.hp < b.max), so he also walks to and pays 2 scrap for a merely cracked one, and the report then says he fixed 'broken doors and windows' while the cabin tip (which counts hp <= 0 only) never mentioned any. Where: `docs/CREW.md:52`, `docs/CREW.md:500`.
  Proposed: Owner picks one. (A) Narrow the job to broken barriers: in js/crew.js crewTryJob (line ~791) change `if (b.kind === "inner" || b.hp >= b.max) return;` to `if (b.kind === "inner" || b.hp > 0) return;` and in crewJobLive (line ~856) `return !!b && b.hp <= 0;`; update the crew.js header comment (line 14) from 'damaged' to 'broken'. No text changes.
- **Walk-don't-run texts overstate what walking and sprinting do** (low). The guard note (fact and all levels) says "walk, and most of them stay put" and levels 5-6 say one sprint makes "the whole floor turn at once"; the engine wakes any sleeping walker within 6 tiles when you walk and 9 tiles when you sprint, through walls, and nothing else. Where: `js/world.js:767`, `js/content/level6-places2.js:300`.
  Proposed: Owner decision. Either soften the level 5/6 guard notes and level 6 dead4 (and radio-9 at levels 4-6) from "the whole floor turns at once" to "every walker near you turns at once" and keep the fact's "most of them stay put" as the crowd's habit (walkers you do not come close to), or give the mall a real mechanic (e.g. a sprint in the mainHall zone wakes the zone) so the text is literally true.
- **Road scream reach uses 56 px a tile, figures use 62.5** (low). DESIGN.md:977-978 (and js/game.js) turn the scream's 8 and 10 tiles into road px at DIFF.pxPerTile 56 (448 and 560); the later decision DESIGN.md:1136 made a road tile 62.5 units (Persp TILE) for the walkers' size, so on the road a screamer screams at 7.2 walker-tiles and frenzies within 9, not the 8 and 10 tiles docs/GAME_SPEC.md:331-333 states for everywhere. Where: `js/game.js:46`, `js/game.js:1697`.
  Proposed: Owner decision: either set DIFF.pxPerTile to Persp.TILE (62.5) so the road scream covers the same tiles as the figures (and re-run npm run balance, since screams would reach 12% farther), or leave the number and note in GAME_SPEC's screamer bullet that on the road the scream's tiles are the old 56-unit road tile.
- **Pump house promises "filters" but the cache holds one** (low). The panel note (and the Reyes Hardware and Station 12 notes that reveal this place) say the pump house has "filters" (plural), and levels 3 and 4 ask the reader to leave one; LOCATIONS.watertower.cache holds exactly one water filter, a water tank and wire. Where: `js/world.js:749`, `js/world.js:541`.
  Proposed: Owner picks: (a) append "waterFilter" to LOCATIONS.watertower.cache (js/world.js:540) and add one 'c' tile on plain floor in the pump house room of js/layouts.js (cols 12-17, rows 1-4; e.g. (15,3)), after the existing three in reading order so old saves keep their spots; no text changes; or (b) change the three facts to singular ('a water filter, a water tank, and wire' at world.js:749; 'has another water filter in its pump house' at :684; 'has a water filter in its pump house' at :736) and carry it into all 18 texts (panel, hardware-paint, firehouse-desk at six levels), dropping 'leave a filter' at level3-places2.js:166, level4-places2.js:18 …

### Level 1 sentence rule for lists and greetings

TEXT_GUIDE says every level-1 sentence is whole. Level 1 uses short lists and greetings ('Reyes here.', 'Theo out.') in many places. Either the guide allows them or a sweep rewrites them.

- **Level 1 job board lists fragments, not whole sentences** (low). Level 1 autoshop-dead1 transcribes the job board as three colon fragments; TEXT_GUIDE.md:98's complete-sentence rule does not say whether quoted lists are exempt, and other level 1 list notes (hardware ledger) follow the same pattern. Where: `js/content/level1-places1.js:243`, `docs/TEXT_GUIDE.md:98`.
  Proposed: Owner decides for the related group. If the rule is strict: level1-places1.js:243 'JOBS:\nChief Dunn's fire truck: new brakes.\nSergeant Vega's van: new tires.\nCarla's boat motor: not done yet.' -> 'Chief Dunn's fire truck needs new brakes. Sergeant Vega's van needs new tires. Carla's boat motor is not done yet.' (81 -> 83 words, range 65-130). If lists are exempt: add one sentence to docs/TEXT_GUIDE.md after line 98 saying a quoted list or board may keep its fragments.
- **Level 1 ledger note uses sentence fragments** (low). The level 1 ledger quotes Mr. Reyes's list as verbless entries ('Carla: one long saw.', 'Chief Dunn: two ladders.', 'Theo: one pipe wrench. Never returned. Again.'), while docs/TEXT_GUIDE.md:98 says every level 1 sentence has a subject and a verb; whether quoted list-form notes are exempt from that rule is undecided. Where: `js/content/level1-places1.js:137`, `docs/TEXT_GUIDE.md:98`.
  Proposed: Owner decision with the related level-1 list findings. If the owner wants complete sentences: in js/content/level1-places1.js:137 replace the three list lines with 'Carla took one long saw.\nChief Dunn took two ladders.\nTheo took one pipe wrench. He did not bring it back, again.' (keeps Carla, Dunn, Theo for the validator, keeps the word 'again' for the sentence that follows, every sentence under 9 words, note goes from 80 to about 84 words within 65-130). If list-form quotes are exempt, add that sentence to docs/TEXT_GUIDE.md under 'Level 1: whole thoughts' and change no text.
- **Level 1 trail2 opens with a sentence fragment** (low). 'Good reading.' is a verbless two-word exclamation of the kind level 1 uses for greetings and sign-offs throughout (Good eye., Well done., Reyes here., Theo out.); it breaks TEXT_GUIDE.md:98 only if that rule is read to cover such openers, which the current texts do not. Where: `js/content/level1-places2.js:218`, `docs/TEXT_GUIDE.md:101`.
  Proposed: Owner sets the policy once for the related group: either (1) amend docs/TEXT_GUIDE.md:98-99 to say greetings, sign-offs and two-word exclamations ('Reyes here.', 'Theo out.', 'Good eye.') and list items are allowed at level 1, and change nothing in the texts; or (2) keep the strict rule and sweep level 1, in which case level1-places2.js:218 "You found it! Good reading. Here is the deal." -> "You found it! You read well. Here is the deal." (110 -> 111 words, inside 65..130, no sentence over 9 words) along with the other openers and sign-offs.

### How much a note may vary between levels

These differ between levels in ways that could be flavour or could be contradictions.

- **Decoy sticky note's writing and correction differ by level** (low). The decoy sticky note is in faded ink at levels 1, 2 and 4 (neat at 2 and 4) but in faded pencil, quick and slanted, at level 3 and round and bubbly in ink at level 5; level 1 says nothing about neatness. The correction is the narrator's at levels 1 to 4, a line signed by Okafor on the sticky itself at level 5, and a separate staff memo with an anonymous pencil line at level 6. Where: `js/content/level2-places1.js:193`, `js/content/level3-places1.js:144`.
  Proposed: Owner's call. If harmonising, the minimal edit keeps the majority (neat, faded ink, written by a staff member): js/content/level3-places1.js:144 'The writing is in pencil, quick and slanted. Someone was in a hurry to remember it.' -> 'The writing is in ink, neat and small. Someone wanted to remember it.' and 'The pencil has faded' -> 'The ink has faded'; js/content/level5-places1.js:201 'The writing on it is round and bubbly, with a little heart over one letter.' -> 'The writing on it is neat and small, in blue ink.' (note 220 -> 217 words, range 190 to 260).
- **First-aid book journal line: levels name different speakers and nicknames** (low). June's june-4 ledger line adds a different who-said-what at every level but level 1 (L2 Tomas/Nurse June, L3 Pip/Doctor June, L4 Tomas/"it is late"/student, L5 Tomas at dawn/Student June, L6 Pip near midnight/studying), none pinned by the facts; the june-2 ledger line (levels 3-6) carries the same kind of per-level tail, so this is a pattern in June's quest journals, not one stray line. Where: `js/content/level2-quests.js:53`, `js/content/level3-quests.js:39`.
  Proposed: Owner decision on the pattern. If per-level flavour in June's ledger tails is accepted, drop. If one story is wanted: pick one tail (the level-4/5 one is the natural pick: Tomas finds her still reading late and she answers that a student is never done) and carry it at levels 2-6 of june-4 journal within the tag ranges (L2 29 of [14,30] has room for about one word, so shorten its current tail rather than append; L3 30 of [18,36]; L4 36 of [22,44]; L5 49 of [26,52]; L6 55 of [30,62]); leave level 1 (22 of [10,24]) bare.
- **Levels 3-6 describe a dial padlock; the game shows a keypad** (low). Levels 3-5 describe the kiln padlock as a dial/wheel combination lock while the engine shows a typed 0-9 keypad; the mechanic itself (four digits, wrong code jams it for good) is told correctly at every level. Where: `js/content/level3-places2.js:203`, `js/content/level4-places2.js:229`.
  Proposed: If the owner wants it softened (same decision as police-dial-vs-keypad): level3-places2.js:203 "an old padlock with a number dial" -> "an old padlock with a code" and "Spin the dial to each number, slowly. Give it a good yank, and the lock drops open." -> "Put in each number, slowly, then give the lock a good yank, and it drops open."; level4-places2.js:229 "the kind with four little wheels" -> "the kind that takes four numbers", "Roll the wheels to those numbers" -> "Put in those numbers", "Roll it right the first time" -> "Get it right the first time", "check each wheel before you tug" -> "check each number before you tug"; level5 "Spin the …
- **Job board fixes Sergeant Vega as 'she'; bible and precinct avoid a pronoun** (low). Sergeant Vega is 'she/her' in autoshop-dead1 at levels 2, 4 and 6 but 'him' in the level 6 radio-30 text (js/content/level6-home.js:318); docs/STORY.md:157 records no pronoun. Where: `js/content/level2-places1.js:242`, `js/content/level4-places1.js:258`.
  Proposed: Owner picks the pronoun and records it in docs/STORY.md:157. If 'she' (the majority, three sites): level6-home.js:318 'I believe him.' -> 'I believe her.' If 'he': level2-places1.js:242 'She paid' -> 'He paid', level4-places1.js:258 'I gave her' -> 'I gave him', level6-places1.js:275 'She paid' -> 'He paid'.

### Art against text

Each needs either new art or rewording.

- **Level 6 trail1 says the boats are visible in the yard** (low). Level 6 trail1 asserts the player has seen the boats and level 5 dead3 places them in the walkable back yard, where the layout draws none; the boats must stay at Ridge Lumber (Vega checks them there), so either the yard gets a boat prop or the two texts move them out of the player's sight on the property. Where: `js/content/level6-places2.js:257`, `js/content/level5-places2.js:324`.
  Proposed: Owner picks one. (a) Art route: add a flat-boat landmark/prop in the back yard (new sprite, a layouts.js lumberyard decor or landmark entry, docs/SCALING.md add-a-place checklist, validate-world must stay green); no text change then. (b) Text route (default if no art): level6-places2.js:257 replace "You probably noticed the boats. Hard to miss a hull the size of a living room in the middle of a lumber yard." with "You will not have seen the boats yet.
- **Quest 2's jar text says a sensor inside; the jar art is full of beans** (low). tomas-leo-2's object is 'Jar with a nose sensor' whose tag says 'Inside is a small silver sensor on a wire'; object.art 'jar' is crewart's 'glass jar of beans' (Rosa's jar for june's quest), which paints 46 bean ovals filling the jar, so the picked-up object shows beans, not a sensor. Where: `js/story-leo.js:247`, `js/story-leo.js:237`.
  Proposed: Owner picks one of two routes. ART route (matches the author's intent at story-leo.js:197): in js/crewart.js add a kind `sensorJar` next to jar() (same glass rbox, clip, paper label and red lid; replace the brown fillRect and the 46-oval loop with a pale glass interior, one silver coiled wire line and a small silver square); KINDS derives from Object.keys(Q) at crewart.js:1768 and the prerender list at :1807 maps KINDS, so it registers itself; add "sensorJar" to ART_KINDS at tests/validate-world.js:888, to QUEST_KINDS at tests/validate-art.js:76 and to the kind list at docs/CREW.md:287-288; set js/story-leo.js:237 art to "sensorJar" and amend …
- **Journal day 1 gives the cabin a woodstove the house lacks** (low). June's first entry (fact and six levels) and other crew texts give the cabin a woodstove, and the cabin's exterior shows a chimney and firewood, but no room in house.js FURNISH has a woodstove prop (the kitchen hStove is a cooking range). The interior simply omits it; no text or fact says the cabin has none. Where: `js/story-home.js:14`, `js/content/level1-home.js:86`.
  Proposed: Owner's call. If anything: add a woodstove prop in the living room (js/house.js living(), plus a small hWoodstove sprite in js/houseart.js listed in ZSR.HOUSE_ART so tests/validate-art.js draws it); do NOT remove 'woodstove' from journal-1, which would also require changes at story-home.js:14, six level texts, level3-leo.js:140 and would contradict the chimney and firewood outside.
- **Mars sits east-southeast in code, 'southeast' in the docs** (low). docs/UNIVERSES.md and DESIGN.md say Mars hangs low to the southeast; js/crossart.js places it at az = PI/6 (30 degrees south of east, east-southeast) under the stated convention '0 east, -PI/2 north', while Mira-9 uses the exact -PI/4 for northeast. Where: `docs/UNIVERSES.md:165`, `DESIGN.md:2361`.
  Proposed: The owner picks one. (a) Keep the art: change docs/UNIVERSES.md:165 to 'Mars low to the east-southeast', and add a new dated line to DESIGN.md next to the Fortitude sky entry (about line 2362) saying Mars sits east-southeast (az PI/6). Do not rewrite the old log line. (b) Keep the docs: set js/crossart.js:297 to 'MARS: { az: Math.PI / 4, up: 0.12 },' for true southeast. Nothing else reads MARS.az except js/crossart.js:325. No fact or level text changes either way.
- **Hollis notes are not on the walls of every room** (medium). DESIGN.md:30 ('every room') and docs/STORY.md:43 ('one note per room') overstate the build: 15 of the 20 HOUSE.rooms carry a Hollis note; the hallway, the second bathroom and the office, linen and toy closets have none (the coat closet does). STORY.md's table lists only the office closet as note-less. Where: `DESIGN.md:30`, `js/world.js:241`.
  Proposed: Owner picks one. (A, docs only, the safe default) DESIGN.md:30: after 'on the walls of every room, at all six levels.' append ' (Built as fifteen notes: the hallway, the second bathroom and the office, linen and toy closets have none.)' docs/STORY.md:43: change '(one note per room, read up close on the wall;' to '(fifteen notes, one in each lived-in room, read up close on the wall; the hallway, the second bathroom and the office, linen and toy closets have none;' and add a table row after the Office closet row: '| Hallway, second bathroom, linen closet, toy closet | (no note) | |'.
- **Trail2 "between the crates near the big red wheel" is six rows away** (low). The trail2 found string (js/story.js:591) and the trail1 last fact (js/story.js:589) reuse the door note's phrase 'the crates near the big red wheel', which in the door note means the stack at (7-8,1-2) by the filter; spot 7 is instead between the row of stacks at rows 8-9, six rows from the wheel. Ambiguous rather than wrong; no rule or validator is broken. Where: `js/story.js:591`, `js/story.js:588`.
  Proposed: Owner's call between two routes (or drop, low severity). Layout route (preferred if any change is made): in js/layouts.js:836 change '7: [7, 9]' to '7: [6, 3]' (plain floor between the wheel at (3,3) and the stack at (7-8,1-2); validate-world passes), then change 'between the crates' to 'by the crates' in js/story.js:589 and :591 and in the six watertower-trail1 texts: level1-places2.js:176 and level2-places2.js:170 'It is in the pump hall, between the crates.' -> 'It is in the pump hall, by the crates.'; level3-places2.js:170, level4-places2.js:191, level5-places2.js:251, level6-places2.js:210 'between the crates near the big red wheel' -> ' …

### Crossover canon

Story choices in the Captain Leo and Fortitude storylines.

- **Robot dog stands, sniffs, beeps and learns before it has a battery** (medium). Quests 1 and 2 have the dog stand up and sit 'with a click', sniff the air, beep twice and learn to sniff the van's fuel line; quest 3 then says its battery is dead and only a Bolt-model cell fits it, and levels 4-6 add 'Without power, it is just a very heavy statue'. The chain contradicts itself in order. Where: `js/story-leo.js:271`, `js/story-leo.js:225`.
  Proposed: Owner picks one. Option A (weak battery): js/story-leo.js:271 -> 'The robot dog's old battery is nearly dead, and only a Bolt-model cell fits it.'; level1-leo.js:131 'battery is empty' -> 'battery is nearly empty'; level2 'has no power left' -> 'has almost no power left'; level3 'has run flat' -> 'is nearly flat'; level4 'is flat' -> 'is nearly flat' and 'Without power, it is just a very heavy statue.' -> 'It wakes for a minute, then slumps.'; level5 and level6 'completely drained' -> 'nearly drained' and 'Without power, the robot dog is just a very heavy statue, and Tomas has stubbed his toe on it twice.' -> 'It wakes for a minute, then slum …
- **The 'base facts' the crossover leans on are not in the facts** (medium). docs/UNIVERSES.md:29-30 lists as base facts (a) 'some sickness across the river' and 'probably nothing', which appear only in the level-6 Gas-N-Go to-do list (level6-places1.js:31), not in gasngo-dead1's facts (js/story.js:19) nor at levels 1-5; (b) 'alarms and running', which only the level-6 school texts carry (level6-places2.js:42, 89); and (c) 'within one week', which no base text says (it is the crossover's own  … Where: `docs/UNIVERSES.md:29`, `docs/UNIVERSES.md:27`.
  Proposed: Owner call between: (a) make it a base fact: append to gasngo-dead1.facts in js/story.js a line such as "Ruby's message was about the news: some sickness across the river. Probably nothing." and add the matching sentence to the gasngo-dead1 text at levels 1-5 in js/content/levelN-places1.js (level 6 already has it), keeping each within its level's length range and running `node tests/validate-text.js`; or (b) doc-only: rewrite docs/UNIVERSES.md:29-30 to "The only base mention of the origin is Dev's to-do list at Gas-N-Go, at level 6 only: 'some sickness across the river.
- **Doc promises a Mr. Reyes descent topic; no such topic exists** (medium). docs/UNIVERSES.md (and the owner decision in DESIGN.md) say the Fortitude crew talk includes Mr. Reyes of Reyes Hardware claiming descent from Dr. Camila Reyes; js/story-fortitude.js appends only six topics (june-fort-t1/t2, tomas-fort-t1/t2, pip-fort-t1/t2) and none of them, nor any journal, radio or quest fact, mentions Mr. Reyes or his family. Where: `docs/UNIVERSES.md:124`, `DESIGN.md:2327`.
  Proposed: Owner decision: either append a seventh topic (e.g. june-fort-t3 or tomas-fort-t3, universe fortitude) carrying the Mr. Reyes claim as unproven, with words at all six levels in levelN-fortitude.js (Reyes Hardware is known at the start, so the place rule holds), or strike the Mr. Reyes sentence from docs/UNIVERSES.md:124 and mark the DESIGN.md:2327 decision as not built in v1.

### Settings, controls and tooling

- **Settings says every instruction changes with level; prompts and hints do not** (low). index.html says the reading level 'Changes every note, sign, and instruction in the game', but the lock prompts ('Which button do you press?'), the E hints ('Press E to use the keypad') and the toasts are one fixed English text at every level, and the spec itself claims only notes, signs, door notes, room descriptions and How it works (plus the known tutorial exception). Where: `index.html:112`, `js/building.js:766`.
  Proposed: Owner's choice, one of: (a) reword index.html:112 to '<p class="small muted">Changes every note, sign, and page of reading in the game. Facts stay the same; the words change. June\'s first-day tutorial uses the simplest words for everyone.</p>' (covers both the unleveled prompts/hints and the tutorial exception, matching README.md:9-11); or (b) leave the line as recorded in DESIGN.md:451-452. No validator reads index.html, so either is safe.
- **Controls name 'side buttons' hidden on keyboard-and-mouse devices** (low). The Road controls line at all six levels and in the fallback names 'the side buttons'. They exist (js/game.js:323) but show only on coarse-pointer devices, and the title screen refuses coarse-pointer devices that cannot hover. So the buttons appear only in the narrow case of a touch device with a hover-capable pointer attached, a case README.md:32-33 and DESIGN.md:242 still describe as supported. Where: `js/content/level1.js:19`, `js/content/level6.js:19`.
  Proposed: Owner decides this together with help:readme-1/readme-touch-only-blocked. If the road should keep working on touch, change nothing. If the game is keyboard and mouse only, delete 'and the side buttons' (level1.js:19, level2.js:19) or ', or the side buttons' (level3.js:19 to level6.js:19, so the list ends 'A and D or the arrow keys change lanes') and 'or the side buttons' in js/main.js:465. In the same pass, fix README.md:32-33 ('The map and the road also work on touch') and leave DESIGN.md:242 as a superseded log entry, or add a dated entry.
- **.claude/settings.json allows validate-content.js and npm run lint, which do not exist** (low). The permission allowlist names `node tests/validate-content.js` (no such file in tests/; it last existed in the early commits, e.g. af99ab5) and `npm run lint` (package.json has test, validate, balance and start only). Where: `.claude/settings.json:12`, `.claude/settings.json:11`.
  Proposed: Owner's call. If the entries are to go: delete the two lines `"Bash(npm run lint)",` and `"Bash(node tests/validate-content.js)",` from permissions.allow in .claude/settings.json (lines 11-12); nothing else changes and npm test is unaffected. Alternatively the owner adds a `lint` script to package.json if one is wanted. No game file, text or doc changes either way.
- **Balance data cites econ.js, which the repo does not hold** (low). tests/balance/loadouts.json and targets.json say the per-day van comes from an economy model in econ.js, and DESIGN.md leans on that model's schedule (nobody drives to a danger 5 place before day 17); no econ.js exists anywhere in the repository (tests/balance holds args, compare, core, run, stats and the three json files), so the schedule DESIGN cites cannot be read or re-run. Where: `tests/balance/loadouts.json:1`, `tests/balance/targets.json:1`.
  Proposed: Owner decision: either check econ.js into tests/balance (so `npm run balance` and the day-17 claim can be reproduced), or reword loadouts.json's _doc and targets.json meta.loadouts to say the economy model was a one-off script not kept, and give DESIGN.md's schedule claim the loadouts table as its only surviving source.

## Fixed on this branch

One line per finding, grouped by area. The finding ids are in the audit's working files; the fix is in the diff.

### Buildings: autoshop

- Level 6 photo note placed by a workbench; it lies in the parts room.
- Mr. Ortiz ran the shop thirty years (L2-L4) or forty (L5).
- The truck took eleven days (L4) or nine days (L6).
- L6 Dev counts more walkers in the parts room daily; Ruby and the rule say one.
- Shop sign put above the bay (L5) / on the back wall (L6); it is on the shop's west wall.
- Service pit plate said to be above/over the hatch; it is beside it.
- Job board fixture, writing and who-paid differ across levels.
- Key tag is cardboard (L4) but leather (L5, L6).

### Buildings: firehouse

- Sign 3 puts the two bay walkers by the water tank; rule does not.
- dead3 'between the desks' but office has one desk, spot is beside it.
- Key board said to hang on the wall; fixture sits on the counter.
- Level 6 chili note puts Sergeant Vega 'upriver'.
- Watch desk manned 'thirty years' (L4) vs 'forty years' (L6).
- What Vega burned: rice (L2) vs a pot of water (L4).
- Convoy people list is page two (L4) but page three (L5, L6).
- Ortiz fixed the trucks in three days (firehouse L5) vs two weeks (autoshop L5).
- Radios before Priya: every handset dead (L5) vs half (L6).
- L6 door puts the tool kit on a shelf under a window; office has neither.
- L6 sign1 says it is painted above the wide doors; it is on the side wall.
- Safety board is green (L5) but a whiteboard with blue marker (L6).

### Buildings: garden

- Trail1 levels disagree on when the truck came.
- Level 6 dates June's bean seeds to the Fall; others say years ago.
- Level 3 decoy understates the can alarm.
- Seed vault door is 7 tiles from the big gnome, texts say near it.
- Level 6 door says walkers are not quick; danger 2 spawns runners.
- Level 5 graffiti claims walkers lose you in the shade.
- Door notes at levels 4-6 say the other walkers wander.
- Station 12 is northeast of Greenhouse Row, texts say north.
- The Greenhouse Row name sign faces the bee yard, not the gate.
- Levels disagree on sign2's surface; the shop wall is wood.
- Level 6 puts the shed sign over the door; it is beside it.

### Buildings: gasngo

- Dev's to-do list differs by level: day, call count, mop.
- Peanut's storm is Tuesday at level 4, Sunday at level 6.
- Level-6 flyer uses the banned word "bitten".
- Level 6 has Peanut waiting by the ice machine, a back-room landmark.
- Gas station manager is a woman at level 5, Mr. Patel at level 6.
- Level 5 puts trail1 "by the slushie machine"; it lies 5 tiles away.
- Level-4 door note places the other walkers on the shop floor.
- Decoy note's "the walker in the garage" is not kept by any rule.
- STORY.md calls the Gas-N-Go stash the old restroom.
- trail2's reveal of Corner Grocery never fires: it is known from the start.

### Buildings: grocery

- Hana managed the store six years (L3/L4) vs nine years (L6).
- Hana's schedule: who was on shift differs at levels 4, 5 and 6.
- Medical kit 'on the top rack/shelf' but cache items lie on the floor.
- Level 6 says you walked right past the key at the door.
- Gas-N-Go level 5 calls the staff locker 'full of medicine'.

### Buildings: hardware

- Hands sore for a week (L4) vs two days (L5).
- Radio says Reyes cut half the town's keys; his notes say all fifteen.
- Door notes say the two aisle walkers shuffle; they stand until woken.
- Store sign colors differ at every level.
- Key tag is square print at L4, looping script at L6.
- Level 4 door note puts the tools on a pegboard in the middle aisle.
- Theo's wrench count: third at levels 2/4/6, fifth at level 5.
- Carla's saw and Dunn's ladders: returned or not, and what for.
- Grandson is six at level 5, eight at level 6; nails per board differ.
- Mr. Reyes built the store (L5) vs his father opened it (L6).
- Why and when the back room frame bent differs by level.
- Sign 4 'written on the back room door' is on the wall beside it.

### Buildings: hospital

- Level 4 floor map puts YOU ARE HERE by the front doors.
- Level 6 puts the stock room door under the PHARMACY sign.
- Level 6 door note: stock room shut until the note is read.
- Generator log: Lin-is-close entry is Day 46 vs Day 52.
- Sign-in sheet: pen long gone at level 6, still tied elsewhere.
- Staff memo dated first week of the Fall vs before the Fall.
- Level 4 sign-in sheet names rooms the layout lacks.
- "Most dangerous place in town" but the mall ties it.

### Buildings: library

- Velvet pouch is dark red at level 5, dark blue elsewhere.
- Index card levels disagree on what the thief did.
- When the class arrived differs by level and radio.
- Shelter rules numbers differ between levels 4, 5 and 6.
- Reading chart: on tables vs wall, twins' rows bottom vs middle.
- QUIET sign placed in the reference room; it is by the A-M stacks.
- L6 door note: every door opens onto the hall; four do not.
- L6 trail1: 'you have passed the reading rooms' before reaching them.
- L5 says follow the clock's ticking; its art has the hands stopped.

### Buildings: lumberyard

- Radio 16 says Ruby's gate note bans the saws; it does not.
- Levels 5 and 6 put the yard sign on the back wall; it is front.
- dead3 levels disagree: boats unpainted vs painted gray.
- dead1 levels disagree on the new rule's ink and the board.
- trail1 levels name different woods for the boats.
- dead4 found says just inside the dock door; spot is 4+ tiles off.
- sign4 is 'on the kiln shed door' but sits on the wall beside it.
- Levels 5-6 promise boxes of nails; the kiln holds one box.

### Buildings: mall

- Trail1 and two dead notes name a fountain and a balcony the mall lacks.
- Level 6 names a side door, north entrance and loading door.
- Levels 5 and 6 put the banner on the back wall or the ceiling.
- Level 4 puts the store map by the front doors.
- Luis's years on the job differ between levels 5 and 6.
- Luis's niece is Sofia at level 4, Sofi at level 5, unnamed at 6.
- Security sign is beside the office door, not on it.

### Buildings: pharmacy

- Levels disagree on how long Mr. Okafor was the pharmacist.
- Level 5 sign says old code only makes the keypad beep.
- Blurbs put the medical kits on shelves; they lie on the floor.
- Level 1 puts the cabinet room door 'by the wheelchairs'.
- June's pill label: once a morning vs twice a day.
- Comment card: cough syrup and six in line vs allergy pills and three.
- Lin sat on the counter (L4, L5) vs on the floor (L6).
- Health poster picture differs at every level.

### Buildings: police

- Levels 2, 3, 5 call the armory lock a dial; the game is a keypad.
- Door note at levels 4 and 6 invents a cruiser in the garage.
- Lost-and-found levels disagree whether the bike is still there.
- Level 3 puts the leash on a hook by the desk; the game puts it in the garage.
- Leash tag says front steps; L4 note says river path, L6 clip frayed.
- Level 5 letter calls Vega's brother 'your brother'.
- Levels disagree where Vega's brother lives upriver.
- Level 6 trail2 title puts the orange-rope key by the kennel.
- Level 5 says the key is near the front door and you walked past it.
- Level 6 decoy misdescribes what the alarm does.
- Wanted-board sign is in the lobby; the wanted boards are in the squad room.
- Levels disagree whether the twins met Vega or left a note.

### Buildings: radioshack

- Level 6 repair tag gives Vega the boats; the convoy facts give them to Carla.
- Level 5 says the panel light goes dark; the game turns it green.
- Repair tag levels disagree: handheld vs dash radio, three vs four channels.
- Level 4 says the radio was picked up; levels 5 and 6 say it still sits here.
- Three days on the tower at level 5, two days at level 6.
- Level 6 puts Ruby's R beside the front door; it is on the left wall.
- Door notes say the robot walker wakes when the door opens.
- Sign4 is 'on the door' but painted on the wall beside it.
- Level 6 tells the player to carry the chief's radio to Station 12.

### Buildings: school

- Ms. Adler taught nine years at level 2, eleven at levels 4 and 6.
- Levels disagree on what the closet key looks like and sits under.
- Twins sleep in the music room at level 4, the principal's office at level 5.
- Level 6 Vega cannot follow the class's trail; levels 4-5 Vega read where it went.
- Office book box is eight tiles and a wall behind the lion statue.
- Level 6 dead4 says skip the office, which holds a book box and the stash.
- Levels 3-4 blurbs put the book boxes in classrooms.
- Level 6 trail1 sends the twins to the rigged bottom drawer.
- Texts say the hallway walker paces and turns; it stands asleep.
- Teacher's note is at the science room front, not by the big brain.
- Level 2 door says several boxes of books per room.
- Levels 4-6 hedge that the decoy drawer "may" be rigged; it always is.
- Level 4 sign2 says exactly six walkers; count is at least six.
- Decoy spot is by the gym's west wall, not the middle or center line.
- Level 6 sign2 is on lockers; the sign tile is the lobby wall by the exit.
- Level 1 menu puts tacos on Monday; the board and other levels say Tuesday.

### Buildings: watertower

- Jo's antenna: dead4 calls it a plan, the rest say it stands.
- Signal Electronics level 4 says the antenna was never finished.
- Level 2 puts the water rules card by the pumps, not the door.
- Levels disagree on how many water rules the card has.
- Chalk graffiti gains words at level 3 and rain at level 4.
- Paper plate note written in marker, crayon or pen by level.
- The DANGER plate is red at some levels, yellow at others.
- Level 6 door note turns "at least six" into exactly six.

### Crew

- Knee tape tag says sealed in plastic; art draws end curling loose.
- Seed box label "on the lid" at levels 5-6; art paints it on the front.
- CREW.md QUESTS example describes a june-1 that no longer exists.
- Station 12 toolbox lettering is gold at levels 4-5, white at 3 and 6.
- Father's handwriting slanted at levels 4-5, square at level 6.
- Van health tooltip omits Tomas's manual perk as a max raiser.
- June's food tip counts trips without the dog's food.
- Pip's `full` tip says danger stops growing; walker health keeps rising.
- docs/CREW.md still lists logWork(id, "heal", hp).
- docs/CREW.md says posts are tested at levels 0 and 3 only.
- docs/CREW.md lists lumber and wire among Tomas's errand items.
- docs/CREW.md: "Quest i needs exactly i stars" is off by one.
- CREW.md names CREW_UI facts that do not exist.
- Level 1 quest ledger lines: pip-2 signed, pip-1/3/4/5 not.
- Level 4 pip-1 says Pip taped the drawing; house note says pinned.
- Level 3 june-t6 says 'known for weeks' at a day-7 topic.
- Pip's lookout spot: back fence (topic, post) vs porch roof (quest).
- pip-t6: the list of voices is a different object at each level.
- pip-m4: marble test already done (L3-L5) but still planned (L6).
- CREW.md tips table says first-that-applies; code rotates regular tips.
- TEXT_GUIDE lists {sides} values but omits 'every side'.
- Pip's wire-coil label reads differently at levels 2 to 5.
- Levels disagree on whether Tomas plays Gus's guitar.
- Tomas says no van damage heals overnight; the game restores it to 40%.
- Level 3 says Tomas is still growing; levels 4-6 say he is done.
- Level 2 says June doubts the engine talk; levels 3 and 6 say Pip.
- Level 5 says no more scrap goes to dents; road patches still cost.

### Crossover universes

- 'About six bites' and 'bite about 10': a plain walker bites 12.
- Sky comment points at js/crossover.js, which does not exist.
- UNIVERSES.leo.name comment says 'the HUD'; only the slot summary uses it.
- Levels 1-2 say Rivet follows you 'everywhere'; not the road or river.
- 'Not in v1: found items' contradicts Leo's five tagged quest objects.
- Leo quest texts put the robot dog in a garage the base may not have.
- Docs say a pistol does 25 damage; the pistol does 12 (21 maxed).
- Quest 4 promises eyes for the dark and a voice to warn; Rivet only zaps.
- CREW.md still counts QUESTS as 15; the list holds 25.
- Level 1 ledger says the Fall's first week is now.
- Abyss Explorer pin is a keepsake copy only at levels 4-6.
- Doc says Pip listens to background waves; the chain never does.
- Doc says June's lines cover the bursts; none do.
- Level 1 pod-tag band says return to the Vault, not front desk.
- Header calls the pod tag a Book 1 keepsake.

### Docs and tests

- validate-drive keeps every draw call of dead sections: 2.3 GB leak, OOM.
- SCALING 'Already at the limit' lane window 2.53 s; validator prints 2.96 s.
- SCALING test times (validate-drive ~90 s, npm test 3.5 min) are stale.
- SCALING says Walker3D CC_N is 16384; code and its own later section say 32768.
- SCALING 'Today's size' crew row: 30 topics, 15 quests; data has 42 and 25.
- SCALING names wrong tests as having hardcoded landmark file lists.
- TEXT_GUIDE schema omits road, base.tools, house and river keys.
- TEXT_GUIDE says missing crew words only warn until written; validator is always strict.
- Dev's row omits his Water Tower and Ortiz Auto notes.
- Max and Mia's row omits their precinct and school notes.
- Ruby's row omits her inside notes at Gas-N-Go and Ortiz Auto.
- Ruby and Dev thread omits the Greenhouse Row clues.
- People table misses minor note writers.
- GAME_SPEC calls the crew card's button Yes; the game says I'll do it.
- Map canvas aria-label says City map; the game's word is town.
- GAME_SPEC says road frenzy shows red eyes and speed lines.
- TEXT_GUIDE placeholder list omits {decoyCodeSpoken}.
- TEXT_GUIDE's {dog} rule is narrower than what the validator allows.
- CLAUDE.md's fact-file list omits story-leo.js and story-fortitude.js.
- validate-world RULE_DAYS comment says the count stops growing on day 36; it is 33.
- SCALING's WALKER_FILES row omits walker3d-crew.js.
- validate-text and validate-world headers omit sections they run.
- base.tools text at six levels is checked by no validator.
- Save-state paragraph puts found quests on entry.quests; code uses recap.quests.
- 3D crew colours are duplicated literals, not read from crewart.
- Doc omits that crewHurt can return 'nothing'.
- Doc code examples use real ids with gates and counts the files lack.
- workSeconds comment in facts file omits the builds job.
- DESIGN says level 1 gets one dead-end note; code gives two.
- DESIGN says the fence is patched between waves; it never is.
- DESIGN says walking up to a plot sign opens its panel; E does.
- Level-1 door notes are 76-98 words, not 'about 38'.
- Yard signs now grow with Huge text, contrary to 'Not in this drop'.
- 'Per-player profiles' listed as not built; four per-player saves exist.
- Not every main note reveals a next place.
- Spec says river walkers every 45-90 s; code comes sooner.
- Spec says walker speed +-10%; road uses +-15%.
- Spec: sleeping walker wakes within 6; sprinting wakes within 9.
- Spec: minimap shows known roads; it draws every road, faded.
- Spec: no walker box on the HUD; road HUD has DOWNED count.
- Spec says door-note counts grow with the day; they never change.
- 'Earth' never appears in base text; 'earth' twice means soil.
- Doc lists 'the Accord' as a Fortitude crew topic; none is.
- Zaps 'slow or stagger'; the code only slows.
- 'About a tenth of the base game' is per both universes.
- Hollises 'went north with the convoy' that never leaves.
- Bible says every room has a yard plot; Walls has none.
- Bible's job list omits Tomas's wrecked-builds job.
- Pip's chore-chart post is on a chair, not the floor.
- Sergeant Vega also writes the school's trail2 note.
- Mr. Ortiz also writes a Water Tower note.
- Spec says calm is 4 to 7 minutes; code is 4 to 6:40, first calm 3.
- Spec says score is days plus base level; no such score exists.
- Spec says 15 locations plus the base; data has 16.
- Spec says Archive makes notes show stock; the map does.
- Spec says only trail2 names a key's stash; radio tips do too.
- Save format list omits a dozen fields the save actually writes.
- Content files list omits levelN-leo.js and levelN-fortitude.js.
- Alarm panel is listed as a lock kind; it is a code lock's add-on.
- DESIGN says CLAW_HOLD is 0.4 s; the constant is 0.6.
- SCALING.md says validate-balance drives 6 cells; it drives 7.
- SCALING.md omits two SCALE-tagged road limits.
- GAME_SPEC 'Van repair restores full health' predates the slider.

### Home base: journal

- Level 3 and 6 journal titles say wrong day after day 30.
- Day 28 at levels 4 and 6 assumes a garden exists.
- Level 3 day 20 assumes seeds found; level 5 says not yet.
- Level 6 contradicts itself on where the ledger came from.
- Level 4 day 11 has Pip find a radio; one is on the shelf.
- Levels disagree on small details: roof leak, the pot.

### Home base: radio

- Doc Lin 'never closer' yet wrote the hospital's door note.
- STORY.md lists the radio voices without Greer and Dunn.
- Level 4 Theo calls both Water Tower trail notes his.
- Levels disagree when Doc Lin reached Mile 9 Pharmacy.
- Level 6 says Luis has been on the air; he never speaks.
- Level 5 declares boats and parts ready before the repeat loop.

### Home base: tags, plot signs, River Landing

- Level-6 Water sign says you heal between buildings on a trip.
- Empty-lot signs place things by the cabin wall or a shed that are not there.

### Home base: the cabin

- Docs and June's post put her ledger in the living room.
- Levels 4-6 hang the chalkboard above the typewriter desk.
- Levels disagree where Finn's treehouse plan hangs.
- Level 3 puts Lucy's drawing above her bed.
- Level 3 leans Gus's guitar against the bed, not the corner.
- Gus's KEEP OUT sign hangs on a wall inside, not the door.
- Scoreboard art reads GUS vs FINN, note says Finn vs Dad.
- Foyer hooks art hangs clothes on hooks the notes call empty.
- Pantry label art says SOUP and JAM, note says peaches and flour.
- Level 1 porch note drops 'the bell carries far'.
- STORY.md keeps boxes in the office closet the code removed.

### Player help and UI

- README project layout omits ~20 shipped files and two docs.
- README and TEXT_GUIDE list seven content files; levels have nine.
- README tests row omits the typing and god validators.
- README puts the yard van and its dents in sprites3d.js.
- README add-a-location summary skips LOCKS, walker rules, ROWS.
- minAspect is on Persp, not inside Persp.cfg.
- levelN-home.js row omits the cabin notes and River Landing.
- Level 1 says 'your lane' goes straight; only the left lane does.
- Level 1 wrongSide calls every side street a dead end.
- How it works: a wrong code always alarms; Ridge Lumber jams.
- validate-text error names 'Workbench' head the texts do not use.
- Field patch says '5 times more than a cabin fix' even when cabin fix is free.
- tutorial.js comment says yard is ~2.5k tiles; it is 3,740.
- Computer card says 'Step away'; the button reads 'Step away from the computer'.
- Shoot card says a walker is in the yard before it spawns.
- README says map and road work on touch; touch-only devices cannot start.
- README: repairs "bring the van back to full"; code has a slider and field patches.
- README names Garage level 1 a carport and Water level 3 a water tower.
- README: some walkers in every wave raid the cabin; it is a 25% roll.
- README's "Five story quests" reads as five total; there are five per crew member.
- README: every plot sign says what it is; Garage/Archive/Medbay signs have no words.
- Garage texts promise all gun upgrades to tier 3/4/5; Spread Shot is capped two lower.
- Medbay 3 'van takes 20 percent less damage' applies on the road only.
- Radio 2 'reveals every place' but never River Landing.
- Typing drill addresses 'Max' at the fence; Max is a lost twin at the school.
- Stash toast sends player after a key that snapped off for good.
- Medbay 'one revive per trip' works only inside buildings, never at the river or from a trap.
- Wave-cleared toast prices Tomas's fence job at 1 scrap after the free-repair perk.
- Q with the pole propped says 'Only the pistol so far'.
- Crowbar prompt puts the 'Traps & tools' tab on the workbench.
- Garage repair card says Ruby and Doc Lin patch the van.
- Garage header: Spread Shot cap is not 'two tiers lower' without a Garage.
- 'Fix all for N scrap' buttons fix only what you can afford.
- Repair card desc omits the 5-scrap minimum.
- Stock tab 'Used by' omits the House upgrades and the crowbar.
- Stock tip calls medical kits 'health kits'.
- Level-1 pharmacy map blurb states a fixed walker count.

### Story and tone

- Journal rule 'Patch the fence before supper' uses the banned fence word.
- Level-5 hospital sign-in note reads like Doc Lin's death.
- Level-3 journal calls a dog 'him'; the dog is 'it'.
- Two fact sentences put 'her' after Pip's name.
- Kate asks to keep a garden going that the yard says never existed.
- Level-6 Dev note says the road to Greenhouse Row turns to gravel.

### Follow-ups found while fixing

Small leftovers the fixers and checkers flagged next to applied fixes, and the rest of the walker-motion texts the walker rule covers. Each went through the same fixer and checker.

- Ortiz Auto door notes and a sign say the parts-room walker wanders or paces.
- Water Tower door notes at levels 2 and 4 say the walkers drift; levels 5 and 6 say they stay put.
- Signal Electronics door notes say the other walkers drift between the aisles.
- 4th Precinct door notes say the other walkers drift or wander between rooms.
- Station 12 door notes say the other walkers wander or drift, and disagree on where.
- Public Library level 5 door note says the hall walkers shuffle.
- SCALING.md gives validate-scenery two different times.
- Level 4 job board is a whiteboard but still has a chalk tray.
- Level 6 mall dead1 lies on a crate the floor plan does not have.
- Level 4 mall banner hangs over shelves the main hall does not have.
- TEXT_GUIDE says Step away from the computer at the computer.
- story-fortitude.js sky comment has nested parentheses.
- Level 6 Medbay desc does not say the van protection is on the road.
- A level 5 Gas-N-Go trail sentence grew past the level 5 limit.
- Missing space in a base.js expression.
- Level 6 firehouse door puts the truck-bay walkers between you and the tank.
- Level 6 garden decoy describes the alarm as a bounded crowd.

## Dropped

Checked and judged not to be defects, or not worth a change.

- **Backpack "Found" line steers by "right of" for an inside note.** js/world.js:670 found "on the counter right of the front door" is anchored to the front door and is true in js/layouts.js (E at row 21 col 10; counter C at cols 12-16, rows 16-18, to the right looking in), which is exactly the convention the fact file declares at js/world.js:640-641 and tests/valida …
- **Notes say Jo announced Lin rides the convoy; radio never does.** The three notes agree with each other: js/story.js:122 'Lin plans to ride north with the River Convoy as far as St. Anne', :408 'Doc Lin wants one seat, only as far as St. Anne', and :537 'Jo says Lin will come up with the River Convoy, but the convoy is late again'.
- **Level 6 Doc Lin came 'up the river road' to the hospital.** Lowercase 'the river road' is the story's generic name for the route north along the river (js/story-home.js:92, 176, 232, 355, 360, 438; docs/STORY.md:157, 179). pharmacy-trail1 (js/story.js:122) has Lin planning to ride the convoy north on that route 'as far as St.
- **Level 5 'She' right after a sentence naming Pip.** js/content/level5-home.js:266 reads 'Pip cheered so loud that June had to remind everyone about the no-shouting rule. She was smiling the whole time she did it.' The previous sentence names both Pip and June, and 'she did it' can only mean the one who reminded, June.
- **Twins' door note cites a desk note written after they left.** The finding says no text gives the twins a later visit, but dead3 is that visit. js/story.js:508-512 says "They came back to the school and found Ms. Adler's note", and they leave north at first light. That return comes after Ms.
- **Level 4 planting chart steers by 'the left wall' inside.** The rule bans 'left of'/'right of' for notes that steer (docs/TEXT_GUIDE.md:61-65, docs/STORY.md:238-240), and tests/validate-text.js enforces exactly that phrase.
- **Door texts promise soil bags; one bag lies in the greenhouse.** The garden holds one soil item (js/world.js:531 items ['soil','seeds']; the first i tile is at row 8 col 9 in the scarecrow greenhouse). But shelf and floor items restock 3 days after they are taken (js/world.js:813 restockDays: 3; js/state.js:576-580 itemAvailable), so the big greenhouse does yield …
- **Doc says the knock comes before the broadcast; the page shows it after.** docs/UNIVERSES.md:71 ('before the day's broadcast, a three-note knock comes through') describes the story timing and matches the leo-r1 fact at js/story-leo.js:85 ('Before Jo's show, three soft notes came through'); the page order is a separate layout fact that the same doc states correctly at :139  …
- **Level 5 door note says Dev jammed the hatch; it is not jammed.** js/content/level5-places1.js:236 says 'Work it any other way and it jams. Trust me, I tried.' The jam mechanic (js/world.js:167 fail 'jam', js/building.js:573 sets cacheJammed) describes what the PLAYER's wrong try does; Dev's past try is story, and the story already allows a bent bolt to be replace …
- **Level 6 decoy implies a man was taken by walkers.** js/content/level6-places1.js:157 says the man tried the code, the alarm and walkers were heard, 'I left before I found out how it ended': no death on the page and the outcome is left open, which is within docs/TEXT_GUIDE.md:16 ('no on-page deaths').
- **Level 4 titles day 3 "The First Drive Out".** The mechanic is as described (js/state.js:353 logs Day 1 at newGame; :773 adds a day and :785 writes the page on every return), so the day-3 page follows the player's second trip, but that one-page offset is the journal's whole design (DESIGN.md:204-205: written once per level, the recap carries the …
- **Fuel tag says generator only; Power 1 and the blast trap burn it without one.** js/story-home.js:370 and every level report what the masking tape on the can says ('MIXED, generator only'), a label on a found mixed-fuel can, and the game never asks the player where fuel goes: Power 1 (js/world.js:54), Power 3 (:56) and the blast trap (:131) are recipes a can's label does not con …
- **Level 6 trail1 invents a workbench behind the counter and a glass case.** Reproduced the layout side: the radioshack grid (js/layouts.js:452-473) has no G glass case and the K desks sit only in REPAIRS (rows 1-5) and the office (24-25,2), with open floor behind the counter at rows 7-8.
- **DESIGN's '45 x 33 tiles inside the fence' is stale (now 45 x 58).** Reproduced: js/world.js:314-316 gives w 55, h 68, fence [4,4,50,63], so 45 x 58 tiles inside the fence and 55 x 68 in all, which DESIGN.md:173-174 and docs/GAME_SPEC.md:108 already state (210 segments = 2*46 + 2*59 checks). DESIGN.md:268 sits in the undated 'Typing goes slowly ...
- **Level 6 quest-1 brief names Mr. Reyes, whom its facts never name.** The project's people rule is implemented in tests/validate-text.js:489-531: a quest text may name people its own facts name and those of the giver's earlier quests; tomas-leo-1's brief fact 'Reyes Hardware is northeast of the cabin' (story-leo.js:210) matches nameRe('Reyes'), and byGiver includes To …
- **Radio's limping, blinking robot dog never squares with Tomas's dead one.** The two texts do not contradict: js/story-leo.js:73 (leo-j7), :109 (r5 'the kind every school kept') and :171 (tomas-leo-t2 'most of them shut down in the Fall') establish many Bolt-models, and Tomas's dog has no working eye lights until quest 5 (:339 'two blue eye lights') while the road dog has 'o …
- **Level 4 says the big bed costs 'hours'.** Checked js/content/level4-home.js:240 ("Rest here only when you can afford the hours."), the fact js/story-home.js:588 ("it takes time"), js/world.js:383-384 (restSeconds 60 of a 240-400 s calm) and js/house.js:631 ("60 seconds of the calm go by").
- **DESIGN.md crossover entry opens 'nothing is built yet'.** Confirmed that DESIGN.md:2307 reads 'Design only; nothing is built yet.' while the same entry has '### Built (2026-10-17): judgment calls' at DESIGN.md:2342, and docs/UNIVERSES.md:3 says 'Status: built (2026-10-17).' Under rule 4 this is a log line that was true when written and is superseded inside …
- **pip-1 says Gas-N-Go is west; true bearing is northwest.** The bearing is real: base (500,610) to Gas-N-Go (380,545) is 61.6 degrees west of north, inside the northwest sector but only 5.9 degrees from the west edge.
- **Level 1 june-t5 says sweater; facts and every other level say cardigan.** js/content/level1-crew.js:30 says "sweater pocket" where js/story-crew.js:159 and levels 2-6 say "cardigan", but level 1 does the same swap for the same garment at js/content/level1-quests.js:169 (fact at story-crew.js:412 "cardigan pocket") and the word "cardigan" appears nowhere in any level-1 fil …
- **Boom box 'with a tape deck' not in the radio art.** Reproduced: js/crewart.js:1637-1660 Q.radio draws an antenna, a handle, a teal body, two speakers (x=17, 47), a yellow dial with a red needle and three small white buttons, and no cassette door, while js/story-fortitude.js:160 names the object 'Boom box with a tape deck' and the six briefs/tags (js/ …
- **Level 5 has Tomas smile about Mr. Ortiz before Dev's note.** docs/STORY.md:137 gates the grin 'when he hears Mr. Ortiz is safe' behind Dev's note; level5-crew.js:92 has Tomas smile at a memory ('yelled at bolts like they owed him money'), not at news of safety, and then 'He hopes Mr. Ortiz is still out there somewhere.
- **Desk note L5/L6 says no boards; Ridge Lumber sold her planks.** js/content/level5-places2.js:418 ('When the crowds came, we had no boards and no nails') and level6-places2.js:347 ('When the Fall came, we had no boards, no sandbags, no fence') describe the moment the Fall began; the plank trade in js/story.js:647 and lumberyard-trail2 at every level is placed lat …
- **Decoy hedges 'may' hold a trap; it always does.** The mechanic is as claimed: js/locks.js:98 always picks decoyPick from the options other than pick, js/world.js:177 sets the library search fail to 'trap', and js/building.js:744-752 sends every book but pick to lockFail('trap').
- **Archive door 'under the ARCHIVE sign'; the sign is beside it.** The geometry is as stated (ARCHIVE roomSign at (17,5,'s'), js/layouts.js:1015; the L door at (18,5), :984; js/decor.js:451-452 draws roomSign as a 'Small sign by a door'), but 'under the X sign' for a wall sign beside a door is the project's own model steering phrase: docs/TEXT_GUIDE.md:63-64 gives  …
- **Texts say play area and gadget store; signs read PLAY ZONE, GADGET HUB.** The 'play area' and 'gadget store' wording comes from the facts themselves (js/world.js:764 and :767, js/story.js:728), and the painted-capitals rule the finding cites applies to quest briefs' `room` field (docs/TEXT_GUIDE.md:162-164, enforced at tests/validate-text.js:661), not to place notes; docs …
- **Walker pictures 'up to dpr 2' but the road canvas caps at 1.5.** Reproduced: js/game.js:168 ROAD_DPR_MAX = 1.5 and js/game.js:245-248 this.dpr = min(1.5, devicePixelRatio) x resScale, so js/perspective.js:1197's Math.min(2, g.dpr) never binds and a walker picture never draws above dpr 1.5.

## What the audit did not cover

- No play-through in a browser. Art was checked only through the code that draws it and its comments.
- Measured numbers in DESIGN.md and SCALING.md (frame times, spin percentiles, drive counts, balance timings) were not re-measured.
- Fortitude's Book 1 canon beyond what docs/UNIVERSES.md lists could not be checked: the book's text is not in the repo.
- Engine UI strings (prompts, hints, toasts) are fixed English at every reading level by design; they were checked for truth, not for reading level.

## Judgment calls made in this audit

These are also recorded in DESIGN.md.

- **Walkers in buildings stand until they wake.** Texts that said walkers pace, drift or wander before they hear you were reworded to match the engine, in every building but the mall, whose crowd loop is an open question above. DESIGN.md (2026-10-15) had listed these as known gaps. If you would rather add idle wandering to the engine, the old wording can return.
- **Signs hang beside doors, not on them.** The validator only allows a sign on a wall tile, so texts that put a sign on or over a door now say beside it.
- **Jo's antenna on the Water Tower is built.** You approved it as built for the art on 2026-10-17, and five of six levels say so. The level-6 sketch note that called it a plan and the level-4 note that said "we never finished" now agree.
- **The Hollises kept a garden.** Kate's note asks the crew to keep it going, so June's garden topic now says the cabin has a garden "again", and STORY.md says the beds had gone to bare dirt.
- **Fix all says what it fixes.** When the scrap covers only part, the computer's Fix all buttons now read "Fix k of n for M scrap". What they fix is unchanged.
- **DESIGN.md is a log.** No old entry was rewritten. Where an old entry no longer matches the game, a correction was added in the new audit section.
- **Compass words.** A bare bearing the map contradicts by 45 degrees ('Station 12, north of here') was fixed. Route and idiom uses ('north up Hill Road', 'gone north') are left for you to rule on.
