# Story Bible

The facts behind every new note, sign, key, journal entry, radio broadcast and item tag.
`js/world.js` holds the structure (layouts, items, the key ring); `js/story.js` and
`js/story-home.js` hold the story facts; `js/content/level*` hold the words at six reading
levels. A fact lives in one place and every level carries it. Rules from
`docs/TEXT_GUIDE.md` apply: teens, grounded, no gore, no on-page deaths, no profanity.
People are never shown dying. They "left", "went north", "stopped answering", "were not
there when I came back". Walkers are scary from the outside (sound, shape, numbers), never
described as wounds.

## The town and the crew

Months after the Fall. A mid-size river town. The player is "you" and is never named.

The crew at the cabin (home base, south end of town):

- **June** (she): in her sixties, a retired school gardener. Calm, dry humor, keeps the crew's
  journal in a green ledger and the rules on the door. Plants anything that will grow. Her knees
  ache on cold mornings. Old friend of Rosa at Greenhouse Row. Not sure she wants to leave the
  cabin, even if the convoy ever goes.
- **Tomas** (he): seventeen, a mechanic's son. Keeps the van alive. Talks to engines. Fixes
  things with wire and stubbornness. Learned from his father, who learned from Mr. Ortiz at Ortiz
  Auto; his father's fate is never stated. Sleeps in Gus's room.
- **Pip** (they/them at every reading level): eleven. Runs the radio once it is built, keeps a
  list of every voice heard. Asks hard questions. Wants a dog (the stray Pip's fifth quest brings
  home, named by the player) and Finn's treehouse.

They live in the yard and the cabin, not only in the ledger: see "The crew at home base" below.

## The cabin and the Hollis family

The cabin is not small: it is a whole family house with a porch, the home of the **Hollis
family**, who called it "the cabin" (a carved sign by the front door still says so). The crew
keeps the name. The Hollises went north with the River Convoy, on Sergeant Vega's trucks, before
the crew arrived; they are never met, only read about.

- **Kate**: drew maps for the county at the office desk. Wrote the note on the fridge: if you
  find our cabin and you are kind, it is yours now; please keep the garden going.
- **Dan**: hung the dinner bell, labeled the pantry shelves, lost the last ping pong game.
- **Gus** (16), **Finn** (11) and **Lucy** (7), and their dog **Biscuit**, who went with them.

Facts in `js/story-home.js`: `HOUSE_NOTES` (one note per room, read up close on the wall; where
each hangs is `HOUSE.notes` in `js/world.js`) and `HOUSE_UPGRADE_FACTS` (the computer's House
tab). Words at six levels: `T.house` in each `levelN-home.js`.

| Room | What hangs there | What the room is for now |
|------|------------------|--------------------------|
| Porch | The THE CABIN / THE HOLLIS FAMILY sign; the dinner bell and "ring for supper" | June's chalk: the bell carries far and walkers come to it, so ring it only when you are ready to fight |
| Foyer | Five name hooks (Lucy's low), "last one out locks the door"; the keys went with them | |
| Office | Kate's map desk; a sticky note: the computer runs off the big battery in the closet | The computer holds the base plans (rooms, van, guns, traps) |
| Office closet | (no note) the big battery and boxes | The crew's shelter in a wave (`CREW_RULES.shelter`) |
| Dining room | The chore chart, gold stars (Lucy leads, one of Gus's crossed out) | Pip's pencil row: feeds the dog we do not have yet |
| Kitchen | Kate's note on the fridge, under a fish magnet | |
| Pantry | Dan's shelf labels: beans, rice, peaches, flour | The crew counts food and everything in storage |
| Ping pong room | Chalk score: Finn 21, Dad 19, "rematch on Sunday" | Tomas and Pip play; Pip says the table leans left |
| Master bath | A heart on the mirror (Gus, Finn, Lucy); Lucy's two-minute toothbrush list | June left the list up |
| Master bedroom | Kate and Dan's wedding photo by the river | The big bed heals you fully, but it takes time and walkers keep coming |
| Living room | Growth lines on the door frame (Gus top, Lucy age 3; Pip between Finn and Gus) | The radio and June's ledger by the couch: read past days again |
| Gus's room | GUS'S ROOM, KEEP OUT, THIS MEANS YOU FINN; a guitar with two broken strings | Tomas sleeps here; the sign now means Pip |
| Finn's room | Finn's treehouse plan (rope ladder, lookout, bucket on a pulley) | Pip wants to build it once the fence is strong |
| Lucy's room | MY DOG BISCUIT (sit, shake, roll over) | Pip's drawing of a dog with no name yet |
| Play room | The typewriter desk; Kate's chalkboard: ten minutes a day, fingers on the home row | Typing practice |
| Coat closet | The go bag list (water, flashlight, batteries, Biscuit's leash, photo album); meet at the river dock by the convoy trucks | |

Tone: a family's home that strangers now live in. Warm, a little sad, never grim. The Hollises
are written as people who left with a plan and might come back, never as lost. The **dinner
bell** is the one thing in the house that calls trouble: ringing it brings the next wave of
walkers, so the texts always pair it with June's warning.

## The crew at home base (facts in `js/story-crew.js`)

June, Tomas and Pip wander the yard and the cabin in the calm, shelter in a wave, talk, help, ask
for things and earn your trust. The design and the contract between the files is `docs/CREW.md`;
the owner's decisions are in `DESIGN.md`. Facts: `CREW` (who, where, jobs), `CREW_RULES`,
`CREW_TALK` (topics and moods), `CREW_TIPS`, `CREW_REPORTS` and `ERRANDS` in `js/story-crew.js`;
the story quests (five per crew member) and the dog in `js/story-quests.js`. Words at six levels: `T.crew` in
each `levelN-crew.js`.

**Where they spend the calm** (`CREW[id].posts`; a post tied to a room shows once it is built):

| Crew | In the cabin | In the yard |
|------|--------------|-------------|
| June | the porch, by the bench; the kitchen stove; the living room, by the shelf with her ledger; the office (the base plans) | looking over the garden plot; tending the Garden (once built); the Lab's herb beds (once built) |
| Tomas | Gus's room, where he sleeps; the ping pong table | under the van's hood; by the garage plot; the east fence; the Power and Water plots (once built) |
| Pip | on the floor by the radio shelf; the chair by the chore chart; Finn's treehouse plan; Lucy's drawing of a dog with no name yet; the ping pong table | the radio plot, with the list of voices; beside the radio shack (once built); the back fence, watching the trees |

**In a wave** they hurry into the office closet, the shelter, and shut its door; they come out
when the wave is cleared. A raider that forces the closet door and stays among them hurts one of
them off-screen: a shout, nothing shown, nobody dies. It costs 1 medical kit from storage, or 2
food if there is none, and that crew member's trust drops. The dog shelters with them and is
never hurt.

**Their jobs**, unlocked by trust stars (`CREW[id].jobs`): Tomas fixes fence holes and cracks from
the start, and the cabin's broken doors and windows from 2 stars; the usual scrap comes out of the
base's scrap (a quest perk can make it free), and he tells you about it the next time you talk.
June patches you up once each calm, from 1 star. Pip is the lookout from 1 star: before the quiet
runs out, Pip calls the next wave's size and sides.

**Trust** is points per crew member, shown as 0 to 5 stars (`CREW_RULES.stars`). The first talk
each day, errands and story quests earn it; a raid that hurts them, an errand that runs late and a
request you give up cost some. Stars gate story quests, jobs and topics.

**Talk** (E opens a comic speech bubble; the yard keeps running): what they did since you last
talked (a report), one live tip (the food, the next build, the van, the fence, the next wave, your
keys, the walkers in town), and one story topic. Topics unfold by day, by trust, by a note you
have read, by a room you have built, and once the dog is home. Town news follows June's journal: a
person or a place out in town comes up no earlier than the ledger day that names it (the crew's
own past can come up any day). A topic never contradicts a story quest told before or after it.
Every topic also carries one true, useful thing about how the game works, checked against the code.
When the topics run out, mood lines repeat; a mood assumes nothing (no build, no find, no dog,
nobody the crew has not heard of on day 1).

**Errands**, when no story quest is on offer (from day 1, before the first quest): June asks for
seed packets, soil, a water filter or medical kits; Tomas for engine parts, nails, fuel or a tool
kit; Pip for lumber (saved for Finn's treehouse), wire or books. Only items that come back on town
shelves, so a repeat errand can always be filled: never food, and not radio parts or city maps,
which only caches and stashes hold. Each crew member's first errand asks for something the start
places (or their main notes) lead to; wire and books, on shelves further out, come later in the
turn. Each has a deadline in days; a late one is dropped and costs a little trust.

**Rules for crew texts.** The crew never give a lock answer, never tie a key to its stash, and
never reveal a place on the map; they only name places the journal, or a note gating the topic,
already names. Mr. Ortiz is safe at the Water Tower, but the crew say so only once the player has
read Dev's note there (`watertower-trail1`). Tomas's father's fate is never stated. The Hollises
are never written as lost, and the convoy never leaves on screen.

**Crew canon the talk adds:**

- June keeps tape and a clean cloth in her cardigan pocket; misses bells that only meant supper;
  says a ledger only has to be honest, not neat; says Rosa never forgets a friend (her planting
  chart at Greenhouse Row ends with a line about June's beans); says a garden makes a cabin hard to
  leave, even for the River Convoy; calls the dog Pip's problem and slips it the last of her beans.
- Tomas knows every hinge in the cabin by its squeak; wants to fix Gus's guitar someday; will not
  go north without June; wraps a box of nails in a shirt so it does not rattle; says a good fix is
  a quiet one; slips Pip half his bread; grins when he hears Mr. Ortiz is safe (only after Dev's note
  at the Water Tower is read).
- Pip has counted every wave since the first one and counts the minutes you are gone; got the
  town's rule onto the door; is saving boards for Finn's treehouse; is teaching the dog to sit,
  like Biscuit in Lucy's drawing; blames the leaning ping pong table when Tomas wins; reads the
  first page of every book before choosing one; wants to meet the people still out there helping
  each other.

## The people out there (they write the notes)

| Who | Where they appear | Their thread |
|-----|-------------------|--------------|
| **Ruby** | Gas-N-Go, Ridge Lumber door notes; graffiti everywhere (a red R with a walker count) | Scout who marks buildings for strangers. Searching for her younger brother **Dev**. |
| **Dev** | Gas-N-Go clerk, Ortiz Auto door note | Went east to Ortiz Auto to fix a truck so he and Ruby could leave. Then went on to the Water Tower with Mr. Ortiz, because Theo had clean water. Leaves his sister messages. |
| **Doc Lin** | Corner Grocery, St. Anne Annex door notes | A doctor who carries medicine between the grocery, the pharmacy and the hospital. Trying to reach **Nurse Ada**, who stayed at St. Anne. |
| **Nurse Ada** | St. Anne Annex | Stayed to keep the generator and the records. Writes calm, exact notes. |
| **Jo** | Signal Electronics, Northgate Mall door notes; the main voice on the radio | Scavenger turned broadcaster. Runs a pirate station on 88.1 from a rooftop. Reads out news, warnings and tips about stashes. |
| **Max and Mia** | Lincoln Middle School door note | Twins, thirteen. Got separated from their class. Looking for their teacher. |
| **Ms. Adler** | Lincoln Middle School | The twins' teacher. Led her students to the Public Library. |
| **Mrs. Greer** | Public Library | The librarian. Took in Ms. Adler's class. Believes reading saved the building. |
| **Sergeant Vega** | 4th Precinct | Organizing the **River Convoy**: boats and trucks meant to leave north along the river road. Practical, tired. |
| **Chief Dunn** | Station 12 | Fire chief, works with Vega on the convoy. Keeps lists. His crew fished at River Landing on days off; his pole (in the equipment bay) and his note on the dock post teach fishing. |
| **Luis** | Northgate Mall | Security guard who never left his post. Knows the mall crowd's habits. |
| **Theo** | Water Tower | Tends the pumps. Fair, quiet. Gave Dev and Mr. Ortiz a place to stay. |
| **Rosa** | Greenhouse Row | Grows seeds for anyone. Friends with June from before. |
| **Mr. Reyes** | Reyes Hardware | Owner. Proud of his store. Helped build the key ring. |
| **Hana** | Corner Grocery | Store manager. Practical. |
| **Mr. Okafor** | Mile 9 Pharmacy | Pharmacist. Careful with codes. |
| **Priya** | Signal Electronics | Manager. Built Jo's first transmitter. |
| **Mr. Ortiz** | Ortiz Auto | Owner. Taught Tomas's father. Left with Dev. |
| **Carla** | Ridge Lumber | Yard boss. Loud, kind. |

## The threads (story arcs)

1. **Ruby and Dev.** Ruby follows Dev's trail east and then west. Clues across Gas-N-Go,
   Ortiz Auto and the Water Tower. Dev's last note says he is safe with Theo; Jo's radio
   later passes on that Ruby reached the Water Tower. Hopeful, unresolved enough to wonder.
2. **Doc Lin and Nurse Ada.** Medicine moving uptown. Ada keeps the hospital going; Lin
   keeps trying to get there. Pharmacy and grocery notes show the route; hospital notes
   show Ada waiting. The radio carries messages between them.
3. **The lost class.** Max and Mia search for Ms. Adler. School notes show the class
   leaving; library notes show the class safe with Mrs. Greer, reading by window light.
4. **The River Convoy.** Vega and Dunn plan to leave north by the river road. Notes at
   the precinct, the firehouse, the mall and the lumberyard show the plan growing. The
   radio counts down, then the convoy is delayed, again and again. It never leaves on
   screen (the game is endless).
5. **The Key Ring.** The survivors made a rule: take what you need, leave the rest. To keep
   the best supplies away from people who smash and grab, each place's stash is locked,
   and its key is hidden in a *different* building, with a note that says where. Only
   people who read find them. Ruby and Jo started it; Mr. Reyes cut the first keys. Every
   trail note that ends at a key explains a link in this ring.

## How each building is built (facts in `js/story.js`)

Every building has, besides its door note and its main note (spot 1, opens the cache):

| Note id | Kind | Spot | Shown | What it must do |
|---------|------|------|-------|-----------------|
| `<loc>-trail1` | trail | 2 to 7 | always | A named character moves an arc forward, and says exactly where `trail2` is in this building. |
| `<loc>-trail2` | trail | 2 to 7 | after trail1 is read | Says where the key is in this building, what it looks like, and which stash at which place it opens, with a direction, and what a wrong key does in that stash's lock. Reveals that place on the map. The only place that ties a key to its stash. |
| `<loc>-dead1` | dead or decoy | 2 to 7 | every level | Flavor (a diary, a list, a letter) or a decoy (useful-looking but wrong or out of date). |
| `<loc>-dead2` | decoy | 2 to 7 | every level | The lock decoy: a clearly different wrong answer for this building's cache lock (`{decoy...}` placeholders), with a later hint that it is out of date. |
| `<loc>-dead3` | dead or decoy | 2 to 7 | reading level 4+ | Same. At least one of dead2 to dead4 is a decoy. |
| `<loc>-dead4` | dead or decoy | 2 to 7 | reading level 6 | Same. |

Plus four **signs** (printed signs and graffiti on the walls, read up close, in the order of
the layout's `signs` list) and one **key** (hidden on the layout's `y` tile, visible once
`trail2` has been read). The spot numbers are the layout's `spots` (`n` is spot 1).

Decoys never lie about how the game works: a code "that was changed last week", a room
"already emptied", a key "lost", a prank. Each says, later on, that it is out of date. The
real note always wins, and a player who acts on a decoy without reading to the end pays what
the real note warned of (an alarm, a trap, a jam).

## The key ring

`KEYS` in `js/world.js`: the key hidden at the first place opens the stash at the second.

| Key found at | Opens the stash at | Stash |
|--------------|--------------------|-------|
| Gas-N-Go | Corner Grocery | the staff locker |
| Corner Grocery | Mile 9 Pharmacy | the narcotics safe |
| Mile 9 Pharmacy | Reyes Hardware | the paint vault |
| Reyes Hardware | Greenhouse Row | the seed vault |
| Greenhouse Row | Ortiz Auto | the parts cage |
| Ortiz Auto | Station 12 | the chief's locker |
| Station 12 | Signal Electronics | the repair locker |
| Signal Electronics | Water Tower | the tool crib |
| Water Tower | Lincoln Middle School | the principal's closet |
| Lincoln Middle School | 4th Precinct | the evidence locker |
| 4th Precinct | Ridge Lumber | the foreman's lockbox |
| Ridge Lumber | Public Library | the rare book room |
| Public Library | Northgate Mall | the jewelry vault |
| Northgate Mall | St. Anne Annex | the supply cupboard |
| St. Anne Annex | Gas-N-Go | the old safe room |

## Directions in the texts

The entrance is the **front**; the far wall is the **back**. Every building is its own floor
plan in `js/layouts.js` with four **landmarks**, one per corner (the tire tower, the fish tank,
the fire truck ...), rooms with their own wall signs (BREAK ROOM, STAFF LOCKER, PHARMACY), and
the stash room behind its `Q` door. Door notes may use left and right as seen walking in.
Inside, a reader can face any way, so notes steer by landmarks, rooms and signs ("beside the
tire tower", "in the K9 room", "under the SEAFOOD sign"), never "left of" or "right of". The
main note and both trail notes name at least one landmark (`npm test` checks).

## The building maps

The maps are the layouts themselves (`js/layouts.js`): each one's grid, its landmarks, its
decor, and its story places (`spots` for notes 2 to 7, `signs` for the four wall signs, the
stash door `Q`, the stash spots `k` and the key spot `y`). Each building's stash is a small
room of its own, usually one of the building's side rooms given a lock (the gas station's old
restroom, the precinct's evidence room, the hospital's supply room, a corner of the library's
periodicals room). In the game, M shows the map of what you have seen.

## Home: journal, radio, item tags, plot signs (facts in `js/story-home.js`)

- **Journal**: June's green ledger. One entry per day (Day 1 is the night the crew finds
  the cabin). Crew life, the town, worries, small wins. Never assumes what the player has
  built or found; a short recap of the real day is written by the game around it.
- **Radio**: once the Radio room is built, one broadcast each day you come home. Mostly Jo
  on 88.1, sometimes Theo, Vega, Doc Lin or Nurse Ada. News, warnings, messages between the
  threads above, and now and then a true tip about the key ring.
- **Item tags**: two tags per item (the label, a sticky note, writing on the side). Shown
  when the item is picked up, kept in the backpack.
- **Plot signs**: every room has a plot in the yard (`YARD.plots`) with a sign, a plaque once
  built, read up close. The outdoor rooms (Garden, Farm, Well, Water, Power, Radio, Lab) also
  have hand-painted words: empty, what could go there; built, what stands there now at that
  level. Facts follow `BASE_ROOMS` in `js/world.js`.
