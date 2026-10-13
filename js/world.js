/* The world: city map, locations, interiors, items, and base upgrade recipes.
   These are the FACTS. Every reading-level text file must convey the same facts
   in different words. Change a fact here, and the texts must change too. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});

  /* ---------- Items (currency is scrap; everything else is cargo) ---------- */
  const ITEMS = {
    fuel: { name: "Fuel can", code: "FUEL", color: "#b3261e" },
    food: { name: "Food crate", code: "FOOD", color: "#7a9a3c" },
    lumber: { name: "Lumber", code: "WOOD", color: "#8a5a2e" },
    nails: { name: "Box of nails", code: "NAIL", color: "#6e7278" },
    tools: { name: "Tool kit", code: "TOOL", color: "#d9a21b" },
    parts: { name: "Engine parts", code: "PART", color: "#4b5057" },
    wire: { name: "Spool of wire", code: "WIRE", color: "#c08f1a" },
    radioParts: { name: "Radio parts", code: "RDIO", color: "#3f5a8a" },
    seeds: { name: "Seed packets", code: "SEED", color: "#5b6b3a" },
    soil: { name: "Bag of soil", code: "SOIL", color: "#5a4535" },
    meds: { name: "Medical kit", code: "MEDS", color: "#e6dfcc" },
    waterFilter: { name: "Water filter", code: "FLTR", color: "#3aa0c0" },
    waterTank: { name: "Water tank", code: "TANK", color: "#2b7a8a" },
    generator: { name: "Generator", code: "GENR", color: "#2f3136" },
    gunParts: { name: "Gun parts", code: "GUNP", color: "#1f2023" },
    armorPlate: { name: "Armor plate", code: "ARMR", color: "#9ea3aa" },
    books: { name: "Box of books", code: "BOOK", color: "#6b3f8a" },
    maps: { name: "City maps", code: "MAPS", color: "#c9b78a" },
  };

  /* ---------- Home base rooms: 3 levels each, with what they do ---------- */
  const BASE_ROOMS = {
    walls: {
      name: "Walls",
      levels: [
        { needs: { lumber: 2, nails: 1 }, scrap: 40, effect: { vanHp: 20, footHp: 20 } },
        { needs: { lumber: 3, nails: 2 }, scrap: 80, effect: { vanHp: 40, footHp: 40 } },
        { needs: { lumber: 4, nails: 2, armorPlate: 1 }, scrap: 120, effect: { vanHp: 60, footHp: 60 } },
      ],
    },
    garage: {
      name: "Garage",
      levels: [
        { needs: { tools: 1, parts: 1 }, scrap: 50, effect: { tierCap: 3, freeRepair: true } },
        { needs: { tools: 2, parts: 2 }, scrap: 100, effect: { tierCap: 4, freeRepair: true } },
        { needs: { tools: 2, parts: 3, gunParts: 1 }, scrap: 160, effect: { tierCap: 5, freeRepair: true } },
      ],
    },
    power: {
      name: "Power",
      levels: [
        { needs: { fuel: 2, wire: 1 }, scrap: 60, effect: { showDanger: true } },
        { needs: { generator: 1, fuel: 2 }, scrap: 100, effect: { showDanger: true, crates: 1 } },
        { needs: { wire: 2, fuel: 3 }, scrap: 150, effect: { showDanger: true, crates: 2, headlights: true } },
      ],
    },
    water: {
      name: "Water",
      levels: [
        { needs: { waterFilter: 1 }, scrap: 40, effect: { footRegen: 1 } },
        { needs: { waterTank: 1, waterFilter: 1 }, scrap: 80, effect: { footRegen: 2 } },
        { needs: { waterTank: 1, waterFilter: 2 }, scrap: 120, effect: { footRegen: 3, fullHealOnEntry: true } },
      ],
    },
    garden: {
      name: "Garden",
      levels: [
        { needs: { seeds: 2, soil: 1 }, scrap: 40, effect: { foodPerDay: 1 } },
        { needs: { seeds: 1, soil: 1 }, scrap: 80, effect: { foodPerDay: 2 } },
        { needs: { seeds: 2, soil: 1, waterTank: 1 }, scrap: 120, effect: { foodPerDay: 3 } },
      ],
    },
    radio: {
      name: "Radio",
      levels: [
        { needs: { radioParts: 1, wire: 1 }, scrap: 50, effect: { reveal: 3 } },
        { needs: { radioParts: 1, wire: 2 }, scrap: 100, effect: { reveal: 99 } },
        { needs: { radioParts: 1, wire: 2, books: 1 }, scrap: 150, effect: { reveal: 99, showStock: true } },
      ],
    },
    medbay: {
      name: "Medbay",
      levels: [
        { needs: { meds: 1 }, scrap: 40, effect: { footDamage: 0.8 } },
        { needs: { meds: 3 }, scrap: 80, effect: { footDamage: 0.8, revive: 1 } },
        { needs: { meds: 4 }, scrap: 120, effect: { footDamage: 0.7, revive: 1, vanDamage: 0.8 } },
      ],
    },
    archive: {
      name: "Archive",
      levels: [
        { needs: { books: 2 }, scrap: 40, effect: { notesShowStock: true } },
        { needs: { books: 3 }, scrap: 80, effect: { notesShowStock: true, mapShowsCaches: true } },
        { needs: { books: 3, maps: 1 }, scrap: 120, effect: { notesShowStock: true, mapShowsCaches: true, mapShowsStock: true } },
      ],
    },
    /* Late game. `requires` names other rooms (and their levels) that must be built first. */
    well: {
      name: "Well",
      levels: [
        { needs: { lumber: 2, tools: 1 }, scrap: 60, requires: { water: 1 }, effect: { water: 1, footRegen: 2 } },
        { needs: { lumber: 2, parts: 1, waterFilter: 1 }, scrap: 100, effect: { water: 2, footRegen: 3 } },
        { needs: { waterTank: 1, parts: 1, wire: 1 }, scrap: 150, effect: { water: 3, footRegen: 4, fullHealOnEntry: true } },
      ],
    },
    farm: {
      name: "Farm",
      levels: [
        { needs: { seeds: 2, soil: 2, lumber: 1 }, scrap: 80, requires: { garden: 2, well: 1 }, effect: { foodPerDay: 2 } }, // crop field
        { needs: { lumber: 2, wire: 1, seeds: 1 }, scrap: 120, requires: { well: 2 }, effect: { foodPerDay: 4 } }, // chicken coop
        { needs: { lumber: 3, wire: 2, waterTank: 1 }, scrap: 180, requires: { well: 3 }, effect: { foodPerDay: 6 } }, // goat pen
      ],
    },
    lab: {
      name: "Lab",
      levels: [
        { needs: { meds: 1, books: 1, seeds: 1 }, scrap: 80, requires: { medbay: 1, well: 1 }, effect: { medsPerDay: 0.5 } }, // herb beds and a still
        { needs: { waterFilter: 1, books: 1, wire: 1 }, scrap: 120, requires: { well: 2 }, effect: { medsPerDay: 1 } }, // clean bench
        { needs: { generator: 1, meds: 2, books: 1 }, scrap: 180, requires: { medbay: 2 }, effect: { medsPerDay: 2 } }, // powered lab
      ],
    },
  };

  /* ---------- Traps: crafted at the workbench, placed in the yard with a key ----------
     A trap sits on one tile. A walker that steps on it takes `damage`; `radius` > 0.6 hurts
     every walker that close. `uses` is how many walkers one trap stops before it is spent. */
  const TRAPS = {
    spike: { name: "Spike trap", key: "T", needs: { lumber: 1, nails: 1 }, scrap: 10, damage: 45, uses: 3, radius: 0.5, requires: { walls: 2 } },
    blast: { name: "Blast trap", key: "R", needs: { fuel: 1, wire: 1 }, scrap: 25, damage: 120, uses: 1, radius: 1.6, requires: { walls: 3 } },
  };

  /* ---------- Interior templates ----------
     Legend: # wall  . floor  D doorway (a real door: starts closed, E opens and closes it, walkers cannot open it)
             S shelf  C counter  X crates  G glass
             E entrance (exit)  L locked cache door  i item spot  c cache item spot
             n note spot  z walker spawn  $ scrap pile
     Item spots are filled in reading order (top-left to bottom-right). */
  const TEMPLATES = {
    gas: {
      palette: { wall: "#8c8a80", shelf: "#5a4a3a", counter: "#3f5a4a", floor: "#4a4a4e", ceiling: "#2a2a2e" },
      grid: [
        "################",
        "#S.S.S....C..n.#",
        "#S.S.S....C....#",
        "#......z.......#",
        "#S.S.S.....$...#",
        "#S.S.S.........#",
        "#.z........#####",
        "#.......i..Lc.c#",
        "#..i.......#.z.#",
        "#..........#.c.#",
        "#######E########",
      ],
    },
    storeSmall: {
      palette: { wall: "#7d8a8f", shelf: "#6b4a3a", counter: "#4b5057", floor: "#56565c", ceiling: "#2e2e33" },
      grid: [
        "##################",
        "#C.C...n.........#",
        "#......SSSS..SSSS#",
        "#..z.............#",
        "#SSSS..SSSS..SSSS#",
        "#..........z.....#",
        "#SSSS..SSSS..i..$#",
        "#z...i...........#",
        "#SSSS..SSSS..#####",
        "#............Lc.c#",
        "#............#.c.#",
        "########E#########",
      ],
    },
    storeLarge: {
      palette: { wall: "#6e6a60", shelf: "#8a5a2e", counter: "#3b3d44", floor: "#4f4b45", ceiling: "#26241f" },
      grid: [
        "####################",
        "#..................#",
        "#.SS..SS..SS..SS...#",
        "#.SS..SS..SS..SS.i.#",
        "#.SS..SS..SS..SS...#",
        "#....z.......z.....#",
        "#.SS..SS..SS..SS...#",
        "#.SS..SS..SS..SS.$.#",
        "#.SSn.SS..SS..SS...#",
        "#..........i.......#",
        "#XX..XX.........####",
        "#XX..XX.........Lcc#",
        "#Cz.........i...#c.#",
        "#C..............#zc#",
        "#########E##########",
      ],
    },
    station: {
      palette: { wall: "#5b6b7a", shelf: "#4b5057", counter: "#3a3f4a", floor: "#45484f", ceiling: "#22252b" },
      grid: [
        "##################",
        "#........#....z..#",
        "#..i...z.#..X.X..#",
        "#..z.....D.......#",
        "#........#..X.X..#",
        "#####D####...i...#",
        "#C.C.n..#........#",
        "#.$.....####D#####",
        "#.......#....#####",
        "#.......#....Lc.c#",
        "#.......#..z.#.c.#",
        "####E#############",
      ],
    },
    school: {
      palette: { wall: "#8a8f7a", shelf: "#6b3f8a", counter: "#5a4535", floor: "#5a5a50", ceiling: "#2b2b26" },
      grid: [
        "####################",
        "#SSSS.n..#..SSSS...#",
        "#........#.........#",
        "#..z.....D....z..i.#",
        "#SSSS....#..SSSS...#",
        "####D#####D#########",
        "#...............z..#",
        "#.z....$.....z.....#",
        "####D#####D####L####",
        "#.......#.....#.cc.#",
        "#..i....#...i.#..c.#",
        "#########E##########",
      ],
    },
    hospital: {
      palette: { wall: "#9aa39a", shelf: "#e6dfcc", counter: "#6e7278", floor: "#6b716b", ceiling: "#303430" },
      grid: [
        "####################",
        "#X.X#...#..n.#.z...#",
        "#...D...D....D.....#",
        "#z..#...#....#.i...#",
        "##D###D#########D###",
        "#..................#",
        "#..z.....$....z....#",
        "##D###D####L####D###",
        "#...#....#c.c#..i..#",
        "#.i.#.z..#.c.#.....#",
        "#...#....#.z.#.....#",
        "################E###",
      ],
    },
    shop: {
      palette: { wall: "#6f6a62", shelf: "#4b5057", counter: "#2f3136", floor: "#44423d", ceiling: "#1f1e1b" },
      grid: [
        "################",
        "#XX..........n.#",
        "#XX....z.......#",
        "#......####....#",
        "#..i...#..#..$.#",
        "#......#..#.z..#",
        "#.z....####..i.#",
        "#..........#####",
        "#..........Lc.c#",
        "#..........#.c.#",
        "#######E########",
      ],
    },
    utility: {
      palette: { wall: "#5f6b6e", shelf: "#3f5a4a", counter: "#4b5057", floor: "#3f4446", ceiling: "#1d2022" },
      grid: [
        "##############",
        "#....X.X.....#",
        "#..z.......n.#",
        "#.....XXX....#",
        "#..i.....$...#",
        "#..........z.#",
        "#......#######",
        "#......Lc..z.#",
        "#..i...#.c.c.#",
        "######E#######",
      ],
    },
  };

  /* ---------- The home base yard (cabin defense) ----------
     Legend adds: T treeline (solid)  F fence segment (solid, breakable)
     H cabin wall  B cabin door (interact: build menu)  V the van (interact: map)
     P player start  z walker spawn (outside the fence) */
  const YARD = {
    palette: { wall: "#5a4a3a", shelf: "#6b4a3a", counter: "#4b5057", floor: "#6b6a4a", ceiling: "#9fb3c8", sky: true },
    grid: [
      "TTTTTTTTTTTTTTTTTTTTTTTT",
      "T..z.........z.......z.T",
      "T......................T",
      "T...FFFFFFFFFFFFFFFF...T",
      "T...F..............F...T",
      "T...F..............F...T",
      "T.z.F..............F.z.T",
      "T...F..............F...T",
      "T...F..............F...T",
      "T.z.F..............F.z.T",
      "T...F..............F...T",
      "T...F.VV...........F...T",
      "T...F......P.......F...T",
      "T...F....HHBHH.....F...T",
      "T...F....HHHHH.....F...T",
      "T...FFFFFFFFFFFFFFFF...T",
      "T......................T",
      "T..z........z.......z..T",
      "T......................T",
      "TTTTTTTTTTTTTTTTTTTTTTTT",
    ],
  };

  const DEFENSE = {
    fenceHp: [150, 240, 360, 520], // by Walls level 0..3
    fenceDps: { walker: 6, runner: 4, brute: 14 }, // damage per second to a fence segment
    calmSeconds: [60, 100], // quiet time between waves
    firstCalmSeconds: 45, // after arriving home
    waveMix: { none: 0.2, some: 0.5, many: 0.3 }, // what the next wave is
    someCount: (day, wave) => 3 + Math.floor(day / 2) + Math.floor(wave / 2),
    manyCount: (day, wave) => 7 + day + wave,
    spawnInterval: 1.6, // seconds between walkers during a wave
  };

  /* ---------- Locations on the city map (1000 x 700 units) ---------- */
  const LOCATIONS = [
    { id: "base", name: "Home Base", type: "base", x: 500, y: 610, danger: 0, known: true },
    { id: "gasngo", name: "Gas-N-Go", type: "gas", x: 380, y: 545, danger: 1, known: true, template: "gas",
      items: ["fuel", "fuel"], cache: ["fuel", "fuel", "wire"], cacheName: "the storeroom" },
    { id: "grocery", name: "Corner Grocery", type: "store", x: 630, y: 560, danger: 1, known: true, template: "storeSmall",
      items: ["food", "food"], cache: ["food", "food", "meds"], cacheName: "the walk-in cooler" },
    { id: "hardware", name: "Reyes Hardware", type: "store", x: 730, y: 470, danger: 2, known: true, template: "storeLarge",
      items: ["lumber", "tools", "nails"], cache: ["waterFilter", "tools", "lumber"], cacheName: "the back room" },
    { id: "pharmacy", name: "Mile 9 Pharmacy", type: "store", x: 300, y: 430, danger: 2, template: "storeSmall",
      items: ["meds", "meds"], cache: ["meds", "meds", "waterFilter"], cacheName: "the locked cabinet room" },
    { id: "autoshop", name: "Ortiz Auto", type: "shop", x: 830, y: 565, danger: 2, template: "shop",
      items: ["parts", "parts"], cache: ["generator", "parts", "fuel"], cacheName: "the service pit" },
    { id: "radioshack", name: "Signal Electronics", type: "store", x: 560, y: 390, danger: 3, template: "storeSmall",
      items: ["wire", "wire"], cache: ["radioParts", "radioParts", "wire"], cacheName: "the manager's office" },
    { id: "garden", name: "Greenhouse Row", type: "store", x: 180, y: 525, danger: 2, template: "utility",
      items: ["soil", "seeds"], cache: ["seeds", "seeds", "waterTank"], cacheName: "the potting shed" },
    { id: "police", name: "4th Precinct", type: "station", x: 480, y: 280, danger: 4, template: "station",
      items: ["gunParts", "armorPlate"], cache: ["gunParts", "gunParts", "armorPlate"], cacheName: "the armory" },
    { id: "school", name: "Lincoln Middle School", type: "school", x: 690, y: 300, danger: 3, template: "school",
      items: ["books", "books"], cache: ["books", "maps", "books"], cacheName: "the library closet" },
    { id: "firehouse", name: "Station 12", type: "station", x: 370, y: 330, danger: 3, template: "station",
      items: ["tools", "waterTank"], cache: ["waterTank", "lumber", "tools"], cacheName: "the equipment bay" },
    { id: "hospital", name: "St. Anne Annex", type: "hospital", x: 250, y: 215, danger: 5, template: "hospital",
      items: ["meds", "generator", "meds"], cache: ["meds", "meds", "meds"], cacheName: "the pharmacy stock room" },
    { id: "watertower", name: "Water Tower", type: "utility", x: 120, y: 350, danger: 3, template: "utility",
      items: ["waterFilter", "waterFilter"], cache: ["waterFilter", "waterTank", "wire"], cacheName: "the pump house" },
    { id: "lumberyard", name: "Ridge Lumber", type: "industrial", x: 880, y: 380, danger: 4, template: "storeLarge",
      items: ["lumber", "lumber", "lumber"], cache: ["lumber", "lumber", "nails"], cacheName: "the kiln shed" },
    { id: "mall", name: "Northgate Mall", type: "mall", x: 800, y: 180, danger: 5, template: "storeLarge",
      items: ["food", "meds", "wire"], cache: ["gunParts", "radioParts", "tools"], cacheName: "the security office" },
    { id: "library", name: "Public Library", type: "library", x: 560, y: 180, danger: 4, template: "school",
      items: ["books", "books", "books"], cache: ["books", "maps", "books"], cacheName: "the archive room" },
  ];

  /* ---------- Notes: the facts each text must carry ----------
     Every location has a door note (read on arrival, before entering) and the
     notes placed at its `n` spot(s). `unlocks` names the cache this note opens:
     reading the note is what lets the player open that locked door.
     `reveals` adds locations to the map when the note is read. */
  const NOTES = {
    gasngo: {
      door: { id: "gasngo-door", found: "taped to the front door", facts: ["Written by Ruby.", "At least two walkers inside, one near the back wall, one by the pumps side; more come as the days pass.", "The fuel cans are on the floor, not on the shelves.", "The storeroom on the right, next to the door, is locked; the clerk kept a note on the counter."] },
      notes: [
        { id: "gasngo-counter", found: "on the counter by the register", unlocks: "gasngo", reveals: ["autoshop", "garden"], facts: ["Written by the clerk, Dev.", "The storeroom key is on the hook under the counter, so the storeroom can be opened now.", "There is more fuel and a spool of wire in the storeroom.", "Dev went to Ortiz Auto on the east side of town; the shop is still standing.", "Rosa at Greenhouse Row, west past the gas station, has seeds and soil."] },
      ],
    },
    grocery: {
      door: { id: "grocery-door", found: "written on the glass in marker", facts: ["Written by Doc Lin.", "The front shelves are mostly picked over; the food that is left is on the floor by the far aisle.", "Walkers get in through the loading door at the back; count on at least two.", "The walk-in cooler stays cold and is locked; the manager's note is on the counter at the back wall."] },
      notes: [
        { id: "grocery-counter", found: "on the counter at the back wall", unlocks: "grocery", reveals: ["pharmacy"], facts: ["Written by the store manager, Hana.", "The cooler latch opens if you lift it while pulling, so the cooler can be opened now.", "Inside the cooler there is food and one medical kit.", "The pharmacy at Mile 9, west of here, had medicine on its shelves last week."] },
      ],
    },
    hardware: {
      door: { id: "hardware-door", found: "on a sheet nailed to the door", facts: ["Written by Mr. Reyes, the owner.", "At least three walkers are inside: two in the middle aisles, one near the front door.", "Nails are near the front, tools are in the middle aisle, lumber is at the back.", "The back room is locked; the owner's note is by the paint shelves."] },
      notes: [
        { id: "hardware-paint", found: "tucked into the paint shelf", unlocks: "hardware", reveals: ["lumberyard", "watertower"], facts: ["Written by Mr. Reyes.", "The back room door sticks; the trick is to lift the handle and push, so the back room can be opened now.", "The back room holds a water filter, a second tool kit, and lumber.", "Ridge Lumber on the east ridge has stacks of lumber; the Water Tower on the west side has more filters in its pump house."] },
      ],
    },
    pharmacy: {
      door: { id: "pharmacy-door", found: "on the door under a strip of tape", facts: ["Written by the pharmacist, Mr. Okafor.", "Medical kits are on the low shelves near the middle of the store.", "At least three walkers inside, most near the back.", "The cabinet room is locked; the code is written on the note at the counter."] },
      notes: [
        { id: "pharmacy-counter", found: "on the pharmacy counter", unlocks: "pharmacy", reveals: ["hospital"], facts: ["Written by Mr. Okafor.", "The cabinet room code is 4471, so the cabinet room can be opened now.", "Inside are two more medical kits and a water filter.", "St. Anne Annex, the hospital in the north hills, still has medicine and a generator, but it is the most dangerous place in town."] },
      ],
    },
    autoshop: {
      door: { id: "autoshop-door", found: "chalked on the garage door", facts: ["Written by Dev from the Gas-N-Go.", "Engine parts are on the workbenches, one on the left wall and one in the back right corner.", "At least three walkers inside; one wanders near the crates in the back left corner.", "The service pit is covered by a locked hatch; Mr. Ortiz left a note by the office."] },
      notes: [
        { id: "autoshop-office", found: "pinned to the office window", unlocks: "autoshop", reveals: ["radioshack"], facts: ["Written by Mr. Ortiz.", "The hatch bolt comes out if you twist it left, so the service pit can be opened now.", "The generator is down in the pit, with spare parts and a fuel can.", "Signal Electronics downtown still has wire and radio parts, but it is near the walker crowds."] },
      ],
    },
    radioshack: {
      door: { id: "radioshack-door", found: "on a cardboard sign in the window", facts: ["Written by Jo.", "Spools of wire are on the shelves in the middle rows.", "At least four walkers inside; one near the counter on the back wall.", "The manager's office is locked; the manager left a note on the counter at the back."] },
      notes: [
        { id: "radioshack-counter", found: "under the register", unlocks: "radioshack", reveals: ["police", "school"], facts: ["Written by the manager, Priya.", "The office key is taped under the register, so the manager's office can be opened now.", "The office has two boxes of radio parts and more wire.", "The 4th Precinct police station and Lincoln Middle School are both north of downtown; the school has books and the station has gun parts."] },
      ],
    },
    garden: {
      door: { id: "garden-door", found: "painted on the gate", facts: ["Written by Rosa, who ran the greenhouse.", "Seed packets are on the bench near the front; soil bags are stacked in the middle.", "At least three walkers inside, one near the back.", "The potting shed is locked; Rosa's note is on the potting bench at the back, on the right."] },
      notes: [
        { id: "garden-bench", found: "on the potting bench", unlocks: "garden", reveals: ["firehouse"], facts: ["Written by Rosa.", "The shed padlock key is in the watering can, so the potting shed can be opened now.", "The shed has more seeds and a water tank.", "Station 12, the fire station north of here, has tools and water tanks in its equipment bay."] },
      ],
    },
    police: {
      door: { id: "police-door", found: "on a notice board by the door", facts: ["Written by Sergeant Vega.", "Gun parts are in the squad room; an armor plate is in the garage room on the right.", "At least five walkers inside, including one big one in the garage room.", "The armory is locked; the sergeant left the combination on a note at the front desk."] },
      notes: [
        { id: "police-desk", found: "on the front desk", unlocks: "police", reveals: ["library"], facts: ["Written by Sergeant Vega.", "The armory combination is 19-4-33, so the armory can be opened now.", "The armory has gun parts and an armor plate.", "The Public Library north of downtown has books in its archive room; the librarian stayed."] },
      ],
    },
    school: {
      door: { id: "school-door", found: "on the office door", facts: ["Written by Max and Mia.", "Boxes of books are in the back right classroom and the bottom left room.", "At least four walkers inside, one in the hallway.", "The library closet is locked; the key is in the teacher's note in the back left classroom."] },
      notes: [
        { id: "school-classroom", found: "on the teacher's desk in the back left classroom", unlocks: "school", reveals: ["mall"], facts: ["Written by Ms. Adler, a teacher.", "The library closet key is in the top desk drawer, so the closet can be opened now.", "The closet has books and a folder of city maps.", "Northgate Mall in the north has food, medicine, and wire, but the crowds there are the worst in town."] },
      ],
    },
    firehouse: {
      door: { id: "firehouse-door", found: "on the bay door", facts: ["Written by Chief Dunn.", "A tool kit is in the back office, through the door behind the desk; a water tank is in the truck bay on the right.", "At least four walkers inside, one in the truck bay.", "The equipment bay is locked; the chief's note is on the front desk."] },
      notes: [
        { id: "firehouse-desk", found: "on the watch desk", unlocks: "firehouse", reveals: ["watertower"], facts: ["Written by Chief Dunn.", "The equipment bay lock opens with the red key on the board, so the equipment bay can be opened now.", "The bay has a water tank, lumber, and tools.", "The Water Tower on the west side has filters in its pump house."] },
      ],
    },
    hospital: {
      door: { id: "hospital-door", found: "on the ambulance doors", facts: ["Written by Doc Lin.", "Medical kits are in the rooms along the top hall and the bottom left room; the generator is in the bottom right room.", "At least six walkers inside; they stand in the dark rooms.", "The pharmacy stock room is locked; the nurse's note is in the top hall."] },
      notes: [
        { id: "hospital-hall", found: "on the nurses' station", unlocks: "hospital", facts: ["Written by Nurse Ada, who stayed.", "The stock room badge is in the drawer under the station, so the stock room can be opened now.", "The stock room has three medical kits.", "Stay quiet; the walkers here follow sound more than light."] },
      ],
    },
    watertower: {
      door: { id: "watertower-door", found: "on the fence gate", facts: ["Written by Theo, who tends the pumps.", "Water filters are on the floor by the crates.", "At least four walkers inside the pump building.", "The pump house is locked; Theo's note is on the panel inside."] },
      notes: [
        { id: "watertower-panel", found: "on the control panel", unlocks: "watertower", reveals: ["hospital"], facts: ["Written by Theo.", "The pump house key is in the breaker box, so the pump house can be opened now.", "The pump house has filters, a water tank, and wire.", "St. Anne Annex, the hospital, is north along the river road; it still has medicine, but it is the most dangerous place in town."] },
      ],
    },
    lumberyard: {
      door: { id: "lumberyard-door", found: "spray-painted on the gate", facts: ["Written by Ruby.", "Lumber is stacked in the racks in the middle and at the back.", "At least five walkers inside; they gather by the loading dock.", "The kiln shed is locked; the yard boss left a note on the paint rack."] },
      notes: [
        { id: "lumberyard-rack", found: "on the clipboard by the racks", unlocks: "lumberyard", facts: ["Written by the yard boss, Carla.", "The kiln shed padlock opens with the code 2218, so the kiln shed can be opened now.", "The shed has dry lumber and nails.", "Do not run the saws; the noise brings the whole dock crowd."] },
      ],
    },
    mall: {
      door: { id: "mall-door", found: "on the mall doors", facts: ["Written by Jo.", "Food, medicine, and wire are spread across the store floor.", "At least six walkers inside; they move in a group.", "The security office is locked; the guard's note is by the paint display."] },
      notes: [
        { id: "mall-guard", found: "on a clipboard by the shelves", unlocks: "mall", facts: ["Written by a mall security guard named Luis.", "The office code is 0912, so the security office can be opened now.", "The office has gun parts, radio parts, and a tool kit.", "The walkers here come running at anyone who runs; walk, and most of them stay put."] },
      ],
    },
    library: {
      door: { id: "library-door", found: "on the book drop", facts: ["Written by the librarian, Mrs. Greer.", "Boxes of books are in the reading rooms on both sides.", "At least five walkers inside; two in the main hall.", "The archive room is locked; the librarian's note is in the back left reading room."] },
      notes: [
        { id: "library-desk", found: "on the reference desk", unlocks: "library", facts: ["Written by Mrs. Greer.", "The archive key is inside the big dictionary on the desk, so the archive room can be opened now.", "The archive has books and a folder of city maps.", "Reading saved this building; the walls are stacked with the books nobody wanted."] },
      ],
    },
  };

  /* ---------- Map streets (pairs of location ids the road follows) ---------- */
  const ROADS = [
    ["base", "gasngo"], ["base", "grocery"], ["gasngo", "pharmacy"], ["gasngo", "garden"], ["grocery", "hardware"],
    ["hardware", "autoshop"], ["hardware", "radioshack"], ["radioshack", "police"], ["radioshack", "school"],
    ["pharmacy", "firehouse"], ["firehouse", "police"], ["firehouse", "hospital"], ["garden", "watertower"],
    ["watertower", "hospital"], ["hardware", "lumberyard"], ["lumberyard", "mall"], ["school", "mall"],
    ["school", "library"], ["police", "library"], ["base", "radioshack"], ["pharmacy", "watertower"],
  ];

  const SETTINGS = {
    startFood: 6,
    foodPerTrip: 1,
    hungryVanPenalty: 0.7, // van max HP multiplier for a trip with no food
    footHp: 100,
    footDamageWalker: 12,
    footDamageRunner: 9,
    footDamageBrute: 22,
    scrapPileValue: [10, 20],
    tripSecondsPerUnit: 0.15, // map distance -> road seconds
    tripMinSeconds: 28,
    tripMaxSeconds: 95,
    restockDays: 3, // shelf and floor items come back this many days after they are taken; caches never do
    startScrap: 30,
    fenceRepairScrap: 1, // scrap to rebuild one hole (or brace one cracked segment) of the fence; holes never close on their own
    repairScrapPerHp: 3, // van repair: 1 scrap for every 3 health missing, back to full
    repairMinScrap: 5,
    kitsMax: 3, // medical kits the backpack can carry; one kit heals you to full
    saveSlots: 4, // labeled saves, one per player
    walkersPerLocation(danger, day) {
      return Math.min(10, 1 + danger + Math.floor(day / 3));
    },
  };

  ZSR.WORLD = { ITEMS, BASE_ROOMS, TRAPS, TEMPLATES, YARD, DEFENSE, LOCATIONS, NOTES, ROADS, SETTINGS };
})(typeof globalThis !== "undefined" ? globalThis : this);
