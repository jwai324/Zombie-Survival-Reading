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
the `W` tiles: top-left to bottom-right) and one **key** (hidden on the `y` tile, visible once
`trail2` has been read).

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

The entrance is the **front**. The top row of a map is the **back**. **Left** and **right**
are as seen walking in from the entrance (low x is left). Use landmarks: the counter, the
shelves, the crates, the cache door, the stash door, inner doors, side rooms, corners.

## The building maps

Legend: `#` wall, `.` floor, `D` door, `S` shelf, `C` counter, `X` crates, `W` wall with a
sign or graffiti, `E` entrance, `L` cache door, `c` cache item, `K` stash door, `k` stash
item, `y` key, `1`-`7` note spots (1 is the main note), `i` item, `z` walker, `$` scrap.
Columns are x (0 at the left), rows are y (0 at the back).

### Template `gas` (used by: gasngo)

```
    0123456789012345
  0 ####W###########
  1 #S.S.S..4.C..1.#
  2 #S.S.S....C..5.#
  3 #7.....z.......W
  4 #S.S.S.....$...#
  5 #S2S.S.......6.#
  6 ###Wz......W####
  7 #kkK....i..Lc.c#
  8 #..#.i.....#.z.#
  9 ####..3..y.#.c.#
 10 #######E########
```

### Template `storeSmall` (used by: grocery, pharmacy, radioshack)

```
    012345678901234567
  0 #########W########
  1 #C.C...1........2#
  2 #......SSSS..SSSS#
  3 W..z........7....#
  4 #SSSS..SSSS..SSSS#
  5 #5.........z.....W
  6 #SSSS..SSSS..i..$#
  7 #z...i.3....4...y#
  8 #SSSS..SSSS..W####
  9 #kkK.........Lc.c#
 10 #.k#.......6.#.c.#
 11 ########E#########
```

### Template `storeLarge` (used by: hardware, lumberyard, mall)

```
    01234567890123456789
  0 ##########W#########
  1 #3.......4......Kkk#
  2 #.SS..SS..SS..SS#k.#
  3 #.SS..SS..SS..SS####
  4 #.SS..SS..SS..SS.i.#
  5 W....z.......z.....#
  6 #.SS..SS..SS..SS...W
  7 #.SS..SS..SS..SS.$.#
  8 #.SS1.SS..SS..SS.5.#
  9 #..........i......2#
 10 #XX..XX.........W###
 11 #XX..XX.........Lcc#
 12 #Cz...6.....i...#c.#
 13 #C..y.........7.#zc#
 14 #########E##########
```

### Template `station` (used by: police, firehouse)

```
    012345678901234567
  0 ##################
  1 #2.......#..z.Kkk#
  2 #..i...z.#..X.X###
  3 #..z.....D.......W
  4 #y.......#..X.X.3#
  5 #####D####...i...#
  6 #C.C.1..W.......7#
  7 #.$.....####D#####
  8 W......5#..6.W####
  9 #.......#....Lc.c#
 10 #.......#4.z.#.c.#
 11 ####E#############
```

### Template `school` (used by: school, library)

```
    01234567890123456789
  0 ####################
  1 #SSSS.1..W..SSSS..2#
  2 #y.......#.....7...#
  3 #..z.....D....z..i.#
  4 #SSSS....#..SSSS...#
  5 ####D#####D#########
  6 #3..............z..W
  7 W.z....$.....z...4.#
  8 ####D#####D###WL####
  9 #kkK....#..6..#.cc.#
 10 ###i...5#...i.#..c.#
 11 #########E##########
```

### Template `hospital` (used by: hospital)

```
    01234567890123456789
  0 ####################
  1 #Xkk#..y#..1.#.z..2#
  2 #.K#D...D....D.....#
  3 #z..#...#....#.i...#
  4 ##D###D#####W###D###
  5 #3.................W
  6 W..z.....$....z...4#
  7 ##D###D###WL####D###
  8 #...#....#c.c#..i..#
  9 #.i.#.z..#.c.#.....#
 10 #..5#..6.#.z.#....7#
 11 ################E###
```

### Template `shop` (used by: autoshop)

```
    0123456789012345
  0 #######W########
  1 #XX7.........1.#
  2 #XX....z.......#
  3 W......####...3#
  4 #2.i...#k.#..$.#
  5 #......#.k#.z..W
  6 #.z....##K#..i.#
  7 #y.........W####
  8 #....4.....Lc.c#
  9 #5........6#.c.#
 10 #######E########
```

### Template `utility` (used by: garden, watertower)

```
    01234567890123
  0 #########W####
  1 #kk#.X.X7...2#
  2 #K#z.......1.#
  3 #.....XXX....W
  4 W..i.....$..6#
  5 #3.........z.#
  6 #......W######
  7 #.....4Lc..z.#
  8 #y.i.5.#.c.c.#
  9 ######E#######
```

## Home: journal, radio, item tags, yard lots (facts in `js/story-home.js`)

- **Journal**: June's green ledger. One entry per day (Day 1 is the night the crew finds
  the cabin). Crew life, the town, worries, small wins. Never assumes what the player has
  built or found; a short recap of the real day is written by the game around it.
- **Radio**: once the Radio room is built, one broadcast each day you come home. Mostly Jo
  on 88.1, sometimes Theo, Vega, Doc Lin or Nurse Ada. News, warnings, messages between the
  threads above, and now and then a true tip about the key ring.
- **Item tags**: two tags per item (the label, a sticky note, writing on the side). Shown
  when the item is picked up, kept in the backpack.
- **Yard lots**: the outdoor rooms (Garden, Farm, Well, Water, Power, Radio, Lab) each have a
  lot in the yard with a hand-painted sign. Empty, the sign says what could go there; built,
  it says what stands there now at that level. Facts follow `BASE_ROOMS` in `js/world.js`.
