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

- **June**: in her sixties, a retired school gardener. Calm, dry humor, keeps the crew's
  journal in a green ledger. Plants anything that will grow.
- **Tomas**: seventeen, a mechanic's son. Keeps the van alive. Talks to engines. Fixes
  things with wire and stubbornness.
- **Pip**: eleven. Runs the radio once it is built, keeps a list of every voice heard.
  Asks hard questions. Wants a dog.

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
| **Chief Dunn** | Station 12 | Fire chief, works with Vega on the convoy. Keeps lists. |
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
| `<loc>-trail2` | trail | 2 to 7 | after trail1 is read | Says where the key is in this building, what it looks like, and which stash at which place it opens, with a direction. Reveals that place on the map. |
| `<loc>-dead1` | dead or decoy | 2 to 7 | every level | Flavor (a diary, a list, a letter) or a decoy (useful-looking but wrong or out of date). |
| `<loc>-dead2` | dead or decoy | 2 to 7 | reading level 2+ | Same. |
| `<loc>-dead3` | dead or decoy | 2 to 7 | reading level 4+ | Same. At least one of dead2 to dead4 is a decoy. |
| `<loc>-dead4` | dead or decoy | 2 to 7 | reading level 6 | Same. |

Plus four **signs** (printed signs and graffiti on the walls, read up close, in the order of
the layout's `signs` list) and one **key** (hidden on the layout's `y` tile, visible once
`trail2` has been read). The spot numbers are the layout's `spots` (`n` is spot 1).

Decoys never lie about how the game works in a way the player cannot recover from: a code
"that was changed last week", a room "already emptied", a key "lost", a prank. The real
note always wins.

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
