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
| Decided by the owner and fixed | 39 (one raised inside a merged finding, so not among the 387) |
| Decided by the owner: left as is | 5 |
| Still open for the owner | 1 |
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

Each item says what disagrees and the fix the verifiers propose. Nothing here was changed. The owner decided 44 more after the first report; they are listed under Decided by the owner.

### The pitch, settings and tooling

- **How-it-works calls the crew's van the last working van in town** (low). The game's pitch calls the crew's van 'the last working van in town' (docs/GAME_SPEC.md:11, README.md:3, howto at levels 2-6, the base intro at levels 5-6, a level-5 typing phrase) while the story has other running vehicles (Dev and Ortiz's truck, Vega's van, Dunn's fire trucks). Where: `js/content/level6.js:10`, `js/story.js:292`.
  Proposed: Owner decision. If the owner retires the hyperbole: change 'the last working van in town' to 'the only van the crew has' in js/content/level2.js:10, level3.js:10, level4.js:10, level5.js:10, level6.js:10; change js/content/level5.js:59 'the last van in town' to 'the crew's one van'; leave level6.js:59 'the last van anyone has seen running' (already hedged) and the typing phrase; update docs/GAME_SPEC.md:11 and README.md:3 to 'your crew's one battered van'. Then run node tests/validate-text.js.

## Decided by the owner

The owner answered these after the first report (2026-10-22), in two rounds. Each fix was then made and checked like the rest, and a read-only verifier pass checked the first round again; the decisions are in DESIGN.md.

### Fixed

- **Journal day 11 still hears static after Jo is on the radio.** Reword the day-11 page and Pip's list topic: Jo talks on the radio from a rooftop (no longer a rumor), and Pip keeps a list of every voice.
- **Radio has Ruby learn Dev's whereabouts she already knew.** Radio-16 now says Ruby had gone back east to scout Ridge Lumber when Dev's message reached her.
- **The Public Library is north-west of the school, texts say north.** Strict eight-way compass: the class went northwest to the Public Library.
- **Bible bans left/right inside; three main notes name left/right walls.** STORY.md and TEXT_GUIDE.md allow 'the left or right wall as you walk in', always with a landmark.
- **Job board fixes Sergeant Vega as 'she'; bible and precinct avoid a pronoun.** Sergeant Vega is she; the one 'him' is fixed and STORY.md records it.
- **Level 1 job board lists fragments, not whole sentences.** TEXT_GUIDE.md allows quoted lists, greetings and sign-offs at level 1; the texts stay.
- **Decoy sticky note's writing and correction differ by level.** The fake sticky note is neat, faded ink at every level.
- **Repeating journal-22 says Ruby still seeks Dev; radio says reunited.** Reword the repeating day-22 page in the past tense: Ruby went looking, and messages found them.
- **Repeating pages 21 and 24 narrate one-time events.** Reword the repeating pages 21 and 24 as habits (June reads the rules out loud; Pip keeps the ledger on cold mornings).
- **Well signs promise faster yard healing that a built Water room cancels.** The Well adds on top: yard healing from the Water room and the Well now stacks (the Well gives +1, +2, +3), so each Well level heals faster, as its signs say; the computer's Well lines say so.
- **Well sign puts the hand pump at level 2; the yard builds it at 3.** The signs match the yard: level 2 is the roofed well with a crank, level 3 the hand pump and trough.
- **Garden sign: one bed and a water tank; yard builds two beds, a greenhouse.** The signs say two raised beds and, at level 3, a greenhouse with a water tank; the yard now draws the tank.
- **Water level-1 sign: one filtered barrel; yard builds three rain barrels.** The level-1 sign says three rain barrels under funnels, with a filter on the tap.
- **Armor plate tag says it bolts onto the van; only the fence and cabin use it.** The chalk note says to bolt the plate onto a door.
- **Kate's note hangs on a cork board, not the fridge.** Kate's note is drawn on the fridge door, under the fish magnet.
- **Level 1 ledger note uses sentence fragments.** Same rule: the level-1 ledger list stays.
- **Who carries the people who cannot walk far: boats (L5) vs Vega's van (L6).** No roles: the firehouse plan (levels 4-6) and Chief Dunn's level-4 broadcast list the convoy's vehicles without jobs, and Kate's note no longer gives Vega the trucks.
- **Doc and words say Tomas fixes broken doors; code fixes any damaged one.** Tomas fixes only broken doors and windows, as his lines and CREW.md say.
- **Garden texts put the beds behind the house; the plot is in front.** The texts put the garden in front of the cabin, where the plot is.
- **First-aid book journal line: levels name different speakers and nicknames.** One version at every level: Tomas finds June reading late, and she answers that she is a student (level 1, short: Tomas calls her Student June).
- **Pump house promises "filters" but the cache holds one.** The pump house cache holds a second water filter (appended, so old saves keep their spots).
- **Hospital is north-east of the tower, texts say north.** Strict eight-way compass: St. Anne Annex is northeast up Hill Road.
- **Hollis notes are not on the walls of every room.** STORY.md says fifteen notes and names the rooms without one; DESIGN.md's line is corrected in the log.
- **Robot dog stands, sniffs, beeps and learns before it has a battery.** The robot dog's battery is nearly dead, not dead: it wakes for a minute, then slumps.
- **Quest 2's jar text says a sensor inside; the jar art is full of beans.** The quest-2 jar is drawn with a silver sensor inside.
- **Journal day 1 gives the cabin a woodstove the house lacks.** The living room has a woodstove.
- **The 'base facts' the crossover leans on are not in the facts.** Dev's Gas-N-Go shift list mentions 'some sickness across the river' at every level (a base fact now); the crossover texts are unchanged.
- **Mars sits east-southeast in code, 'southeast' in the docs.** UNIVERSES.md says east-southeast, as drawn; DESIGN.md's line is corrected in the log.
- **Level 6 trail1 says the boats are visible in the yard.** Levels 5 and 6 keep the boats at Ridge Lumber, out of the player's sight.
- **Levels 3-6 describe a dial padlock; the game shows a keypad.** Levels 3 to 6 call it a padlock with a code.
- **Level 1 trail2 opens with a sentence fragment.** Same rule: 'Good reading.' stays.
- **June describes waves on day 1 and 3; journal says first walkers came day 4.** Soften the ledger: day 4 is the biggest group yet, and day 1 no longer says nothing came.
- **Computer's fence row says 'Fence: whole' while segments are cracked.** The computer's fence row counts holes and cracked segments, and Fix all prices both.
- **Doc promises a Mr. Reyes descent topic; no such topic exists.** A new Tomas topic (tomas-fort-t3, day 9 and 2 stars), at all six levels, tells Mr. Reyes's unproven claim to descend from Dr. Camila Reyes.
- **Spec says Fix all braces cracked fence; it mends holes only.** Fix all now braces cracked segments as well as holes, as the spec says.
- **Walk-don't-run texts overstate what walking and sprinting do.** The mall notes and radio-9 say every walker near you turns, not the whole floor.
- **Tomas can still 'hope Ortiz is out there' after Theo's radio said he is safe.** Hide Tomas's hope topic once the radio has said Mr. Ortiz is safe (a new radioBefore gate); his words stay.
- **Balance data cites econ.js, which the repo does not hold.** The balance files say econ.js was a one-off script that was not kept; the loadouts table is the record.
- **St. Anne Annex's door note is signed by Doc Lin, who the radio says has never reached the hospital.** The door note is Nurse Ada's, at all six levels; Lin's and Ada's story-bible rows follow.

### Left as is

- **Controls name 'side buttons' hidden on keyboard-and-mouse devices.** Left as is: touch support stays.
- **Settings says every instruction changes with level; prompts and hints do not.** Left as is (the owner's earlier call stands).
- **Road scream reach uses 56 px a tile, figures use 62.5.** Left as is.
- **.claude/settings.json allows validate-content.js and npm run lint, which do not exist.** Left as is.
- **Trail2 "between the crates near the big red wheel" is six rows away.** Left as is: ambiguous, not wrong.

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
- **Compass words.** A bare bearing the map contradicts by 45 degrees ('Station 12, north of here') was fixed first; the owner then chose the strict eight-way compass for the rest (northwest, northeast).
