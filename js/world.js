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

  /* ---------- Tools: crafted at the workbench, carried on every trip ----------
     A crowbar pries open one jammed lock (a cache door or a stash) and is spent doing it. */
  const TOOLS = {
    crowbar: { name: "Crowbar", needs: {}, scrap: 20 },
  };

  /* ---------- Locks: how each cache room opens, and what a mistake costs ----------
     Every lock is real: the player does what the note says, or pays for it. The answers are rolled
     once per save (js/locks.js) and fill the {placeholders} in the facts below and in every level's
     words: {code} {codeSpoken} {move1} {move2} {moves} {pick} {button}, and their decoys
     {decoyCode} {decoyCodeSpoken} {decoyMove1} {decoyMove2} {decoyMoves} {decoyPick} {decoyButton}
     (always clearly different from the real answer).
       panel   an alarm panel on a wall, [x, y, face] in the layout: press the right button first.
               A wrong button, or opening the door with the alarm still on, sets off the alarm.
       search  a fixture beside the main note (drawers, watering cans, a key board, breaker boxes, books):
               the right one holds what opens the door (`find`); `fail` is what the others do.
       door    "code": a keypad (`pattern`, each # a digit); "moves": word buttons pressed in order (one
               of `variants`, buttons from `words`); "found": opens with what the search found.
               `fail` is what a wrong code or move does.
     fail:      "alarm" it rings, and walkers pour in, through the way out too, until you go down;
                "trap"  a booby trap: you go down;
                "jam"   the lock jams; a crowbar from the workbench pries it open.
     stashFail: what a wrong key does in this building's stash lock: "jam", "break" (the key snaps
                off in the lock and is gone) or "none" (it just will not turn).
     The notes say all of it: what to do, and what a mistake costs. */
  const MOVES_LATCH = { words: ["lift", "press down", "pull", "push"], variants: [["lift", "pull"], ["press down", "push"], ["press down", "pull"], ["lift", "push"]] };
  const DRAWERS = ["top drawer", "middle drawer", "bottom drawer"];
  const BUTTONS = ["red", "green", "blue", "yellow"];
  const LOCKS = {
    gasngo: { search: { fixture: "drawers", options: DRAWERS, find: "the storeroom key", fail: "trap" }, door: { kind: "found" }, stashFail: "break" },
    grocery: { door: Object.assign({ kind: "moves", fail: "jam" }, MOVES_LATCH), stashFail: "jam" },
    hardware: { door: { kind: "moves", words: ["up", "down", "left", "right"], variants: [["up", "right"], ["down", "left"], ["up", "left"], ["down", "right"]], fail: "jam" }, stashFail: "jam" },
    pharmacy: { door: { kind: "code", pattern: "####", fail: "alarm" }, stashFail: "break" },
    autoshop: { door: { kind: "moves", words: ["twist left", "twist right", "lift", "push"], variants: [["twist left", "lift"], ["twist right", "push"], ["twist left", "push"], ["twist right", "lift"]], fail: "jam" }, stashFail: "none" },
    radioshack: { panel: { at: [29, 17, "w"], options: BUTTONS }, door: { kind: "code", pattern: "####", fail: "alarm" }, stashFail: "none" },
    garden: { search: { fixture: "cans", options: ["green can", "red can", "blue can"], find: "the shed padlock key", fail: "alarm" }, door: { kind: "found" }, stashFail: "none" },
    police: { panel: { at: [0, 26, "e"], options: BUTTONS }, door: { kind: "code", pattern: "##-#-##", fail: "alarm" }, stashFail: "jam" },
    school: { search: { fixture: "drawers", options: DRAWERS, find: "the closet key", fail: "alarm" }, door: { kind: "found" }, stashFail: "jam" },
    firehouse: { search: { fixture: "keyboard", options: ["red key", "blue key", "yellow key", "green key"], find: "the bay key", fail: "jam" }, door: { kind: "found" }, stashFail: "break" },
    hospital: { search: { fixture: "drawers", options: DRAWERS, find: "the white badge", fail: "alarm" }, door: { kind: "found" }, stashFail: "none" },
    watertower: { search: { fixture: "breakers", options: ["gray box", "yellow box", "red box"], find: "the pump house key", fail: "trap" }, door: { kind: "found" }, stashFail: "break" },
    lumberyard: { door: { kind: "code", pattern: "####", fail: "jam" }, stashFail: "none" },
    mall: { panel: { at: [0, 6, "e"], options: BUTTONS }, door: { kind: "code", pattern: "####", fail: "alarm" }, stashFail: "jam" },
    library: { search: { fixture: "books", options: ["dictionary", "atlas", "phone book"], find: "the archive key", fail: "trap" }, door: { kind: "found" }, stashFail: "break" },
  };

  /* ---------- Interior templates ----------
     One hand-built layout per location, keyed by location id, in js/layouts.js (loaded
     before this file; legend and landmarks are explained there). The notes below point at
     those layouts' landmarks and rooms. */
  const TEMPLATES = ZSR.LAYOUTS || {};
  /* ---------- The cabin: the Hollis family's house, walked into from the yard ----------
     The crew still calls it "the cabin" (the Hollis family named it that); it is a full house.
     One tile is about 2.5 feet. `at` is where house tile (0, 0) sits in the yard grid; the front
     (the porch and the front door) faces north, toward the plots and the van.
     Legend: H outer wall  W window (breakable: walkers smash it and climb in, you cannot climb out)
       B front door  J back door (both open and close with E; walkers break a closed one down)
       # inner wall  D inner doorway (a door that opens and closes with E; starts open)
       . floor  , the covered porch (roofed, open on the sides)  (space) yard, not the house
     rooms: interior rects [x0, y0, x1, y1] inclusive, in house tiles; js/yard.js furnishes each one
     by its key. notes: what the Hollis family left on the walls, read up close like a wall sign:
     the wall tile and the side of it that faces the room (the words: js/story-home.js and the
     level files). spots: what E does inside (house tiles of the thing you face). */
  const HOUSE = {
    at: [19, 34],
    grid: [
      "HHWWHH,,,,,HHWWHH        ",
      "W....H,,,,,H....W        ",
      "H....HHHBHHH....H        ",
      "H....D.....D....H        ",
      "W....#.....#....W        ",
      "H##D##.....##D##HHHHHWWHH",
      "H...##.....#....#..#....W",
      "H#####.....#....D..#....H",
      "W....#.....#....####....W",
      "H....#.....#....#..D....H",
      "H....#.....#....#..#####H",
      "H#D###.....#....#..#....W",
      "W....#.....###D##..D....H",
      "H....D.............#....H",
      "W....#.............#####H",
      "H....#.....#.......#....W",
      "HHWWHHHWHHHH.......D....H",
      "           W.......#....H",
      "           H.......#####H",
      "           H.......D....W",
      "           H#D###D######H",
      "           H....#..D....H",
      "           W....####....W",
      "           H....D..#....H",
      "           H....#..HHWWHH",
      "           HHJWHHHHH     ",
    ],
    rooms: {
      porch: { name: "Porch", rect: [6, 0, 10, 1] },
      office: { name: "Office", rect: [1, 1, 4, 4] },
      officeCloset: { name: "Office closet", rect: [1, 6, 3, 6] },
      foyer: { name: "Foyer", rect: [6, 3, 10, 5] },
      dining: { name: "Dining room", rect: [12, 1, 15, 4] },
      pingpong: { name: "Ping pong room", rect: [6, 6, 10, 15] },
      kitchen: { name: "Kitchen", rect: [12, 6, 15, 11] },
      pantry: { name: "Pantry", rect: [17, 6, 18, 7] },
      hallway: { name: "Hallway", rect: [17, 9, 18, 12] },
      living: { name: "Living room", rect: [12, 13, 18, 19] },
      masterBath: { name: "Master bath", rect: [1, 8, 4, 10] },
      master: { name: "Master bedroom", rect: [1, 12, 4, 15] },
      gusRoom: { name: "Gus's room", rect: [20, 6, 23, 9] },
      bath: { name: "Bathroom", rect: [20, 11, 23, 13] },
      finnRoom: { name: "Finn's room", rect: [20, 15, 23, 17] },
      linenCloset: { name: "Closet", rect: [20, 19, 23, 19] },
      lucyRoom: { name: "Lucy's room", rect: [20, 21, 23, 23] },
      playroom: { name: "Rear play room", rect: [12, 21, 15, 24] },
      coatCloset: { name: "Coat closet", rect: [17, 21, 18, 21] },
      toyCloset: { name: "Toy closet", rect: [17, 23, 18, 24] },
    },
    // in house tiles: [wall x, wall y, the face toward the room]
    notes: [
      { id: "porch", room: "porch", wall: [7, 2], face: "n" },
      { id: "foyer", room: "foyer", wall: [5, 4], face: "e" },
      { id: "office", room: "office", wall: [5, 1], face: "w" },
      { id: "dining", room: "dining", wall: [16, 2], face: "w" },
      { id: "kitchen", room: "kitchen", wall: [11, 10], face: "e" },
      { id: "pantry", room: "pantry", wall: [17, 5], face: "s" },
      { id: "pingpong", room: "pingpong", wall: [5, 10], face: "e" },
      { id: "masterBath", room: "masterBath", wall: [1, 7], face: "s" },
      { id: "master", room: "master", wall: [0, 13], face: "e" },
      { id: "living", room: "living", wall: [12, 12], face: "s" },
      { id: "gusRoom", room: "gusRoom", wall: [20, 10], face: "n" },
      { id: "finnRoom", room: "finnRoom", wall: [24, 16], face: "w" },
      { id: "lucyRoom", room: "lucyRoom", wall: [24, 23], face: "w" },
      { id: "playroom", room: "playroom", wall: [11, 23], face: "e" },
      { id: "coatCloset", room: "coatCloset", wall: [18, 20], face: "s" },
    ],
    // E inside the house: the office computer (the build menu), the pantry shelves (food and stock),
    // the radio and June's ledger by the couch (the old days), the play room's typewriter desk
    // (typing practice), the big bed (rest), and the dinner bell on the porch (it calls the next wave)
    spots: {
      computer: [2, 1],
      pantry: [18, 6],
      radio: [18, 17],
      typewriter: [15, 21],
      bed: [2, 14],
      bell: [10, 0],
    },
  };
  /* What the cabin's doors and windows can take: strength by level (0 is how the Hollis family left
     them), and what each level costs. Built from the computer's House tab, a typing round each. */
  const HOUSE_UPGRADES = {
    doors: {
      name: "Doors",
      hp: [150, 260, 400, 560],
      levels: [
        { needs: { lumber: 2, nails: 1 }, scrap: 30 }, // a bar across each door
        { needs: { armorPlate: 1, nails: 1 }, scrap: 70 }, // steel sheets bolted on
        { needs: { armorPlate: 2, tools: 1 }, scrap: 120 }, // steel security doors
      ],
    },
    windows: {
      name: "Windows",
      hp: [50, 140, 240, 380],
      levels: [
        { needs: { lumber: 3, nails: 2 }, scrap: 30 }, // boards over the glass
        { needs: { armorPlate: 1, wire: 1 }, scrap: 80 }, // metal shutters
        { needs: { armorPlate: 2, nails: 2 }, scrap: 130 }, // steel plates with a firing slot
      ],
    },
  };

  /* ---------- The home base yard (cabin defense) ----------
     Legend adds: T treeline (solid)  F fence segment (solid, breakable)  V the van (interact: map)
     P player start  z walker spawn (outside the fence, on all four sides), and the cabin (HOUSE
     above, stamped in at HOUSE.at with its own legend).
     Every base room but the Walls has a plot inside the fence: x, y, w, h (tiles) and the side
     it faces (n e s w: toward the open middle of the yard and the cabin door). A plot is a staked
     lot with a name sign until the room is built; each level puts up a bigger structure there
     (js/yard.js). The Walls room is the fence itself.
     `version` goes up whenever the grid changes: older saves get a whole fence and their set
     traps back in stock (js/state.js). */
  /** The yard grid: treeline, a ring of walker spawns, the fence, the van, the player start, the cabin. */
  function yardGrid() {
    const w = 55;
    const h = 68;
    const fence = [4, 4, 50, 63]; // x0 y0 x1 y1 of the fence ring
    const rows = [];
    for (let y = 0; y < h; y++) {
      const r = [];
      for (let x = 0; x < w; x++) {
        let ch = ".";
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) ch = "T";
        else if ((x === fence[0] || x === fence[2]) && y >= fence[1] && y <= fence[3]) ch = "F";
        else if ((y === fence[1] || y === fence[3]) && x >= fence[0] && x <= fence[2]) ch = "F";
        // spawns: every 6 tiles along the top and bottom, every 5 down the sides
        else if ((y === 2 || y === h - 3) && x >= 6 && x <= 48 && x % 6 === 0) ch = "z";
        else if ((x === 2 || x === w - 3) && y >= 8 && y <= h - 8 && (y - 8) % 5 === 0) ch = "z";
        r.push(ch);
      }
      rows.push(r);
    }
    rows[31][19] = rows[31][20] = "V";
    rows[32][27] = "P";
    HOUSE.grid.forEach((line, hy) => [...line].forEach((ch, hx) => {
      if (ch !== " ") rows[HOUSE.at[1] + hy][HOUSE.at[0] + hx] = ch === "," ? "." : ch;
    }));
    return rows.map((r) => r.join(""));
  }
  const YARD = {
    version: 4,
    palette: { wall: "#5a4a3a", shelf: "#6b4a3a", counter: "#4b5057", floor: "#6b6a4a", ceiling: "#e8e2d4", sky: true },
    grid: yardGrid(),
    plots: {
      radio: { x: 8, y: 8, w: 3, h: 3, face: "s" },
      power: { x: 15, y: 8, w: 4, h: 3, face: "s" },
      archive: { x: 25, y: 8, w: 5, h: 3, face: "s" },
      lab: { x: 35, y: 8, w: 4, h: 3, face: "s" },
      water: { x: 43, y: 8, w: 3, h: 3, face: "s" },
      garden: { x: 8, y: 16, w: 4, h: 4, face: "e" },
      garage: { x: 8, y: 26, w: 4, h: 5, face: "e" },
      well: { x: 33, y: 19, w: 3, h: 3, face: "s" },
      farm: { x: 41, y: 15, w: 5, h: 5, face: "w" },
      medbay: { x: 42, y: 26, w: 4, h: 4, face: "w" },
    },
    // worn dirt paths, x0 y0 x1 y1 inclusive: door to the back row, along the back row, across to the
    // garden and the farm, around the well, over to the van
    paths: [[27, 11, 27, 33], [9, 11, 44, 11], [12, 22, 40, 22], [32, 18, 36, 18], [32, 18, 32, 22], [36, 18, 36, 22], [20, 32, 26, 32]],
  };

  const DEFENSE = {
    fenceHp: [150, 240, 360, 520], // by Walls level 0..3
    fenceDps: { walker: 6, runner: 4, brute: 14 }, // damage per second to a fence segment
    calmSeconds: [240, 400], // quiet time between waves (long enough to work inside the cabin)
    firstCalmSeconds: 180, // after arriving home
    raidShare: 0.25, // this share of a wave's walkers make for the cabin, not for you: they break in and wait inside
    innerDoorHp: 60, // a shut door inside the cabin: walkers force it open after this much (it is not broken)
    noiseCut: 0.15, // in the calm, every shot takes noise x this many seconds off the clock (the bow is silent)
    bellSeconds: 4, // the dinner bell: the next wave comes this many seconds after it rings
    restSeconds: 60, // a rest in the big bed: back to full health, and this much of the calm is gone
    restMinCalm: 75, // ... only with at least this much calm left
    waveMix: { none: 0.2, some: 0.5, many: 0.3 }, // what the next wave is
    someCount: (day, wave) => 3 + Math.floor(day / 2) + Math.floor(wave / 2),
    manyCount: (day, wave) => 7 + day + wave,
    spawnInterval: 1.6, // seconds between walkers during a wave
    // a wave comes out of the trees on this many sides of the yard (picked at random, told in the toast):
    // a small one on two, so on a fence twice as long the player can still be where the walkers are; a
    // heavy one on all four, spread out so no single breach takes them all
    waveSides: { some: 2, many: 4 },
  };

  /* ---------- Locations on the city map (1000 x 700 units) ---------- */
  const LOCATIONS = [
    { id: "base", name: "Home Base", type: "base", x: 500, y: 610, danger: 0, known: true },
    { id: "gasngo", name: "Gas-N-Go", type: "gas", x: 380, y: 545, danger: 1, known: true, template: "gasngo",
      items: ["fuel", "fuel"], cache: ["fuel", "fuel", "wire"], cacheName: "the storeroom", stash: ["generator", "fuel"], stashName: "the old safe room" },
    { id: "grocery", name: "Corner Grocery", type: "store", x: 630, y: 560, danger: 1, known: true, template: "grocery",
      items: ["food", "food"], cache: ["food", "food", "meds"], cacheName: "the walk-in cooler", stash: ["meds", "food"], stashName: "the staff locker" },
    { id: "hardware", name: "Reyes Hardware", type: "store", x: 730, y: 470, danger: 2, known: true, template: "hardware",
      items: ["lumber", "tools", "nails"], cache: ["waterFilter", "tools", "lumber"], cacheName: "the back room", stash: ["armorPlate", "nails"], stashName: "the paint vault" },
    { id: "pharmacy", name: "Mile 9 Pharmacy", type: "store", x: 300, y: 430, danger: 2, template: "pharmacy",
      items: ["meds", "meds"], cache: ["meds", "meds", "waterFilter"], cacheName: "the locked cabinet room", stash: ["meds", "waterTank"], stashName: "the narcotics safe" },
    { id: "autoshop", name: "Ortiz Auto", type: "shop", x: 830, y: 565, danger: 2, template: "autoshop",
      items: ["parts", "parts"], cache: ["generator", "parts", "fuel"], cacheName: "the service pit", stash: ["gunParts", "parts"], stashName: "the parts cage" },
    { id: "radioshack", name: "Signal Electronics", type: "store", x: 560, y: 390, danger: 3, template: "radioshack",
      items: ["wire", "wire"], cache: ["radioParts", "radioParts", "wire"], cacheName: "the manager's office", stash: ["generator", "radioParts"], stashName: "the repair locker" },
    { id: "garden", name: "Greenhouse Row", type: "store", x: 180, y: 525, danger: 2, template: "garden",
      items: ["soil", "seeds"], cache: ["seeds", "seeds", "waterTank"], cacheName: "the potting shed", stash: ["waterTank", "soil"], stashName: "the seed vault" },
    { id: "police", name: "4th Precinct", type: "station", x: 480, y: 280, danger: 4, template: "police",
      items: ["gunParts", "armorPlate"], cache: ["gunParts", "gunParts", "armorPlate"], cacheName: "the armory", stash: ["armorPlate", "gunParts"], stashName: "the evidence locker" },
    { id: "school", name: "Lincoln Middle School", type: "school", x: 690, y: 300, danger: 3, template: "school",
      items: ["books", "books"], cache: ["books", "maps", "books"], cacheName: "the library closet", stash: ["maps", "radioParts"], stashName: "the principal's closet" },
    { id: "firehouse", name: "Station 12", type: "station", x: 370, y: 330, danger: 3, template: "firehouse",
      items: ["tools", "waterTank"], cache: ["waterTank", "lumber", "tools"], cacheName: "the equipment bay", stash: ["generator", "armorPlate"], stashName: "the chief's locker" },
    { id: "hospital", name: "St. Anne Annex", type: "hospital", x: 250, y: 215, danger: 5, template: "hospital",
      items: ["meds", "generator", "meds"], cache: ["meds", "meds", "meds"], cacheName: "the pharmacy stock room", stash: ["generator", "meds"], stashName: "the supply cupboard" },
    { id: "watertower", name: "Water Tower", type: "utility", x: 120, y: 350, danger: 3, template: "watertower",
      items: ["waterFilter", "waterFilter"], cache: ["waterFilter", "waterTank", "wire"], cacheName: "the pump house", stash: ["gunParts", "wire"], stashName: "the tool crib" },
    { id: "lumberyard", name: "Ridge Lumber", type: "industrial", x: 880, y: 380, danger: 4, template: "lumberyard",
      items: ["lumber", "lumber", "lumber"], cache: ["lumber", "lumber", "nails"], cacheName: "the kiln shed", stash: ["generator", "tools"], stashName: "the foreman's lockbox" },
    { id: "mall", name: "Northgate Mall", type: "mall", x: 800, y: 180, danger: 5, template: "mall",
      items: ["food", "meds", "wire"], cache: ["gunParts", "radioParts", "tools"], cacheName: "the security office", stash: ["armorPlate", "maps"], stashName: "the jewelry vault" },
    { id: "library", name: "Public Library", type: "library", x: 560, y: 180, danger: 4, template: "library",
      items: ["books", "books", "books"], cache: ["books", "maps", "books"], cacheName: "the archive room", stash: ["gunParts", "meds"], stashName: "the rare book room" },
    // outdoors, not a building: the dirt road at the end of Frog Lane, a dock and the river (js/river.js).
    // No notes, layout, key or stash; the fishing pole's tag (Station 12) reveals it.
    { id: "river", name: "River Landing", type: "river", x: 80, y: 471, danger: 1, outdoor: true, items: [], cache: [] },
  ];
  /** Where roads meet with no place there: on the road graph, never on the map as a place, never a destination. */
  const JUNCTIONS = [{ id: "frog", x: 153, y: 446 }]; // Frog Lane leaves River Road here, square to it, west to the water
  /** A place or a junction by id. */
  const place = (id) => LOCATIONS.find((l) => l.id === id) || JUNCTIONS.find((j) => j.id === id) || null;
  const isJunction = (id) => JUNCTIONS.some((j) => j.id === id);

  /* ---------- River Landing: fishing (js/river.js) ----------
     The pole lies in Station 12's equipment bay (layouts: firehouse.rod). Cast, wait for a bite, click to
     hook it. Each fish is 1 food once home. The river gives `cap` fish a visit, then rests `restockDays`. */
  const RIVER = {
    cap: 4,
    restockDays: 3,
    bite: [7, 20], // seconds from a cast to a bite
    hook: 2, // seconds to click once the bobber dips
    castMin: 2.5, // the bobber lands at least this far out (tiles), and on water
    castMax: 6,
    walkerEvery: [45, 90], // seconds between walkers out of the trees
    pairChance: 0.25, // sometimes two at once
    bellReach: 2.0, // E takes the propped rod back from this close
    rod: { at: "firehouse", reveals: ["river"] }, // where the pole lies (on its layout's rod spot), and what its tag reveals
    /* The bank, north up, as the city map has it: the river on the west, Frog Lane coming in from the east
       (its dirt road runs off between the trees on the east edge).
       T trees (the far bank, the edges, clumps for cover)  ~ water  = dock planks  , mud
       : the dirt road and the turnout  . grass  V the van (its cab on the west, facing the water)
       P where you get out  S the sign  N the note on the dock post  z where walkers come out of the trees. */
    grid: [
      "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
      "T~~~~~~~~,...z....z....z.........T",
      "T~~~~~~~~,.......................T",
      "T~~~~~~~~,.T...............T.....T",
      "T~~~~~~~~,......T................T",
      "T~~~~~~~~,......T................T",
      "T~~~~~~~~,....................T.zT",
      "T~~~~~~~~,...........T...........T",
      "T~~~~~~~~,.......................T",
      "T~~~~~~~~,..TT............T......T",
      "T~~~~~~~~,..T....................T",
      "T~~~~~~~~,.......................T",
      "T~~~~~~~~,.......T...::::........T",
      "T~~~~~~~~,...........::::......T.T",
      "T~~~~~~~~,...T.......::::........T",
      "T~~~~~~~~,...........::::........T",
      "T~~~~~~~~N...........:VV:........T",
      "T~~~~=====:::::::::::::::::::::::T",
      "T~~~~=====::::::::::::P::::::::::T",
      "T~~~~~~~~,...........::::........T",
      "T~~~~~~~~,...........::::........T",
      "T~~~~~~~~,...........S:::........T",
      "T~~~~~~~~,.......T...::::...T....T",
      "T~~~~~~~~,...........::::........T",
      "T~~~~~~~~,.......................T",
      "T~~~~~~~~,....T................T.T",
      "T~~~~~~~~,....T..................T",
      "T~~~~~~~~,.......................T",
      "T~~~~~~~~,........T..............T",
      "T~~~~~~~~,........T........T....zT",
      "T~~~~~~~~,.T.....................T",
      "T~~~~~~~~,.TT....................T",
      "T~~~~~~~~,...........T........T..T",
      "T~~~~~~~~,.......................T",
      "T~~~~~~~~,..z....z.....z.........T",
      "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    ],
    palette: { wall: "#5a4a3a", shelf: "#6b4a3a", counter: "#4b5057", floor: "#6b6a4a", ceiling: "#e8e2d4", sky: true, floorKind: "grass" },
  };

  /* ---------- Keys and stashes ----------
     Every building hides one key (on its y spot, shown once its key note has been read) and
     has one stash room (Q door, k spots) that only another building's key opens. The keys
     run in a ring, so each one points the player onward. Stash items never come back.
     KEYS[where the key is found] = the location whose stash it opens. */
  const KEYS = {
    gasngo: "grocery", grocery: "pharmacy", pharmacy: "hardware", hardware: "garden", garden: "autoshop",
    autoshop: "firehouse", firehouse: "radioshack", radioshack: "watertower", watertower: "school", school: "police",
    police: "lumberyard", lumberyard: "library", library: "mall", mall: "hospital", hospital: "gasngo",
  };

  /* ---------- Notes: the facts each text must carry ----------
     Every location has a door note (read on arrival, before entering) and its main note on
     the layout's `n` spot (spot 1); js/story.js adds the trail and dead-end notes (on the
     layout's numbered `spots`), the wall signs and the stash key. `unlocks` names the cache this note
     tells how to open; the lock itself (LOCKS above) holds the player to what it says.
     `reveals` adds locations to the map when the note is read.
     Positions are true in js/layouts.js: "front" is the entrance wall, "back" the far wall,
     left/right as seen from the entrance looking in. Landmarks are named exactly as in the
     layout (the validator checks door notes name two of them and inside notes one).
     Keep facts short: every one must fit a level 1 note (door notes about 30 words). A door
     note gives one walker spot, one landmark per item and where the inside note is; the
     inside note adds one short route from the note to the locked door. */
  const NOTES = {
    gasngo: {
      door: { id: "gasngo-door", found: "taped to the front door", facts: ["Written by Ruby.", "At least three walkers inside, one in the garage by the car lift; more come as the days pass.", "One fuel can is by the slushie machine; the other is in the garage, by the tire tower.", "The storeroom is locked; the clerk's note is on the counter by the front door."] },
      notes: [
        { id: "gasngo-counter", found: "on the counter right of the front door", unlocks: "gasngo", reveals: ["autoshop", "garden"], facts: ["Written by the clerk, Dev.", "The storeroom key is in the {pick} of the counter, right under this note; it opens the storeroom door.", "Open no other drawer: Ruby rigged the other two with a bomb trap for looters, and it kills whoever opens one.", "There is more fuel and a spool of wire in the storeroom.", "The storeroom is at the far end of the back hall from the ice machine, the last door before the garage.", "Dev went to Ortiz Auto on the east side of town; the shop is still standing.", "Rosa at Greenhouse Row, west past the gas station, has seeds and soil."] },
      ],
    },
    grocery: {
      door: { id: "grocery-door", found: "written on the glass in marker", facts: ["Written by Doc Lin.", "The shelves are picked over; food is on the floor by the fish tank and by the freezers on the right.", "Walkers get in through the loading door at the back, by the forklift; count on at least three.", "The cooler is locked; the manager's note is in the office, back left."] },
      notes: [
        { id: "grocery-counter", found: "on the desk in the manager's office", unlocks: "grocery", reveals: ["pharmacy"], facts: ["Written by the store manager, Hana.", "The cooler latch sticks; to open it, {moves}, in that order.", "Work it any other way and the latch jams tight; after that only a crowbar opens the cooler.", "Inside the cooler there is food and one medical kit.", "Out of the office, the cooler is the next door down the back hall, toward the forklift.", "The pharmacy at Mile 9, west of here, had medicine on its shelves last week."] },
      ],
    },
    hardware: {
      door: { id: "hardware-door", found: "on a sheet nailed to the door", facts: ["Written by Mr. Reyes, the owner.", "At least five walkers are inside, two in the middle aisles.", "Nails are by the toilet display, tools are in the middle aisle, and lumber is in the lumber racks at the back.", "The back room is locked; the owner's note is by the paint mixer, back left."] },
      notes: [
        { id: "hardware-paint", found: "tucked into the paint shelf by the paint mixer", unlocks: "hardware", reveals: ["lumberyard", "watertower"], facts: ["Written by Mr. Reyes.", "The back room door sticks in its frame; to open it, push it {move1}, then {move2}.", "Push it any other way and it jams for good; after that only a crowbar opens it.", "The back room holds a water filter, a second tool kit, and lumber.", "Take the side door by the paint mixer; the back room door is past the lumber racks.", "Ridge Lumber on the east ridge has stacks of lumber; the Water Tower on the west side has more filters in its pump house."] },
      ],
    },
    pharmacy: {
      door: { id: "pharmacy-door", found: "on the door under a strip of tape", facts: ["Written by the pharmacist, Mr. Okafor.", "One medical kit is by the giant toothbrush; the other is in the middle, where the aisles cross.", "At least five walkers inside, most near the back.", "The cabinet room is locked; its code is on a note behind the counter, reached at the right end, by the wheelchairs."] },
      notes: [
        { id: "pharmacy-counter", found: "behind the pharmacy counter", unlocks: "pharmacy", reveals: ["hospital"], facts: ["Written by Mr. Okafor.", "The cabinet room keypad code is {code}: {codeSpoken}.", "Use that code and no other: one wrong code sets off the alarm, and walkers pour in, even through the front door, until they get you.", "Inside are two more medical kits and a water filter.", "The cabinet room door is behind the counter, in the corner on the same side as the wheelchairs.", "St. Anne Annex, the hospital in the north hills, still has medicine and a generator, but it is the most dangerous place in town."] },
      ],
    },
    autoshop: {
      door: { id: "autoshop-door", found: "chalked on the garage door", facts: ["Written by Dev from the Gas-N-Go.", "Engine parts are on the workbenches: back right by the red tool chest, and in the left bay.", "At least five walkers inside; one wanders the parts room by the engine crane.", "The service pit is under a locked hatch; Mr. Ortiz left a note in the office behind the waiting room."] },
      notes: [
        { id: "autoshop-office", found: "pinned to the office window", unlocks: "autoshop", reveals: ["radioshack"], facts: ["Written by Mr. Ortiz.", "The hatch bolt is tricky; to open it, {moves}, in that order.", "Any other way bends the bolt and jams the hatch; after that only a crowbar opens it.", "The generator is down in the pit, with spare parts and a fuel can.", "The pit room stands in the middle of the shop; its hatch is on the front side, toward the oil drums.", "Signal Electronics downtown still has wire and radio parts, but it is near the walker crowds."] },
      ],
    },
    radioshack: {
      door: { id: "radioshack-door", found: "on a cardboard sign in the window", facts: ["Written by Jo.", "Spools of wire are between the two long middle shelves: one on the TV wall side, one on the robot side.", "At least six walkers inside; one near the right end of the counter, by the robot.", "The manager's office is locked; the manager left a note on the counter at the back."] },
      notes: [
        { id: "radioshack-counter", found: "under the register on the back counter", unlocks: "radioshack", reveals: ["police", "school"], facts: ["Written by the manager, Priya.", "First turn off the alarm: its panel is on the right wall, by the big dish; press the {button} button.", "Then the office keypad code is {code}: {codeSpoken}.", "A wrong button, a wrong code, or opening the office with the alarm still on sets off the alarm, and walkers pour in, even through the front door, until they get you.", "The office has two boxes of radio parts and more wire.", "The office door is in the back wall near the robot, beside the MANAGER sign.", "The 4th Precinct police station and Lincoln Middle School are both north of downtown; the school has books and the station has gun parts."] },
      ],
    },
    garden: {
      door: { id: "garden-door", found: "painted on the gate", facts: ["Written by Rosa, who ran the greenhouse.", "Soil is in the big greenhouse with the scarecrow; seeds are in the shop by the gate, near the big gnome.", "At least five walkers inside, one at the back of the big greenhouse.", "The potting shed is locked; Rosa's note is on the potting bench by the palm tree, back right."] },
      notes: [
        { id: "garden-bench", found: "on the potting bench by the palm tree", unlocks: "garden", reveals: ["firehouse"], facts: ["Written by Rosa.", "The shed padlock key is in the {pick}, one of the three watering cans by this bench.", "The other two cans are Rosa's walker alarm, full of bells and tin cans: tip one over and the noise brings walkers, more and more, even through the gate, until they get you.", "The shed has more seeds and a water tank.", "The shed door is on the path from the palm tree house down to the beehives.", "Station 12, the fire station north of here, has tools and water tanks in its equipment bay."] },
      ],
    },
    police: {
      door: { id: "police-door", found: "on a notice board by the door", facts: ["Written by Sergeant Vega.", "Gun parts are in the squad room, left of the long hall; an armor plate is in the garage on the right, by the riot shields.", "At least eight walkers inside, and a big one by the police bike in the garage.", "The armory is locked; the sergeant left the combination on a note at the front desk."] },
      notes: [
        { id: "police-desk", found: "on the front desk", unlocks: "police", reveals: ["library"], facts: ["Written by Sergeant Vega.", "First turn off the alarm: its panel is on the left wall, by the coffee machine; press the {button} button.", "Then the armory combination is {code}.", "A wrong button, a wrong number, or opening the armory with the alarm still on sets off the station alarm, and walkers pour in, even through the front door, until they get you.", "The armory has gun parts and an armor plate.", "The armory is near the end of the back hall toward the police bike: the last door before the garage.", "The Public Library north of downtown has books in its archive room; the librarian stayed."] },
      ],
    },
    school: {
      door: { id: "school-door", found: "on the office door", facts: ["Written by Max and Mia.", "Boxes of books: one is in the music room with the drum set, the other in the front office, behind the lion statue.", "At least six walkers inside, one in the main hallway.", "The library closet is locked; the key is in the teacher's note in the science room, back left, by the big brain."] },
      notes: [
        { id: "school-classroom", found: "on the teacher's desk in the science room", unlocks: "school", reveals: ["mall"], facts: ["Written by Ms. Adler, a teacher.", "The library closet key is in the {pick} of this desk, right under this note.", "Open no other drawer: Max and Mia tied air horns to the other two, and the noise brings every walker in the school, even through the front door, until they get you.", "The closet has books and a folder of city maps.", "Follow the main hallway toward the drum set room; the library is the room next to it, and its closet is in the back corner on the drum set side.", "Northgate Mall in the north has food, medicine, and wire, but the crowds there are the worst in town."] },
      ],
    },
    firehouse: {
      door: { id: "firehouse-door", found: "on the bay door", facts: ["Written by Chief Dunn.", "A tool kit is in the office behind the watch desk; a water tank is on the right wall of the truck bay, past the gear racks.", "At least six walkers inside, two in the truck bay.", "The equipment bay is locked; the chief's note is on the watch desk, by the spotted dog."] },
      notes: [
        { id: "firehouse-desk", found: "on the watch desk", unlocks: "firehouse", reveals: ["watertower"], facts: ["Written by Chief Dunn.", "The equipment bay opens with the {pick} on the key board by this desk.", "Take no other key: the others are for old locks, and a wrong one jams the bay lock; after that only a crowbar opens it.", "The bay has a water tank, lumber, and tools.", "The equipment bay is at the back of the truck bay, beside the fire truck on the gear racks side.", "The Water Tower on the west side has filters in its pump house."] },
      ],
    },
    hospital: {
      door: { id: "hospital-door", found: "on the ambulance doors", facts: ["Written by Doc Lin.", "One medical kit is in the patient room next to the x-ray machine, one is by the giant teddy bear in the gift shop; the generator is in the utility room, on the right.", "At least nine walkers inside; they stand in the dark rooms.", "The pharmacy stock room is locked; the nurse's note is at the nurses' station in the middle."] },
      notes: [
        { id: "hospital-hall", found: "on the nurses' station", unlocks: "hospital", facts: ["Written by Nurse Ada, who stayed.", "The stock room badge, white on a blue clip, is in the {pick} of this station, right under this note; hold it to the reader by the stock room door.", "Open no other drawer: they are wired to the crash cart alarm, and it brings walkers, more and more, even through the front doors, until they get you.", "The stock room has three medical kits.", "The stock room door is in the nurses' station room itself, across its walkway from the desk, on the angel statue side.", "Stay quiet; the walkers here follow sound more than light."] },
      ],
    },
    watertower: {
      door: { id: "watertower-door", found: "on the fence gate", facts: ["Written by Theo, who tends the pumps.", "One water filter is by the crates near the big red wheel; the other is in the boat workshop, by the rowboat.", "At least six walkers inside the pump building.", "The pump house is locked; Theo's note is on the control panel in the back right room."] },
      notes: [
        { id: "watertower-panel", found: "on the control panel", unlocks: "watertower", reveals: ["hospital"], facts: ["Written by Theo.", "The pump house key is in the {pick}, one of the three breaker boxes by this panel.", "Open neither of the other two boxes: they are live, and the shock kills.", "The pump house has filters, a water tank, and wire.", "The pump house door is at the back of the pump hall, at the blue pump end, away from the big red wheel.", "St. Anne Annex, the hospital, is north up Hill Road; it still has medicine, but it is the most dangerous place in town."] },
      ],
    },
    lumberyard: {
      door: { id: "lumberyard-door", found: "spray-painted on the gate", facts: ["Written by Ruby.", "Lumber is in the long racks in the middle, and one more stack is out back by the log pile.", "At least eight walkers inside; a crowd gathers by the loading dock and the flatbed truck, and a big one stands by the log pile.", "The kiln shed is locked; the yard boss left a note on a clipboard by the band saw."] },
      notes: [
        { id: "lumberyard-rack", found: "on the clipboard by the band saw", unlocks: "lumberyard", facts: ["Written by the yard boss, Carla.", "The kiln shed padlock opens with the code {code}: {codeSpoken}.", "A wrong code locks the old padlock up for good; after that only a crowbar opens it.", "The shed has dry lumber and nails.", "The kiln shed door is in the back wall of the rack hall; from the band saw shop door, follow that wall toward the log pile.", "Do not run the saws; the noise brings the whole dock crowd."] },
      ],
    },
    mall: {
      door: { id: "mall-door", found: "on the mall doors", facts: ["Written by Jo.", "Food is in the food court at the back, medicine is in the pharmacy on the left, and wire is in the gadget store on the right, next door to the orange tent.", "At least nine walkers inside; many of them stand along the main hall.", "The security office is locked; the guard's note is in the play area by the green dino."] },
      notes: [
        { id: "mall-guard", found: "on a clipboard in the play area", unlocks: "mall", facts: ["Written by a mall security guard named Luis.", "First turn off the alarm: its panel is on the left wall, by the rocking horse; press the {button} button.", "Then the office code is {code}: {codeSpoken}.", "A wrong button, a wrong code, or opening the office with the alarm still on sets off the mall alarm, and walkers pour in, even through the front doors, until they get you.", "The office has gun parts, radio parts, and a tool kit.", "Take the kitchen door at the back of the food court and turn right; the office is behind the green dino.", "The walkers here come running at anyone who runs; walk, and most of them stay put."] },
      ],
    },
    library: {
      door: { id: "library-door", found: "on the book drop", facts: ["Written by the librarian, Mrs. Greer.", "Books are in the stacks on both sides of the main hall, and in the children's room by the toy castle.", "At least eight walkers inside; two in the main hall.", "The archive room is locked; the librarian's note is on the reference desk by the giant globe, back left."] },
      notes: [
        { id: "library-desk", found: "on the reference desk", unlocks: "library", facts: ["Written by Mrs. Greer.", "The archive key is inside the {pick}, one of the three big books on this desk.", "Open neither of the other two books: Mrs. Greer hid a blast trap in each one for book thieves, and it kills.", "The archive has books and a folder of city maps.", "The archive door is at the back end of the main hall, between the rooms with the giant globe and the tall clock.", "Reading saved this building; the walls are stacked with the books nobody wanted."] },
      ],
    },
  };

  /* ---------- Map streets (pairs of location ids the road follows) ---------- */
  const ROADS = [
    ["base", "gasngo"], ["base", "grocery"], ["gasngo", "pharmacy"], ["gasngo", "garden"], ["grocery", "hardware"],
    ["hardware", "autoshop"], ["hardware", "radioshack"], ["radioshack", "police"], ["radioshack", "school"],
    ["pharmacy", "firehouse"], ["firehouse", "police"], ["firehouse", "hospital"], ["garden", "frog"], ["frog", "watertower"],
    ["watertower", "hospital"], ["hardware", "lumberyard"], ["lumberyard", "mall"], ["school", "mall"],
    ["school", "library"], ["police", "library"], ["base", "radioshack"], ["pharmacy", "watertower"],
    ["frog", "river"],
  ];

  const SETTINGS = {
    startFood: 6,
    foodPerTrip: 1,
    hungryVanPenalty: 0.7, // van max HP multiplier for a trip with no food
    footHp: 100,
    yardRegen: 1 / 15, // health per second at home before the Water room: 1 every 15 seconds (the Water room and the Well replace it)
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
    houseRepairScrap: 2, // scrap to fix one broken or cracked door or window of the cabin
    repairScrapPerHp: 3, // van repair: 1 scrap for every 3 health missing, back to full
    repairMinScrap: 5,
    kitsMax: 3, // medical kits the backpack can carry; one kit heals you to full
    saveSlots: 4, // labeled saves, one per player
    // day 1: danger 1 -> 3, 2 -> 5, 3 -> 6, 4 -> 8, 5 -> 9; one more every three days, at most 14.
    // The interiors are big, so this is about the old density. Door notes promise "at least" the day-1 count.
    walkersPerLocation(danger, day) {
      return Math.min(14, 2 + danger + Math.floor(danger / 2) + Math.floor(day / 3));
    },
  };

  ZSR.WORLD = { ITEMS, BASE_ROOMS, TRAPS, TOOLS, LOCKS, TEMPLATES, HOUSE, HOUSE_UPGRADES, YARD, DEFENSE, LOCATIONS, JUNCTIONS, place, isJunction, RIVER, KEYS, NOTES, ROADS, SETTINGS };
})(typeof globalThis !== "undefined" ? globalThis : this);
