/* Interior layouts: one hand-built floor plan per location (legend v2).
   world.js uses these as its TEMPLATES, keyed by location id. The notes in world.js
   point at the landmarks and rooms drawn here, so a change to a grid can make a note
   lie: run `npm test` after any edit (it checks positions, landmarks and note names).

   Every entrance is on the bottom (south) wall. "Front" is near the entrance, "back"
   is the far (north) wall, and left/right are west/east as you walk in.

   Legend v2:
     #  wall                     W  wall with a window (opaque)
     .  floor                    D  door (E opens and closes it, walkers cannot)
     L  locked cache door        E  entrance / exit (one, on the bottom wall)
     Q  stash door: locked, opens with the key hidden in another building (js/story.js)
     S  shelf (full height)      X  crate stack (full height)   G  glass case (full height)
     C  counter (low, 0.45)      K  table / desk (low, 0.40)    R  bed / gurney / bench (low, 0.35)
     1 2 3 4  landmark anchors (floor + landmark prop): 1 back left, 2 back right,
              3 front left, 4 front right
     i item   c cache item   k stash item   y this building's stash key
     n note spot 1 (the main note)   $ scrap pile
     z walker anchor: a tile a note names (NOTES[id].walkers); other walkers spawn at random
   Item, cache and stash spots are filled in reading order (top-left to bottom-right), and so are the
   z anchors a walker rule names by index (z: [0] is the first z in reading order): keep every z tile,
   and moving one can move what a rule points at (tests/validate-world.js checks each anchor still sits
   in its zone, by the landmark its note names).

   Authoring shorthand, expanded at the bottom of this file into the contract shape:
     floorRects: [[x0, y0, x1, y1, ch], ...]  painted over palette.floorKind into `floors`
     decor:      [[x, y, tex, text?, face?], ...]  -> { x, y, tex, text, face }
                 face (n/s/e/w) is the side of the wall tile the decor is painted on; it is
                 filled in when only one side faces the room
     scatter:    { every, keys: [[tex, text?], ...] }  generic wall decor spread over bare walls
   Story fields (js/story.js holds what they say):
     spots:      { 2: [x, y], ... 7: [x, y] }  note spots 2 to 7, plain floor (a story note names its spot)
     signs:      [[x, y, face], ...]  wall signs and graffiti read up close, one per story sign, in order
     walkerZones: { name: [[x0, y0, x1, y1], ...] }  named areas (inclusive rects, more than one for a
                 zone in several rooms) where a note's walker rule keeps its walkers: "two in the truck
                 bay" (js/world.js NOTES[id].walkers, js/building.js planWalkers) */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});

  /* ---------- Landmark art (one-line visual descriptions for the art stream) ----------
     A landmark def is { name, art, solid, size, color?, label?, foot? }:
       name   what the notes call it, word for word (plain words: every reading level and the
              M map use the same name)
       size   its height in tiles. A wall is 1 tall and a walker 0.95; under a ceiling the
              engine draws nothing taller than 0.98, so only the open-roof garden goes above that
       color  tints the art, and `label` is a short word printed on it; only arts whose line
              below says "(color = ...)" or "(label)" take them
       foot   [w, h], odd numbers: a big prop that covers w x h tiles centered on its anchor.
              Those tiles are plain floor in the grid; the engine blocks them all and draws the
              art w * 0.95 tiles wide whatever its height, so draw it with that shape in mind */
  const LAYOUT_ART = {
    // Gas-N-Go
    iceMachine: "chest-high white ice chest, frosty, big blue letters on the front (label)",
    carLift: "rusty sedan raised on a yellow two-post car lift, wheels dangling, wide and low (foot 3 x 3; color = car body)",
    slushMachine: "tall slushie machine on a stand, two clear tanks, one red and one blue, swirl lid",
    tireStack: "head-high tower of black tires, the top one tilted, a white price tag (label)",
    // Corner Grocery
    fishTank: "big glass lobster tank on a steel stand, cloudy green water, a crab sign on top",
    forklift: "small warehouse forklift seen from the side, raised forks and an overhead cage (foot 3 x 1; color = body paint)",
    cartPile: "tangled heap of chrome shopping carts piled higher than a person",
    gumball: "giant red gumball machine, round glass globe full of colored balls, coin slot",
    // Reyes Hardware
    paintMixer: "paint shaker machine on a counter, paint cans stacked around it, rainbow splatter down the front",
    ridingMower: "riding lawn mower with a yellow seat and a SALE flag on a stick (color = body paint)",
    toiletStack: "store display: white toilets stacked three high in a pyramid, a sign on top (label)",
    ladder: "tall step ladder, open, a paint bucket on the top step (color = ladder paint)",
    // Mile 9 Pharmacy
    toothbrush: "store display: a person-sized toothbrush on a stand, white bristles (color = handle)",
    wheelchairs: "three folded wheelchairs chained together, chrome and blue seats",
    photoBooth: "photo booth with a red curtain half open and a lit sign on top (label)",
    pillBottle: "store display: a person-sized orange pill bottle with a white cap and a big word on its paper label (label)",
    // Ortiz Auto
    engineHoist: "yellow engine crane on wheels, a chain holding a greasy engine block in the air",
    toolChest: "tall rolling tool chest, many drawers, one drawer hanging open (color = paint)",
    vending: "soda vending machine, lit front panel with can buttons (color = body, label = brand word)",
    drums: "cluster of steel drums, dented, a stencil word on each (color = paint, label = word)",
    // Signal Electronics
    tvWall: "wide pyramid of old box TVs stacked on each other, screens showing gray static (foot 3 x 1)",
    robotMascot: "store mascot robot as tall as a person, silver box body, round red eyes, waving arm, a word on its chest (label)",
    arcade: "tall arcade cabinet with a glowing screen, joystick and two buttons, marquee light",
    satDish: "big gray satellite dish on a tripod, tilted up, a red light on the arm",
    // Greenhouse Row
    scarecrow: "scarecrow on a pole: straw hat, plaid shirt, button eyes, crow on the shoulder",
    palmTree: "tall palm tree in a big terracotta pot, curved trunk, wide green fronds",
    gnome: "garden gnome as tall as a person: red pointy hat, white beard, blue coat",
    beehives: "stack of white wooden beehive boxes on a pallet, a few bees painted on",
    // 4th Precinct
    motorcycle: "black-and-white police motorbike on its stand, side view, windshield, blue light on the back",
    riotShields: "wall rack on legs full of clear riot shields and black helmets",
    kennel: "big wire dog kennel with a K9 sign and an empty water bowl (label)",
    coffeeMachine: "huge chrome coffee machine on a cart, a stack of paper cups, steam pipe",
    // Lincoln Middle School
    brainModel: "giant pink plastic brain model on a stand, the two halves a little apart, labels on sticks",
    drumSet: "school drum set: big bass drum with a lion face on the front, two cymbals, snare and toms",
    lionStatue: "big gold lion mascot statue on a blue base with the word LIONS (label)",
    hoop: "rolling basketball hoop on a heavy base, orange rim, torn net",
    // Station 12
    firePole: "shiny brass fire pole from floor to ceiling with a round pad at the bottom",
    fireTruck: "front of a red fire engine: chrome grill, round headlights, ladder on top, wide and low (foot 3 x 3)",
    dalmatian: "white dalmatian dog statue with black spots, sitting, a red collar",
    gearRack: "rack of yellow fire coats, boots and helmets on hooks",
    // St. Anne Annex
    xray: "x-ray machine: big white arm over a table, a glowing light box on the side",
    angelStatue: "white stone angel statue with folded wings on a pedestal, candles at its feet",
    giantBear: "giant brown teddy bear from the gift shop, sitting, red bow, as tall as a person",
    ambulance: "back of a white ambulance van with doors open, red stripe, red cross and lights on the roof (foot 3 x 3)",
    // Water Tower
    valveWheel: "huge red valve wheel on a thick pipe coming out of the floor",
    bigPump: "big blue pump motor lying on its side, fat pipes and a round pressure gauge (foot 3 x 3)",
    chlorineTanks: "row of tall green gas cylinders chained to a rail, yellow warning tags",
    rowboat: "upside-down wooden rowboat on two sawhorses, oars leaning on it, long and low (foot 3 x 1)",
    // Ridge Lumber
    bandSaw: "giant band saw: tall gray frame, a long blade, sawdust heaped around its feet",
    logPile: "wide pyramid of fresh round logs seen from the side, chained, bark and pale cut ends (foot 3 x 1)",
    woodBear: "chainsaw-carved wooden bear standing on its back legs, holding a sign (label)",
    flatbed: "front of a flatbed truck loaded with planks, strapped down, faded cab (foot 3 x 3; color = cab paint)",
    // Northgate Mall
    rockingHorse: "giant red rocking horse on curved runners, white mane, yellow saddle, side view (foot 3 x 1)",
    playDino: "green play-area dinosaur with a slide down its tail, big friendly teeth, side view (foot 3 x 3)",
    mannequins: "group of white plastic store mannequins in coats and hats, one pointing",
    tent: "camping dome tent pitched on a patch of fake grass, flap open, a lantern by it (foot 3 x 1; color = tent cloth)",
    // Public Library
    globe: "giant globe on a wooden stand, taller than a person, tilted on its axis",
    grandClock: "tall grandfather clock in dark wood, brass pendulum, hands stopped",
    kidsCastle: "cardboard kids' castle with towers, flags and a drawbridge door, wide (foot 3 x 3)",
    owlStatue: "bronze owl statue on a stack of stone books, big round eyes",
  };

  /* ---------- Wall decor (wall-tile textures; `text` is printed where the line says so) ----------
     Texts are 12 characters at most: one wall tile is small, and B may break two words onto
     two lines. The notes, not the signs, carry everything the player must read. */
  const LAYOUT_DECOR = {
    roomSign: "small sign board beside a door, dark letters on a cream plate (uses text)",
    bigSign: "large painted wall sign or department banner in big letters (uses text)",
    aisleSign: "aisle marker: blue board with a big white number and a word (uses text)",
    exitSign: "red EXIT box sign over a door frame, faint glow (uses text if given)",
    poster: "faded paper poster with a simple picture and a headline (uses text)",
    graffiti: "spray-painted words on the wall, drippy letters, red or black (uses text)",
    tally: "chalk tally marks and a scratched-out calendar left by survivors",
    noticeBoard: "cork board with pinned papers, photos and a map scrap (uses text if given, as a header card)",
    clock: "round wall clock with cracked glass, hands stopped",
    fireExt: "red fire extinguisher in a wall box with a FIRE label",
    vent: "metal air vent grille with dark slats, a dust streak below",
    pipes: "exposed pipes along the wall with a small red valve and a gauge",
    crack: "cracked plaster with a brown water stain running down",
    boarded: "planks nailed across the wall in an X, nail heads showing",
    lockers: "row of tall metal lockers, one door hanging open",
    chalkboard: "green chalkboard in a wood frame with chalk writing (uses text)",
    whiteboard: "white marker board with scribbled writing and a doodle (uses text)",
    pegboard: "brown pegboard with hanging wrenches, hammers and saws",
    coolerDoors: "glass cooler doors with shelves of bottles and cans, dark inside",
    tvScreen: "flat TV mounted on the wall, cracked screen showing gray static",
    menuBoard: "black menu board with prices and a coffee cup picture (uses text)",
    wallMap: "street map pinned to the wall with red string and pins (uses text if given, as its title)",
    eyeChart: "eye chart: big E on top, rows of smaller letters below",
    firstAid: "white first-aid cabinet with a red cross",
    warning: "yellow and black hazard sign (uses text, e.g. HIGH VOLTAGE)",
    panel: "gray control panel with round gauges, switches and small lights",
    breaker: "gray breaker box with a lever and a lightning bolt sticker",
    hoseRack: "folded red fire hose on a wall rack with a brass nozzle",
    storefront: "closed shop front: metal roll-down grille with the shop name above (uses text)",
    trellis: "wooden lattice covered in dry vines with a few flowers",
    seedRack: "rack of colorful seed packets in rows",
    bookWall: "floor-to-ceiling bookcase built into the wall, full of colored spines",
    mural: "bright painted mural with a big word worked into it (uses text)",
    trophyCase: "glass trophy case with gold cups and a pennant",
    wantedBoard: "board of black-and-white wanted posters and notices",
    garageDoor: "big roll-up garage door, ribbed metal, closed (uses text if given)",
    calendar: "paper wall calendar with days crossed off in red",
    toolWall: "wall rack of long tools: rakes, shovels, an axe",
    sawBlade: "huge round saw blade hung on the wall as a sign (uses text if given)",
  };

  /* Floor kinds by authoring letter (floorRects and the expanded `floors` rows). */
  const FLOOR_KEY = { t: "tile", h: "checker", l: "linoleum", c: "carpet", w: "wood", k: "concrete", d: "dirt", g: "grate", s: "grass", r: "gravel", p: "planks" };

  const LAYOUTS = {
    /* Gas station: shop floor in front, back hall with restrooms and the storeroom,
       a two-bay garage down the right side. Loop: shop -> back hall -> garage -> shop. */
    gasngo: {
      palette: { wall: "#8c8a80", shelf: "#5a4a3a", counter: "#3f5a4a", floor: "#4a4a4e", ceiling: "#2a2a2e", wallStyle: "block", floorKind: "tile", ceilingKind: "panels", light: 0.7 },
      grid: [
        "##############################",
        "#.....#...#...#XX..#.........#",
        "#.1...#k.k#.$.#.c.c#.........#",
        "#.....#...#...#....#.........#",
        "#..K..#...#...#..cX#....2....#",
        "#..K..##Q###D####L##.........#",
        "#.....D............D.........#",
        "#$....#.....z......#.....z...#",
        "##D######..#########.........#",
        "#..................#.$.......#",
        "#..................#######...#",
        "#...S..S....S..S...#........K#",
        "#...S..S....S..S.z.#.XX.....K#",
        "#...S..S....S..S...#.XX.....K#",
        "#...S..S....S..S...#.........#",
        "#..................#.........#",
        "#...........CCCCC..D.........#",
        "#..i........C.n....#.........#",
        "#.3.........C......#....i.4..#",
        "#..................#.....y...#",
        "#..................#.........#",
        "#WWWWWWWW#E#WWWWWW############",
      ],
      floorRects: [[20, 1, 28, 20, "k"], [15, 1, 18, 4, "k"], [7, 1, 13, 4, "h"], [1, 1, 5, 7, "l"], [7, 6, 18, 7, "l"]],
      decor: [
        [0, 10, "coolerDoors"], [0, 11, "coolerDoors"], [0, 12, "coolerDoors"], [0, 13, "coolerDoors"], [0, 14, "coolerDoors"],
        [0, 16, "poster", "LOTTO"], [0, 18, "noticeBoard"], [9, 21, "exitSign", "EXIT", "n"],
        [19, 18, "menuBoard", "HOT COFFEE", "w"], [19, 13, "poster", "OIL CHANGE", "w"], [19, 11, "fireExt", null, "e"],
        [7, 5, "roomSign", "SAFE ROOM", "s"], [13, 5, "roomSign", "WOMEN", "s"], [16, 5, "roomSign", "STOREROOM", "s"],
        [19, 7, "roomSign", "GARAGE", "w"], [6, 7, "roomSign", "BREAK ROOM", "e"],
        [0, 3, "graffiti", "RUBY HERE"], [0, 5, "calendar"], [3, 0, "clock"], [9, 0, "tally"],
        [21, 21, "garageDoor", "BAY 1"], [22, 21, "garageDoor"], [23, 21, "garageDoor"], [25, 21, "garageDoor", "BAY 2"], [26, 21, "garageDoor"], [27, 21, "garageDoor"],
        [29, 11, "pegboard"], [29, 12, "pegboard"], [29, 13, "pegboard"], [29, 3, "poster", "TIRE SALE"], [24, 10, "warning", "HEADS UP", "s"],
      ],
      scatter: { every: 6, keys: [["crack"], ["vent"], ["poster", "ICE COLD"], ["pipes"], ["graffiti", "NO GAS"]] },
      spots: { 2: [8, 13], 3: [7, 19], 4: [9, 7], 5: [14, 18], 6: [18, 18], 7: [4, 1] },
      signs: [[4, 8, "s"], [11, 21, "n"], [9, 5, "s"], [18, 5, "s"]],
      walkerZones: { liftEnd: [[20, 1, 28, 8]] },
      landmarks: {
        1: { name: "the ice machine", art: "iceMachine", solid: true, size: 0.7, label: "ICE" },
        2: { name: "the car lift", art: "carLift", solid: true, size: 0.98, foot: [3, 3], color: "#3f6fb0" },
        3: { name: "the slushie machine", art: "slushMachine", solid: true, size: 0.95 },
        4: { name: "the tire tower", art: "tireStack", solid: true, size: 0.9, label: "TIRES" },
      },
    },

    /* Corner grocery: checkout lanes in front, five aisles, produce and the fish tank on
       the left, freezers on the right; a back hall behind the staff door with the office,
       the walk-in cooler and the stock room; the loading dock opens onto the floor. */
    grocery: {
      palette: { wall: "#7d8a8f", shelf: "#6b4a3a", counter: "#4b5057", floor: "#56565c", ceiling: "#2e2e33", wallStyle: "drywall", floorKind: "checker", ceilingKind: "panels", light: 0.75 },
      grid: [
        "################################",
        "#......#S.....S#XX.SS.X#.......#",
        "#.KKn..#.c.c.c.#.k...k.#.....z.#",
        "#......#.......#XX.....#...2...#",
        "####D######L#######Q####.......#",
        "#................z.............#",
        "#.............................$#",
        "########D#################..####",
        "#.1............................#",
        "#...i..........................#",
        "#........S..S..S..S..S..S.....G#",
        "#........S..S..S..S..S..S.....G#",
        "#........S..S..S..Sz.S..S.....G#",
        "#.KK.....S..S..S..S..S..S....iG#",
        "#.KK.....S..S..S..S..S..S.....G#",
        "#........S..S..S..S..S..S.....G#",
        "#$.............................#",
        "#..............................#",
        "#.......C...C...C...C..........#",
        "#..3....C...C...C...C......4y..#",
        "#..............................#",
        "#WWWWWWWWWWWWW#E#WWWWWWWWWWWWWW#",
      ],
      floorRects: [[1, 1, 6, 3, "c"], [8, 1, 14, 3, "k"], [16, 1, 22, 3, "k"], [1, 5, 23, 6, "l"], [24, 1, 30, 6, "k"], [26, 7, 27, 7, "k"]],
      decor: [
        [10, 7, "aisleSign", "1 CANS", "s"], [13, 7, "aisleSign", "2 BREAD", "s"], [16, 7, "aisleSign", "3 CEREAL", "s"], [19, 7, "aisleSign", "4 SNACKS", "s"], [22, 7, "aisleSign", "5 PAPER", "s"],
        [0, 10, "bigSign", "SEAFOOD"], [0, 13, "bigSign", "PRODUCE"], [7, 7, "roomSign", "STAFF ONLY", "s"], [25, 7, "bigSign", "LOADING DOCK", "s"],
        [3, 4, "roomSign", "OFFICE", "s"], [10, 4, "roomSign", "COOLER", "s"], [18, 4, "roomSign", "STAFF LOCKER", "s"],
        [25, 0, "garageDoor"], [26, 0, "garageDoor", "DOCK"], [27, 0, "garageDoor"], [28, 0, "garageDoor"], [31, 3, "graffiti", "THEY GET IN"],
        [1, 0, "noticeBoard"], [0, 2, "calendar"], [14, 21, "exitSign", "EXIT", "n"], [0, 18, "poster", "FRESH BREAD"], [31, 17, "poster", "SALE"],
        [31, 9, "clock"], [0, 8, "fireExt"],
      ],
      scatter: { every: 4, keys: [["crack"], ["vent"], ["poster", "2 FOR 1"], ["pipes"], ["coolerDoors"]] },
      spots: { 2: [25, 2], 3: [13, 9], 4: [22, 17], 5: [1, 10], 6: [17, 20], 7: [28, 11] },
      signs: [[0, 16, "e"], [24, 7, "s"], [31, 19, "w"], [12, 4, "s"]],
      walkerZones: { dock: [[24, 1, 30, 6]] },
      landmarks: {
        1: { name: "the fish tank", art: "fishTank", solid: true, size: 0.85 },
        2: { name: "the forklift", art: "forklift", solid: true, size: 0.98, foot: [3, 1], color: "#e3b21b" },
        3: { name: "the cart pile", art: "cartPile", solid: true, size: 0.9 },
        4: { name: "the gumball machine", art: "gumball", solid: true, size: 0.95 },
      },
    },

    /* Hardware store: paint department back left, the lumber racks back center with the
       back room behind them, a glass-walled garden center back right; long aisles and the
       checkout in front. Loops through the lumber racks and through the garden center. */
    hardware: {
      palette: { wall: "#6e6a60", shelf: "#8a5a2e", counter: "#3b3d44", floor: "#4f4b45", ceiling: "#26241f", wallStyle: "block", floorKind: "concrete", ceilingKind: "beams", light: 0.7 },
      grid: [
        "##########################WWWWWWWWW#",
        "#SSSSSS#k.#......#X.....X#.........W",
        "#.....n#.k#.XXXXX#.c...c.#.........W",
        "#...1..#Q##......#.......#..z......W",
        "#.........D.XXXXX#X..c..X#.....2...W",
        "#S...CCC..#......####L####.........W",
        "#S........#..............#..KK..KK.W",
        "#S......$.#.......iXXXXz.#..KK..KK.W",
        "#.........#..............#.........W",
        "###...########D#####..####..KK..KK.W",
        "#........................#.........W",
        "#..SSSSSSSS..SSSSSSSSSS..D.........W",
        "#......z.................#.........W",
        "#..SSSSSSSS..SSSSSSSSSS..#.........W",
        "#...............i........#####D#####",
        "#..SSSSSSSS..SSSSSSSSSS............#",
        "#..................z.......CCC.....#",
        "#..SSSSSSSS..SSSSSSSSSS......C.....#",
        "#.................................$#",
        "#.......KKK..............KKK.......#",
        "#..................................#",
        "#....i.......C...C...C..........4..#",
        "#y.3.........C...C...C.............#",
        "#..................................#",
        "#..................................#",
        "#WWWWWWWWWWWWWWWWW#E#WWWWWWWWWWWWWW#",
      ],
      floorRects: [[1, 1, 9, 8, "l"], [26, 1, 34, 13, "r"], [1, 19, 34, 24, "t"]],
      decor: [
        [0, 2, "bigSign", "PAINT"], [0, 4, "poster", "PAINT SALE"], [10, 7, "clock", null, "e"],
        [0, 12, "aisleSign", "1 PLUMBING"], [0, 14, "aisleSign", "2 TOOLS"], [0, 16, "aisleSign", "3 ELECTRIC"],
        [25, 12, "aisleSign", "1 PLUMBING", "w"], [25, 14, "aisleSign", "2 TOOLS"], [0, 10, "fireExt"],
        [16, 9, "bigSign", "LUMBER", "s"], [25, 10, "bigSign", "GARDEN", "w"], [20, 5, "roomSign", "BACK ROOM", "s"],
        [17, 1, "pegboard"], [17, 3, "pegboard", null, "w"], [11, 0, "sawBlade", "CUT TO SIZE"], [14, 0, "warning", "HARD HATS"],
        [25, 1, "seedRack"], [25, 3, "trellis", null, "e"], [25, 5, "trellis"], [25, 7, "trellis", null, "e"], [31, 14, "poster", "MULCH SALE", "s"],
        [35, 19, "toolWall"], [35, 20, "toolWall"], [9, 3, "roomSign", "PAINT VAULT", "s"], [18, 25, "exitSign", "EXIT", "n"],
        [0, 19, "poster", "SPRING SALE"], [0, 21, "noticeBoard"], [0, 23, "calendar"],
      ],
      scatter: { every: 4, keys: [["crack"], ["vent"], ["pipes"], ["poster", "REYES SINCE 1962"], ["boarded"]] },
      spots: { 2: [34, 20], 3: [2, 6], 4: [12, 6], 5: [24, 12], 6: [16, 23], 7: [6, 4] },
      signs: [[7, 9, "s"], [20, 25, "n"], [35, 16, "w"], [22, 5, "s"]],
      walkerZones: { middleAisles: [[3, 11, 22, 17]] },
      landmarks: {
        1: { name: "the paint mixer", art: "paintMixer", solid: true, size: 0.8 },
        2: { name: "the riding mower", art: "ridingMower", solid: true, size: 0.7, color: "#3f8f3a" },
        3: { name: "the toilet display", art: "toiletStack", solid: true, size: 0.95, label: "SALE" },
        4: { name: "the orange ladder", art: "ladder", solid: true, size: 0.98, color: "#e8761a" },
      },
    },

    /* Pharmacy: aisles in front, the pharmacy counter across the back right with the
       dispensary and the cabinet room behind it; a staff hall with restroom, stock room and
       consult room back left. Loop: floor -> staff door -> hall -> dispensary -> counter gap. */
    pharmacy: {
      palette: { wall: "#9aa3a0", shelf: "#6b7b8a", counter: "#5a6f7a", floor: "#5c6064", ceiling: "#2e3033", wallStyle: "drywall", floorKind: "linoleum", ceilingKind: "panels", light: 0.8 },
      grid: [
        "##############################",
        "#...#XX..X#k..k#.......#X...X#",
        "#.$.#..z..#.KK.#.SS.SS.#c.c.c#",
        "#...#XX..$#....#.SSzSS.#.....#",
        "##D####D####Q###.SS.SS.###L###",
        "#..........z...D.............#",
        "#..............#....n........#",
        "######D#########CCCCCCCCCCCC.#",
        "#.1........................2.#",
        "#............................#",
        "#...i.S..S..S..S..S..S.......#",
        "#.....S..S..S..S..S..S.......#",
        "#.....S..S..S..S..S..S.......#",
        "#...............i............#",
        "#.....S..S..S..S..S..S...z...#",
        "#.....S..S..S..S..S..S.......#",
        "#.....S..S..S..S..S..S.......#",
        "#$...........................#",
        "#..........................4y#",
        "#.3................CCCC......#",
        "#............................#",
        "#WWWWWWWWWW#E#WWWWWWWWWWWWWWW#",
      ],
      floorRects: [[1, 1, 3, 3, "h"], [5, 1, 9, 3, "k"], [11, 1, 14, 3, "c"], [16, 1, 28, 6, "t"], [24, 1, 28, 3, "k"]],
      decor: [
        [15, 7, "bigSign", "PHARMACY", "s"], [29, 8, "bigSign", "PICK UP"],
        [7, 7, "aisleSign", "1 COLD & FLU", "s"], [10, 7, "aisleSign", "2 VITAMINS", "s"], [13, 7, "aisleSign", "3 FIRST AID", "s"],
        [1, 4, "roomSign", "RESTROOM", "s"], [6, 4, "roomSign", "STOCK"], [13, 4, "roomSign", "SAFE ROOM", "s"], [5, 7, "roomSign", "STAFF ONLY", "s"],
        [25, 4, "roomSign", "CABINET ROOM", "s"],
        [0, 9, "poster", "SMILE"], [0, 12, "poster", "FLU SHOTS"], [0, 19, "bigSign", "PHOTO"], [0, 20, "poster", "1 HOUR PHOTO"],
        [11, 21, "exitSign", "EXIT", "n"], [29, 15, "eyeChart"], [29, 12, "firstAid"], [29, 17, "clock"],
        [15, 2, "poster", "OPEN WIDE", "w"], [16, 0, "noticeBoard"], [22, 0, "calendar"], [8, 0, "tally"],
        [0, 5, "fireExt"], [0, 6, "poster", "WASH HANDS"], [29, 5, "whiteboard", "REFILLS"],
      ],
      scatter: { every: 5, keys: [["crack"], ["vent"], ["poster", "GET WELL"], ["pipes"]] },
      spots: { 2: [28, 9], 3: [8, 13], 4: [18, 19], 5: [1, 10], 6: [14, 20], 7: [14, 8] },
      signs: [[14, 7, "s"], [13, 21, "n"], [0, 15, "e"], [27, 4, "s"]],
      walkerZones: { back: [[1, 1, 28, 6]] },
      landmarks: {
        1: { name: "the giant toothbrush", art: "toothbrush", solid: true, size: 0.98, color: "#7fd1b0" },
        2: { name: "the wheelchairs", art: "wheelchairs", solid: true, size: 0.75 },
        3: { name: "the photo booth", art: "photoBooth", solid: true, size: 0.98, label: "PHOTOS" },
        4: { name: "the pill bottle", art: "pillBottle", solid: true, size: 0.9, label: "RX" },
      },
    },

    /* Auto shop: waiting room and office front left (the office has windows onto the
       shop), the parts room back left, three bays with the pit room in the middle bay.
       Loop: waiting room -> shop -> parts room -> office -> waiting room. */
    autoshop: {
      palette: { wall: "#6f6a62", shelf: "#4b5057", counter: "#2f3136", floor: "#44423d", ceiling: "#1f1e1b", wallStyle: "block", floorKind: "concrete", ceilingKind: "beams", light: 0.6 },
      grid: [
        "################################",
        "#..S..S.XX#...........SSSSSS...#",
        "#..S..S.XX#.XX.......$......2..#",
        "#..S..S...#.XX.................#",
        "#..S..S...D...................K#",
        "#..S..S...#..................iK#",
        "#......z..#...................K#",
        "#.1......$#...................K#",
        "#.........#....######..........#",
        "#####D#####....#c..c#...z......#",
        "#.........#....#....#..........#",
        "#..KK.....W....#.c..#..........#",
        "#........nW....##L###..........#",
        "#.........#....................#",
        "#####D#####....................#",
        "#......CCC#....................#",
        "#.RR.RR...#......#.....#.......#",
        "#.........D......#.....#...z...#",
        "#.RR.RR...#K....z#.....#.......#",
        "#.........#Ki....###Q###.......#",
        "#.3.......#K.....#.....#....4..#",
        "#y........#......#.k.k.#.......#",
        "#.........#......#.....#......$#",
        "#WWWW#E#WW######################",
      ],
      floorRects: [[1, 15, 9, 22, "h"], [1, 10, 9, 13, "c"]],
      decor: [
        [12, 23, "garageDoor"], [13, 23, "garageDoor", "BAY 1"], [14, 23, "garageDoor"], [19, 23, "garageDoor"], [20, 23, "garageDoor", "BAY 2"], [21, 23, "garageDoor"],
        [25, 23, "garageDoor"], [26, 23, "garageDoor", "BAY 3"], [27, 23, "garageDoor"],
        [31, 4, "pegboard"], [31, 5, "pegboard"], [31, 6, "pegboard"], [10, 18, "pegboard", null, "e"], [10, 19, "toolWall", null, "e"], [10, 20, "pegboard", null, "e"],
        [0, 16, "bigSign", "ORTIZ AUTO"], [16, 0, "bigSign", "ORTIZ AUTO"], [4, 14, "roomSign", "OFFICE", "s"], [4, 9, "roomSign", "PARTS", "s"], [10, 16, "roomSign", "SHOP", "w"],
        [0, 18, "poster", "OIL CHANGE"], [0, 10, "calendar"], [0, 12, "noticeBoard"], [5, 0, "clock"], [0, 3, "poster", "PARTS DEPT"],
        [31, 15, "warning", "NO SMOKING"], [20, 10, "warning", "KEEP OUT", "e"], [15, 10, "warning", "PIT", "w"], [31, 10, "graffiti", "DEV CAME BY"], [31, 12, "toolWall"],
        [5, 23, "exitSign", "EXIT", "n"], [10, 13, "fireExt", null, "e"], [23, 16, "poster", "TIRE SALE", "w"],
      ],
      scatter: { every: 5, keys: [["crack"], ["vent"], ["pipes"], ["boarded"]] },
      spots: { 2: [8, 4], 3: [29, 3], 4: [4, 22], 5: [8, 16], 6: [15, 13], 7: [7, 2] },
      signs: [[10, 6, "e"], [7, 23, "n"], [23, 17, "w"], [18, 12, "s"]],
      walkerZones: { partsRoom: [[1, 1, 9, 8]] },
      landmarks: {
        1: { name: "the engine crane", art: "engineHoist", solid: true, size: 0.98 },
        2: { name: "the red tool chest", art: "toolChest", solid: true, size: 0.9, color: "#c0392b" },
        3: { name: "the soda machine", art: "vending", solid: true, size: 0.98, color: "#c0392b", label: "SODA" },
        4: { name: "the oil drums", art: "drums", solid: true, size: 0.7, color: "#2f5f9a", label: "OIL" },
      },
    },

    /* Electronics store: the service counter at the back with the staff area behind it,
       repair shop, stock room and the manager's office along the back wall; two long middle
       rows of shelves and display tables. Loop: repair -> stock -> staff area -> floor. */
    radioshack: {
      palette: { wall: "#6b7480", shelf: "#3b4250", counter: "#2f3540", floor: "#4a4e56", ceiling: "#23262c", wallStyle: "drywall", floorKind: "carpet", ceilingKind: "panels", light: 0.6 },
      grid: [
        "##############################",
        "#KKKK....#..S..S..XX#c......c#",
        "#........#$.S..Sz.###...KK...#",
        "#....z...D..S..S.#.k#........#",
        "#......KK#..S..S.Q..#..c.....#",
        "#......KK#.......#.k#........#",
        "####D#########D#########L#####",
        "#.........C....n............$#",
        "#.1.......C...........z....2.#",
        "#.........CCCCCCCCCCC........#",
        "#............................#",
        "#..SSSSSSSSSS...SSSSSSSSSS...#",
        "#......i.............i.......#",
        "#..SSSSSSSSSS...SSSSSSSSSS...#",
        "#...........z................#",
        "#....KKK...KKK...KKK..KKK....#",
        "#........................z...#",
        "#y...........................#",
        "#.3..........CCCC..........4.#",
        "#$...........................#",
        "#............................#",
        "#WWWWWW#E#WWWWWWWWWWWWWWWWWWW#",
      ],
      floorRects: [[1, 1, 8, 5, "k"], [10, 1, 19, 5, "k"], [21, 1, 28, 5, "l"], [11, 7, 21, 8, "t"]],
      decor: [
        [6, 6, "bigSign", "SIGNAL", "s"], [8, 6, "bigSign", "ELECTRONICS", "s"], [3, 6, "roomSign", "REPAIRS", "s"], [13, 6, "roomSign", "STOCK", "s"],
        [23, 6, "roomSign", "MANAGER", "s"], [17, 3, "roomSign", "LOCKER", "w"], [19, 6, "whiteboard", "BACK SOON", "s"],
        [0, 8, "tvScreen"], [0, 10, "tvScreen"], [29, 10, "tvScreen"], [0, 12, "poster", "NEW PHONES"], [0, 14, "poster", "BIG SALE"],
        [29, 12, "poster", "GAME ON"], [29, 14, "poster", "HEADPHONES"], [7, 21, "exitSign", "EXIT", "n"],
        [0, 2, "whiteboard", "FIX BY FRI"], [2, 0, "pegboard"], [3, 0, "pegboard"], [4, 0, "pegboard"], [22, 0, "noticeBoard"],
        [29, 17, "graffiti", "STAY QUIET"], [29, 8, "clock"], [9, 4, "calendar", null, "w"],
      ],
      scatter: { every: 4, keys: [["crack"], ["vent"], ["poster", "CABLES"], ["tvScreen"], ["pipes"]] },
      spots: { 2: [28, 16], 3: [12, 17], 4: [14, 12], 5: [1, 10], 6: [10, 20], 7: [24, 8] },
      signs: [[9, 21, "n"], [0, 16, "e"], [29, 9, "w"], [25, 6, "s"]],
      walkerZones: { robot: [[19, 7, 28, 10]] },
      landmarks: {
        1: { name: "the TV wall", art: "tvWall", solid: true, size: 0.98, foot: [3, 1] },
        2: { name: "the robot", art: "robotMascot", solid: true, size: 0.95, label: "SIG" },
        3: { name: "the arcade game", art: "arcade", solid: true, size: 0.98 },
        4: { name: "the big dish", art: "satDish", solid: true, size: 0.98 },
      },
    },

    /* Garden center under glass: a big greenhouse on the left, the palm house back right,
       the potting shed between the palm house and the bee yard, the shop by the gate.
       Loop: shop -> greenhouse -> palm house -> path -> bee yard -> shop. */
    garden: {
      palette: { wall: "#7a8a6a", shelf: "#5a4535", counter: "#6b5a3a", floor: "#6b6248", ceiling: "#9fb3c8", wallStyle: "wood", floorKind: "gravel", ceilingKind: "sky", light: 0.9 },
      grid: [
        "#WWWWWWWWWWWWWWW#WWWWWWWWWWWWWW#",
        "W...............W..............W",
        "W...KKKKK.KKKK..W.KKKK.KKKK....W",
        "W.1.............W...........2..W",
        "W...KKKKK.KKKK..W.KKKK.KKKK....W",
        "W...........z...W.....z......K.W",
        "W...KKKKK.KKKK..W.KKKK.KKKK.nK.W",
        "W...............D............K.W",
        "W...KKKKKiKKKK..W..............W",
        "W...............W..............W",
        "W...KKKKK.KKKK..WWWWDWWW########",
        "W...............W.......#XX..XX#",
        "W$..............W.X.....#.c..c.#",
        "W...............W.......L......#",
        "######D#######D##..z....#..c...#",
        "#...........#...........#XX..XX#",
        "#....CCC....#.........$.########",
        "#.....i.....#..................W",
        "#...........D..................W",
        "#........#Q##..................W",
        "#..3....#...#...z...........4..W",
        "#.......#k.k#................y.W",
        "#.......#...#.................$W",
        "#WWWWWEWWWWW####################",
      ],
      floorRects: [[17, 1, 30, 9, "p"], [1, 15, 11, 22, "w"], [25, 11, 30, 15, "k"], [13, 17, 30, 22, "d"], [17, 11, 23, 16, "p"], [13, 15, 16, 16, "p"]],
      decor: [
        [0, 16, "seedRack"], [0, 17, "seedRack"], [0, 18, "seedRack"], [12, 16, "bigSign", "GREENHOUSE", "w"], [12, 15, "clock", null, "w"],
        [24, 12, "roomSign", "POTTING SHED", "w"], [24, 15, "trellis"], [25, 16, "trellis"], [27, 16, "trellis", null, "s"], [29, 16, "trellis", null, "s"],
        [12, 20, "toolWall", null, "e"], [12, 21, "toolWall", null, "e"], [3, 14, "trellis", null, "n"], [9, 14, "bigSign", "GREENHOUSE 1", "n"], [15, 14, "poster", "NEW PLANTS", "s"],
        [0, 20, "noticeBoard"], [0, 21, "calendar"], [30, 23, "poster", "BEES AT WORK"], [16, 23, "trellis"], [20, 23, "trellis"], [25, 23, "poster", "NO HONEY"],
        [24, 10, "bigSign", "PALM HOUSE", "n"], [30, 16, "trellis"], [14, 23, "boarded"], [18, 23, "poster", "SHUT GATE"], [28, 23, "trellis"],
      ],
      scatter: { every: 3, keys: [["trellis"], ["crack"], ["toolWall"], ["poster", "HOME GROWN"]] },
      spots: { 2: [30, 1], 3: [2, 12], 4: [23, 13], 5: [4, 22], 6: [21, 9], 7: [2, 5] },
      signs: [[12, 19, "e"], [0, 19, "e"], [9, 19, "n"], [24, 14, "w"]],
      walkerZones: { bigGreenhouseBack: [[1, 1, 15, 6]] },
      landmarks: {
        1: { name: "the scarecrow", art: "scarecrow", solid: true, size: 1.6 },
        2: { name: "the palm tree", art: "palmTree", solid: true, size: 2.4 },
        3: { name: "the big gnome", art: "gnome", solid: true, size: 1.4 },
        4: { name: "the beehives", art: "beehives", solid: true, size: 1.1 },
      },
    },

    /* Police precinct: lobby and front desk, a secure door onto the long hall; squad room,
       interview room and holding cells off it; K9 unit, evidence and the armory along the
       back hall; the garage down the whole right side. Loops through the garage and the
       squad room's two doors. */
    police: {
      palette: { wall: "#5b6b7a", shelf: "#4b5057", counter: "#3a3f4a", floor: "#45484f", ceiling: "#22252b", wallStyle: "block", floorKind: "linoleum", ceilingKind: "panels", light: 0.55 },
      grid: [
        "######################################",
        "#........XX#S.S.S..#S....S#..........#",
        "#........XX#S.S.S..#.c..c.#...z......#",
        "#..1.......#S.S.Sk.#......#..........#",
        "#..........#S.S.S..#S....S#......2...#",
        "#.......z..#.k.....#..c...#..........#",
        "#KK........#.......#......#..........#",
        "#####D#########Q#######L###..........#",
        "#.........................D..........#",
        "#$..................z.....#..........#",
        "#######D#######..##########..........#",
        "#.............#..#........#..........#",
        "#.KK..i.KK.KK.#..D..KKz...#..........#",
        "#.KK....KK.KK.#..#..KK....#..........#",
        "#.............#..#........########...#",
        "#.KK....KK.KK.D..##########..........#",
        "#.KK....KK.KK.#..D.....z..#..........#",
        "#........z....#..##D##D##D#..........#",
        "#.............#..#R.#R.#R.#..........#",
        "#.............#..#..#..#..#..........#",
        "###############D###########....z.....#",
        "#$.................n..C...#.......i..#",
        "#................CCCCCC...#......4...#",
        "#..RRRR...................#..........#",
        "#y........................D..........#",
        "#.3..RRRR.................#..........#",
        "#.........................#.........$#",
        "#WWWWWWWWWWWWW#E#WWWWWWWWW############",
      ],
      floorRects: [[1, 1, 10, 6, "k"], [12, 1, 18, 6, "k"], [20, 1, 25, 6, "k"], [1, 11, 13, 19, "c"], [18, 16, 25, 19, "k"], [1, 21, 25, 26, "t"], [27, 1, 36, 26, "k"]],
      decor: [
        [0, 12, "wantedBoard"], [0, 14, "wantedBoard"], [0, 16, "noticeBoard"], [0, 18, "wallMap"], [14, 11, "lockers", null, "w"], [14, 12, "lockers", null, "w"], [14, 13, "lockers", null, "w"],
        [7, 20, "whiteboard", "BRIEFING 6PM", "n"], [4, 7, "roomSign", "K9 UNIT", "s"], [14, 7, "roomSign", "EVIDENCE", "s"], [22, 7, "roomSign", "ARMORY", "s"],
        [6, 10, "roomSign", "SQUAD ROOM", "n"], [17, 11, "roomSign", "INTERVIEW", "w"], [17, 15, "roomSign", "HOLDING"], [26, 9, "roomSign", "GARAGE", "w"],
        [6, 20, "bigSign", "4TH PRECINCT", "s"], [10, 20, "bigSign", "TO PROTECT", "s"], [12, 20, "clock", null, "s"], [14, 27, "exitSign", "EXIT", "n"],
        [0, 22, "poster", "MISSING"], [0, 24, "poster", "CALL 911"], [26, 22, "poster", "REPORT IT", "w"], [0, 2, "poster", "GOOD DOG"],
        [28, 27, "garageDoor"], [29, 27, "garageDoor", "BAY 1"], [30, 27, "garageDoor"], [32, 27, "garageDoor"], [33, 27, "garageDoor", "BAY 2"], [34, 27, "garageDoor"],
        [37, 10, "toolWall"], [37, 12, "pegboard"], [30, 14, "bigSign", "SALLY PORT", "s"], [37, 6, "warning", "NO PARKING"], [20, 18, "graffiti", "I WAS HERE", "w"], [23, 19, "tally", null, "e"],
        [0, 8, "fireExt"], [11, 7, "noticeBoard"],
      ],
      scatter: { every: 5, keys: [["crack"], ["vent"], ["pipes"], ["poster", "STAY SAFE"]] },
      spots: { 2: [5, 3], 3: [35, 10], 4: [19, 19], 5: [25, 22], 6: [18, 16], 7: [36, 24] },
      signs: [[16, 27, "n"], [0, 13, "e"], [0, 23, "e"], [24, 7, "s"]],
      walkerZones: { garage: [[27, 1, 36, 26]] },
      landmarks: {
        1: { name: "the dog kennel", art: "kennel", solid: true, size: 0.75, label: "K9" },
        2: { name: "the police bike", art: "motorcycle", solid: true, size: 0.75 },
        3: { name: "the coffee machine", art: "coffeeMachine", solid: true, size: 0.9 },
        4: { name: "the riot shields", art: "riotShields", solid: true, size: 0.95 },
      },
    },

    /* Middle school: classrooms off the main hall (science with the big brain, room 104,
       the library with its closet, music with the drum set), the office, cafeteria and gym
       in front, the lobby by the doors. Loops: hall -> cafeteria -> front hall,
       cafeteria -> gym -> hall. */
    school: {
      palette: { wall: "#8a8f7a", shelf: "#6b3f8a", counter: "#5a4535", floor: "#5a5a50", ceiling: "#2b2b26", wallStyle: "block", floorKind: "linoleum", ceilingKind: "panels", light: 0.6 },
      grid: [
        "########################################",
        "#..........#........#S.S.S#c..c#......$#",
        "#.......KK.#.K.K.K..#S.S.S#....#.......#",
        "#..1.......#...z....#S.S.S#.c..#...2...#",
        "#.......KK.#.K.K.K..#S.S.S#....#.......#",
        "#.KK.......#........#.....##L###RRRRR..#",
        "#.KK....KK.D.K.K.K..#..........#.......#",
        "#..........#........#SSS..SSS..#RRRRR..#",
        "#.KK....KK.#.K.K.K..#..........#.i.....#",
        "#..........#........#..z..KK...#RRRRR..#",
        "#...KKn....#....KK..#SSS..SSS..#.......#",
        "#..........#........#..........#.......#",
        "#####D##########D########D#########D####",
        "#.......................z..............#",
        "#......................................#",
        "#####D######..#####..#########D#########",
        "#..........#..#..........#.............#",
        "#..i.......#..#..........#RRRRRRRRRRR..#",
        "#.CCCC.....D..#.KKK..KKK.#.............#",
        "#....KK.####..#..........#.............#",
        "#....KK.Q.k#..D..........#.....z.......#",
        "#.......#.k#..#.KKK..KKK.#.............#",
        "######D#####..#..........#.............#",
        "#.............#...z......#.............#",
        "#.............#.KKK..KKK.D.............#",
        "#...3.........#..........#........4....#",
        "#.RR..........#..........#.........y...#",
        "#.............#CCCCCC....#.............#",
        "#.............#.$........#............$#",
        "#WWWWWWWWWW#E##WWWWWWWWWW###############",
      ],
      floorRects: [[26, 16, 38, 28, "w"], [15, 16, 24, 28, "h"], [21, 1, 30, 11, "c"], [27, 1, 30, 4, "k"], [32, 1, 38, 11, "w"], [1, 16, 10, 21, "c"], [1, 23, 13, 28, "t"]],
      decor: [
        [7, 12, "lockers", null, "s"], [8, 12, "lockers", null, "s"], [9, 12, "lockers", null, "s"], [10, 12, "lockers", null, "s"], [18, 12, "lockers", null, "s"], [19, 12, "lockers", null, "s"],
        [20, 12, "lockers", null, "s"], [21, 12, "lockers", null, "s"], [28, 12, "lockers", null, "s"], [29, 12, "lockers", null, "s"], [30, 12, "lockers", null, "s"], [37, 12, "lockers", null, "s"], [38, 12, "lockers", null, "s"],
        [7, 15, "lockers", null, "n"], [8, 15, "lockers", null, "n"], [9, 15, "lockers", null, "n"], [22, 15, "lockers", null, "n"], [23, 15, "lockers", null, "n"], [24, 15, "lockers", null, "n"],
        [33, 15, "lockers", null, "n"], [34, 15, "lockers", null, "n"], [35, 15, "lockers", null, "n"], [36, 15, "lockers", null, "n"],
        [4, 12, "roomSign", "SCIENCE", "s"], [15, 12, "roomSign", "ROOM 104", "s"], [24, 12, "roomSign", "LIBRARY", "s"], [34, 12, "roomSign", "MUSIC", "s"],
        [4, 15, "roomSign", "OFFICE", "n"], [8, 21, "roomSign", "PRINCIPAL", "w"], [18, 15, "roomSign", "CAFETERIA", "n"], [29, 15, "roomSign", "GYM", "n"], [11, 15, "trophyCase"],
        [0, 24, "trophyCase"], [0, 26, "trophyCase"], [14, 24, "mural", "LIONS PRIDE", "w"], [11, 29, "exitSign", "EXIT", "n"],
        [0, 17, "noticeBoard"], [0, 19, "clock"], [0, 20, "calendar"], [0, 7, "chalkboard", "BRAIN PARTS"], [0, 2, "poster", "SAFETY FIRST"], [13, 12, "chalkboard", "READ DAILY", "n"],
        [31, 6, "bookWall", null, "w"], [31, 8, "bookWall", null, "w"], [31, 10, "bookWall", null, "w"], [20, 6, "bookWall", null, "e"], [20, 8, "bookWall", null, "e"], [20, 11, "bookWall", null, "e"],
        [39, 4, "poster", "BAND CLUB"], [39, 10, "poster", "CONCERT"], [39, 20, "bigSign", "GO LIONS"], [39, 24, "bigSign", "SCORE 0-0"], [25, 18, "mural", "LIONS", "e"],
        [14, 27, "menuBoard", "TACO TUESDAY", "e"], [25, 27, "menuBoard", "PIZZA FRIDAY", "w"],
      ],
      scatter: { every: 6, keys: [["crack"], ["poster", "BE KIND"], ["vent"], ["poster", "CLUB SIGNUP"]] },
      spots: { 2: [37, 2], 3: [1, 13], 4: [38, 14], 5: [7, 17], 6: [10, 28], 7: [28, 22] },
      signs: [[11, 9, "e"], [14, 28, "w"], [0, 13, "e"], [27, 5, "s"]],
      walkerZones: { mainHallway: [[1, 13, 38, 14]] },
      landmarks: {
        1: { name: "the big brain", art: "brainModel", solid: true, size: 0.9 },
        2: { name: "the drum set", art: "drumSet", solid: true, size: 0.75 },
        3: { name: "the lion statue", art: "lionStatue", solid: true, size: 0.98, label: "LIONS" },
        4: { name: "the basketball hoop", art: "hoop", solid: true, size: 0.98 },
      },
    },

    /* Fire station: the truck bay down the right side with the equipment bay in its back
       corner; bunk room, lockers, the long hall, the office (behind the watch desk) and the
       day room on the left; the watch room by the front door. Loops: office has two doors,
       the day room and the watch room both open onto the bay. */
    firehouse: {
      palette: { wall: "#8a4a3a", shelf: "#4b5057", counter: "#3a3f4a", floor: "#4a4a4e", ceiling: "#22252b", wallStyle: "brick", floorKind: "concrete", ceilingKind: "beams", light: 0.65 },
      grid: [
        "##################################",
        "#R.R.R.R.R.#SSSS..#.......#XX..XX#",
        "#R.R.R.R.R.#....k.#.......#.c..c.#",
        "#..........#......#.......#......#",
        "#..1.......#SSSS..#.......#..c...#",
        "#.......z..#......#....2..#......#",
        "#R.R.R.R.R.#......#.......###L####",
        "#R.R.R.R.R.#......#......y.......#",
        "#..........#k.....#...z..........#",
        "#####D########Q####.............K#",
        "#.................D.............K#",
        "#.................#.............K#",
        "####D########..########..........#",
        "#.......#.........#..............#",
        "#.i.....#.KK...CC.#............i.#",
        "#.......#...z.....D..............#",
        "#KK.....#.KK......#..............#",
        "#.......#.........#...z..........#",
        "####D########D#####..............#",
        "#.................#..............#",
        "#.CCCCC...........#..............#",
        "#.....n...........#...........4..#",
        "#.3...............D..............#",
        "#.................#..............#",
        "#$................#.............$#",
        "#WWWW#E#WWWWWWWWWW################",
      ],
      floorRects: [[1, 1, 10, 8, "c"], [12, 1, 17, 8, "h"], [1, 10, 17, 11, "l"], [1, 13, 7, 17, "c"], [9, 13, 17, 17, "l"], [1, 19, 17, 24, "t"]],
      decor: [
        [20, 25, "garageDoor"], [21, 25, "garageDoor", "ENGINE 12"], [22, 25, "garageDoor"], [24, 25, "garageDoor"], [25, 25, "garageDoor", "LADDER 12"], [26, 25, "garageDoor"],
        [28, 25, "garageDoor"], [29, 25, "garageDoor", "RESCUE"], [30, 25, "garageDoor"],
        [33, 16, "hoseRack"], [33, 18, "hoseRack"], [33, 9, "pegboard"], [33, 10, "pegboard"], [33, 11, "pegboard"], [33, 8, "wallMap"],
        [18, 19, "bigSign", "STATION 12", "w"], [21, 0, "bigSign", "STATION 12"], [18, 8, "warning", "WATCH TRUCKS", "e"],
        [4, 9, "roomSign", "BUNKS", "s"], [13, 9, "roomSign", "LOCKERS", "s"], [3, 12, "roomSign", "OFFICE", "n"], [3, 18, "roomSign", "OFFICE", "s"],
        [12, 12, "roomSign", "DAY ROOM", "n"], [12, 18, "roomSign", "DAY ROOM", "s"], [28, 6, "roomSign", "EQUIPMENT", "s"],
        [11, 2, "lockers", null, "e"], [11, 3, "lockers", null, "e"], [11, 5, "lockers", null, "e"], [11, 7, "lockers", null, "e"],
        [8, 15, "tvScreen", null, "e"], [8, 13, "calendar", null, "e"], [18, 13, "menuBoard", "CHILI NIGHT", "w"],
        [0, 20, "noticeBoard", "KEYS"], [0, 22, "poster", "FIRE DRILL"], [0, 23, "poster", "FIRE SAFETY"], [5, 25, "exitSign", "EXIT", "n"],
        [0, 3, "clock"], [0, 8, "poster", "LIGHTS OUT"], [0, 10, "fireExt"], [0, 11, "noticeBoard", "SHIFT A B C"],
      ],
      scatter: { every: 5, keys: [["crack"], ["hoseRack"], ["vent"], ["poster", "TRAIN HARD"]] },
      spots: { 2: [5, 3], 3: [32, 13], 4: [4, 23], 5: [17, 14], 6: [5, 16], 7: [31, 22] },
      signs: [[18, 23, "e"], [18, 4, "e"], [7, 25, "n"], [30, 6, "s"]],
      walkerZones: { truckBay: [[19, 1, 32, 24]] },
      rod: [32, 4], // Chief Dunn's fishing pole, in the back corner of the equipment bay (WORLD.RIVER.rod)
      landmarks: {
        1: { name: "the brass pole", art: "firePole", solid: true, size: 0.98 },
        2: { name: "the fire truck", art: "fireTruck", solid: true, size: 0.98, foot: [3, 3] },
        3: { name: "the spotted dog", art: "dalmatian", solid: true, size: 0.7 },
        4: { name: "the gear racks", art: "gearRack", solid: true, size: 0.95 },
      },
    },

    /* Hospital annex: patient rooms, the x-ray room and the chapel along the back hall;
       wards, the nurses' station (open onto the main corridor), the pharmacy stock room and
       the utility room between the back hall and the middle hall; the gift shop, lobby and
       emergency room in front. Many loops: the halls are joined by the corridor and by
       rooms with two doors. */
    hospital: {
      palette: { wall: "#9aa39a", shelf: "#e6dfcc", counter: "#6e7278", floor: "#6b716b", ceiling: "#303430", wallStyle: "tile", floorKind: "linoleum", ceilingKind: "panels", light: 0.35 },
      grid: [
        "##########################################",
        "#.........#.....#.....#.....#S.k#........#",
        "#.........#RR...#RR...#RR...#S..#....2.y.#",
        "#...1.....#.....#.....#..z..#S..#........#",
        "#.........#RR.i.#RR...#RR...#S.k#.RR..RR.#",
        "#......z..#.....#.....#.....#...#........#",
        "#.KK......#.....#.....#.....#...#.RR..RR.#",
        "#.........#.....#.....#.....#...#....z...#",
        "#####D#######D#####D#####D####Q#####D#####",
        "#........................................#",
        "#........................................#",
        "##########D#########..###########D####D###",
        "#.R..R.#.R..R.#.......#XX..XX#......#....#",
        "#......#......#.CCCC..#.c..c.#XX..XX#R..R#",
        "#.R..R.#.R..R.#.C.....#......#......#....#",
        "#..z...#......#.C.n...L......#...i..#.z..#",
        "#.R..R.#.R.zR.#.C.....#..c...#......#R..R#",
        "#......#......#.......#XX..XX#KK....#....#",
        "#$.....#......#.......########......#....#",
        "###D######D#########..###########D####D###",
        "#........................................#",
        "#........................................#",
        "#####D##############..###########D########",
        "#S......S#................#..............#",
        "#S......S#................#..............#",
        "#Si.....S#....CCCC........#.RR.z.........#",
        "#S......S#................#..............#",
        "#S..3....D................D.RR.....4.....#",
        "#S......S#.RRR........RRR.#..............#",
        "#S......S#................#..............#",
        "#S..z...S#................#.............$#",
        "#WWWWWWWW#WWWWWWWWEWWWWWWW################",
      ],
      floorRects: [[33, 1, 40, 7, "c"], [10, 23, 25, 30, "t"], [1, 23, 8, 30, "c"], [23, 12, 28, 17, "k"], [30, 12, 35, 18, "k"], [29, 1, 31, 7, "k"]],
      decor: [
        [4, 8, "roomSign", "X-RAY", "s"], [12, 8, "roomSign", "ROOM 101", "s"], [18, 8, "roomSign", "ROOM 102", "s"], [24, 8, "roomSign", "ROOM 103", "s"],
        [29, 8, "roomSign", "SUPPLY", "s"], [35, 8, "roomSign", "CHAPEL", "s"], [9, 11, "roomSign", "WARD B", "n"], [32, 11, "roomSign", "UTILITY", "n"],
        [37, 11, "roomSign", "ROOM 110", "n"], [19, 11, "roomSign", "NURSES", "n"], [2, 19, "roomSign", "WARD A", "s"], [9, 19, "roomSign", "WARD B", "s"],
        [32, 19, "roomSign", "UTILITY", "s"], [37, 19, "roomSign", "ROOM 110", "s"], [22, 13, "roomSign", "PHARMACY", "w"],
        [14, 13, "roomSign", "NURSES", "e"], [9, 24, "bigSign", "ST. ANNE"], [26, 24, "bigSign", "EMERGENCY", "w"], [9, 26, "bigSign", "GIFT SHOP"],
        [0, 13, "eyeChart"], [0, 9, "firstAid"], [41, 9, "firstAid"], [41, 28, "firstAid"], [0, 20, "clock"], [9, 30, "exitSign", "EXIT"], [26, 30, "exitSign", "EXIT", "w"],
        [14, 15, "noticeBoard", null, "e"], [0, 21, "poster", "WASH HANDS"], [41, 20, "poster", "QUIET PLEASE"], [41, 10, "poster", "QUIET"], [41, 3, "mural", "PEACE"],
        [34, 31, "garageDoor"], [35, 31, "garageDoor", "AMBULANCE"], [36, 31, "garageDoor"], [41, 25, "warning", "OXYGEN"],
        [0, 2, "warning", "RADIATION"], [0, 5, "panel"], [2, 22, "bigSign", "GIFTS", "s"], [41, 14, "graffiti", "SHH"],
      ],
      scatter: { every: 5, keys: [["crack"], ["vent"], ["firstAid"], ["poster", "VISIT HOURS"], ["pipes"]] },
      spots: { 2: [6, 2], 3: [1, 10], 4: [40, 10], 5: [32, 16], 6: [20, 17], 7: [16, 29] },
      signs: [[5, 19, "s"], [26, 28, "w"], [16, 8, "s"], [22, 16, "w"]],
      // the dark rooms, every one off the halls: x-ray, 101, 102, 103, the chapel, ward A, ward B, the utility room,
      // room 110, the gift shop and emergency
      walkerZones: {
        darkRooms: [[1, 1, 9, 7], [11, 1, 15, 7], [17, 1, 21, 7], [23, 1, 27, 7], [33, 1, 40, 7], [1, 12, 6, 18], [8, 12, 13, 18],
          [30, 12, 35, 18], [37, 12, 40, 18], [1, 23, 8, 30], [27, 23, 40, 30]],
      },
      landmarks: {
        1: { name: "the x-ray machine", art: "xray", solid: true, size: 0.98 },
        2: { name: "the angel statue", art: "angelStatue", solid: true, size: 0.98 },
        3: { name: "the giant teddy bear", art: "giantBear", solid: true, size: 0.95 },
        4: { name: "the rescue van", art: "ambulance", solid: true, size: 0.98, foot: [3, 3] },
      },
    },

    /* Pump building: the pump hall with the locked pump house at its back, the control
       room and the blue pump room on the right, chlorine store, entry hall and boat
       workshop in front. Loop: entry -> pump hall -> blue pump room -> workshop -> entry. */
    watertower: {
      palette: { wall: "#5f6b6e", shelf: "#3f5a4a", counter: "#4b5057", floor: "#3f4446", ceiling: "#1d2022", wallStyle: "concrete", floorKind: "concrete", ceilingKind: "pipes", light: 0.45 },
      grid: [
        "##############################",
        "#......XX..#XX..XX#.CCCCCCCC.#",
        "#....i.XX..#.c..c.#....n.....#",
        "#..1.......#......#..........#",
        "#..........#..c...#........z.#",
        "#..........###L####..........#",
        "#...............z.#####D######",
        "#.................#.........$#",
        "#...XX...XX...XX..#..........#",
        "#...XX...XX...XX..#.....2....#",
        "#.......z.........D..........#",
        "#.................#..z.......#",
        "#$................#..........#",
        "#####D#######..#########D#####",
        "#........#.........#.....#k.k#",
        "#......X.#..KK.....#KKK..#...#",
        "#......X.#.........#.....i#Q##",
        "#........#.........#.........#",
        "#........D.........D.........#",
        "#..3.....#.........#....4....#",
        "#.y......#.........#.........#",
        "#........#.........#......z..#",
        "#........#.........#$........#",
        "##########WWWWEWWWW###########",
      ],
      floorRects: [[10, 14, 18, 22, "t"], [19, 1, 28, 5, "l"], [19, 7, 28, 12, "g"], [1, 6, 17, 7, "g"]],
      decor: [
        [0, 6, "pipes"], [0, 8, "pipes"], [0, 10, "pipes"], [5, 0, "pipes"], [9, 0, "pipes"], [19, 0, "panel"], [28, 0, "panel"], [29, 3, "panel"], [29, 2, "breaker"],
        [18, 3, "warning", "HIGH VOLTAGE", "e"], [9, 15, "warning", "CHLORINE", "e"], [13, 5, "warning", "PUMP HOUSE", "s"],
        [22, 6, "roomSign", "CONTROL", "s"], [19, 17, "roomSign", "WORKSHOP", "w"], [9, 17, "roomSign", "CHLORINE", "e"], [12, 13, "roomSign", "PUMP HALL", "s"], [10, 13, "noticeBoard", null, "s"],
        [9, 20, "lockers", null, "e"], [9, 21, "lockers", null, "e"], [22, 23, "garageDoor"], [23, 23, "garageDoor"], [24, 23, "garageDoor", "BOAT RAMP"], [25, 23, "garageDoor"], [26, 23, "garageDoor"],
        [29, 15, "toolWall"], [29, 17, "toolWall"], [29, 9, "clock"], [9, 22, "exitSign", "EXIT", "e"], [0, 15, "wallMap", "RIVER MAP"],
      ],
      scatter: { every: 4, keys: [["pipes"], ["crack"], ["vent"], ["warning", "WET FLOOR"]] },
      spots: { 2: [28, 1], 3: [11, 21], 4: [21, 8], 5: [16, 21], 6: [28, 11], 7: [7, 9] },
      signs: [[11, 13, "s"], [19, 20, "w"], [26, 16, "s"], [15, 5, "s"]],
      landmarks: {
        1: { name: "the big red wheel", art: "valveWheel", solid: true, size: 0.9 },
        2: { name: "the blue pump", art: "bigPump", solid: true, size: 0.98, foot: [3, 3] },
        3: { name: "the green tanks", art: "chlorineTanks", solid: true, size: 0.98 },
        4: { name: "the rowboat", art: "rowboat", solid: true, size: 0.7, foot: [3, 1] },
      },
    },

    /* Lumber yard: the saw shop, a dead-end alley and the kiln shed along the back of the
       rack hall; the log yard out back right; long racks; the sales office and the cut room
       in front; the loading dock down the right side. Loops: rack hall -> dock -> cut room. */
    lumberyard: {
      palette: { wall: "#7a5a3a", shelf: "#8a5a2e", counter: "#3b3d44", floor: "#5a4a38", ceiling: "#2a2016", wallStyle: "wood", floorKind: "concrete", ceilingKind: "beams", light: 0.6 },
      grid: [
        "########################################",
        "#...........#..#XX...XX#..............$#",
        "#..KKK......#..#.c...c.#...............#",
        "#...1...n...#..#.......#.........2.....#",
        "#...........#..#...c...#.......i.......#",
        "#KK.........#..#XX...XX#......z........#",
        "#...........#..#.......#...............#",
        "######D######..###L#####...............#",
        "#......................#...............#",
        "#...S...S...S...S...S..#...............#",
        "#...S...S...S...S...S..###..############",
        "#...S...S...S...S...S...S....#.........#",
        "#...S.i.S...S...S...S...S....#..z......#",
        "#............................#.........#",
        "#............................D.....z...#",
        "#...S...S...S...S...S...S....#.........#",
        "#...S...S.z.S...S...S.i.S....#.........#",
        "#...S...S...S...S...S...S....#..z......#",
        "#...S...S...S...S...S...S....#.........#",
        "#............................#.........#",
        "######D#############..########.........#",
        "#........#k.k#...............#.........#",
        "#..CCCC..#...#.KKK....XX.....#.........#",
        "#.........#Q##........XX.....#.........#",
        "#............#...............#....4....#",
        "#..3.........D...............D.........#",
        "#...y........#..........z....#.........#",
        "#............#.$.............#.........#",
        "#............#...............#........$#",
        "#WWWWWW#E#WWW###########################",
      ],
      floorRects: [[24, 1, 38, 9, "d"], [26, 10, 27, 10, "d"], [1, 21, 12, 28, "w"], [1, 1, 11, 6, "p"], [14, 21, 28, 28, "p"], [1, 8, 28, 19, "r"], [13, 1, 14, 7, "r"]],
      decor: [
        [9, 7, "sawBlade", "RIDGE LUMBER", "s"], [10, 20, "aisleSign", "2X4", "n"], [14, 20, "aisleSign", "2X6", "n"], [18, 20, "aisleSign", "PLYWOOD", "n"], [16, 7, "aisleSign", "OAK", "s"],
        [5, 7, "roomSign", "SAW SHOP", "s"], [17, 7, "roomSign", "KILN", "s"], [5, 20, "roomSign", "SALES", "n"], [10, 23, "roomSign", "FOREMAN", "s"],
        [29, 13, "bigSign", "LOADING DOCK", "w"], [29, 24, "bigSign", "DOCK", "w"], [29, 18, "warning", "FORKLIFTS", "w"], [0, 9, "warning", "HARD HATS"],
        [31, 29, "garageDoor"], [32, 29, "garageDoor", "DOCK 1"], [33, 29, "garageDoor"], [35, 29, "garageDoor"], [36, 29, "garageDoor", "DOCK 2"], [37, 29, "garageDoor"],
        [0, 4, "toolWall"], [0, 6, "pegboard"], [12, 2, "pegboard", null, "w"], [0, 23, "noticeBoard"], [0, 27, "calendar"], [13, 22, "poster", "CUT TO ORDER", "w"], [13, 27, "clock", null, "w"],
        [7, 29, "exitSign", "EXIT", "n"], [29, 27, "pegboard", null, "w"], [39, 5, "warning", "LOGS ROLL"], [39, 8, "boarded"], [13, 0, "graffiti", "NO SAWS"],
        [39, 15, "warning", "TRIP HAZARD"], [39, 20, "graffiti", "THEY WAIT"],
      ],
      scatter: { every: 5, keys: [["crack"], ["sawBlade"], ["toolWall"], ["poster", "SAFETY FIRST"], ["boarded"]] },
      spots: { 2: [30, 24], 3: [2, 1], 4: [31, 2], 5: [27, 14], 6: [11, 27], 7: [16, 8] },
      signs: [[9, 29, "n"], [29, 16, "w"], [12, 4, "w"], [19, 7, "s"]],
      walkerZones: { yard: [[24, 1, 38, 9]], dock: [[30, 11, 38, 28]] },
      landmarks: {
        1: { name: "the band saw", art: "bandSaw", solid: true, size: 0.98 },
        2: { name: "the log pile", art: "logPile", solid: true, size: 0.9, foot: [3, 1] },
        3: { name: "the wooden bear", art: "woodBear", solid: true, size: 0.98, label: "RIDGE" },
        4: { name: "the flatbed truck", art: "flatbed", solid: true, size: 0.98, foot: [3, 3], color: "#a33a2a" },
      },
    },

    /* Shopping mall: two concourses in a cross; stores off both sides (toys with the rocking
       horse, books, the food court, shoes, the play zone in back; clothes, pharmacy, gadgets,
       sports with the orange tent in front); a service hall behind the back stores leads to the
       security office. */
    mall: {
      palette: { wall: "#8a7f72", shelf: "#6b5a7a", counter: "#5a5050", floor: "#6a6660", ceiling: "#2e2a28", wallStyle: "drywall", floorKind: "tile", ceilingKind: "panels", light: 0.5 },
      grid: [
        "##########################################",
        "#$................................#S....S#",
        "#...........................z.....L.c..c.#",
        "#####D###############D#############...c..#",
        "#...y....#......#..........#......#......#",
        "#.1....SS#S.S.S.#CCCC..CCCC#S....S########",
        "#........#S.S.S.#..i.......#......#......#",
        "#SS....SS#S.S.S.#.KK..KK...#S....S#..2...#",
        "#...z....#......#..........#......#......#",
        "#SS....SS#S.S.S.#.KK..KK...#S....S#......#",
        "#........#$.....#..........#......#....n.#",
        "#........#......#..........#......#......#",
        "####..######D#####........####..####....##",
        "#........................................#",
        "#..........................z.............#",
        "#...........z....................CC......#",
        "#............................z...........#",
        "#.............z..........................#",
        "####..#######D###........###..######D#####",
        "#........#......#........#.......#.......#",
        "#.S.S.S..#S....S#........#S.....S#.......#",
        "#.S.S.S..#S..i.S#........#S.....S#XX...XX#",
        "#........#S....S#........#S.....S#.......#",
        "#........#......#........#.......#.......#",
        "#........#.CCCC.#........#..CCC..#.......#",
        "#...3....#......#........#.......#.......#",
        "#........#......#........#..i....#...z...#",
        "#.S.S.S..#S....S#........#S.....S#XX...XX#",
        "#.S.S.S..#S....S#........#####..S#.......#",
        "#........#......#........#k..Q...#...4...#",
        "#........#......#........#.k.#...#......$#",
        "#################WWWEWWWW#################",
      ],
      floorRects: [[17, 4, 26, 11, "h"], [1, 1, 33, 2, "k"], [35, 1, 40, 4, "c"], [1, 4, 8, 11, "c"], [10, 4, 15, 11, "w"], [28, 4, 33, 11, "c"], [35, 6, 40, 11, "c"],
        [1, 19, 8, 30, "w"], [10, 19, 15, 30, "l"], [26, 19, 32, 30, "c"], [34, 19, 40, 30, "w"]],
      decor: [
        [2, 12, "bigSign", "TOY TOWN", "s"], [7, 12, "storefront", "TOY TOWN", "s"], [11, 12, "bigSign", "BOOK NOOK", "s"], [14, 12, "storefront", "BOOK NOOK", "s"],
        [16, 12, "bigSign", "FOOD COURT"], [26, 12, "bigSign", "FOOD COURT", "s"], [28, 12, "bigSign", "SHOE PLANET", "s"], [33, 12, "storefront", "HATS", "s"],
        [35, 12, "bigSign", "PLAY ZONE", "s"], [40, 12, "storefront", "CANDY", "s"],
        [2, 18, "bigSign", "STYLE", "n"], [7, 18, "storefront", "STYLE", "n"], [11, 18, "bigSign", "PHARMACY", "n"], [15, 18, "storefront", "PHARMACY", "n"],
        [26, 18, "bigSign", "GADGET HUB", "n"], [31, 18, "storefront", "GADGET HUB", "n"], [34, 18, "bigSign", "SPORTS", "n"], [39, 18, "storefront", "SPORTS", "n"],
        [16, 20, "storefront", "PRETZELS"], [16, 27, "storefront", "PHONES"], [16, 23, "storefront", "CAFE", "e"], [25, 21, "storefront", "JEWELRY"], [25, 28, "storefront", "ARCADE"],
        [25, 24, "storefront", "PERFUME", "w"], [16, 30, "exitSign", "EXIT", "e"], [25, 30, "exitSign", "EXIT", "w"],
        [0, 6, "poster", "SALE"], [0, 21, "poster", "NEW LOOK"], [9, 22, "firstAid"], [41, 23, "poster", "GAME DAY"], [33, 23, "tvScreen", null, "w"],
        [16, 6, "menuBoard", "TACOS", "e"], [27, 6, "menuBoard", "PIZZA", "w"], [17, 3, "menuBoard", "BURGERS", "s"], [25, 3, "menuBoard", "NOODLES", "s"],
        [34, 1, "roomSign", "SECURITY"], [29, 28, "roomSign", "VAULT", "e"], [20, 3, "roomSign", "KITCHEN", "s"], [22, 3, "roomSign", "KITCHEN", "n"], [10, 0, "graffiti", "DONT RUN"], [0, 2, "pipes"],
        [41, 13, "wallMap", "MALL MAP"], [0, 13, "wallMap", "MALL MAP"], [41, 17, "clock"], [37, 0, "noticeBoard"],
      ],
      scatter: { every: 6, keys: [["crack"], ["poster", "BIG SALE"], ["vent"], ["poster", "OPEN LATE"]] },
      spots: { 2: [12, 14], 3: [35, 30], 4: [21, 10], 5: [13, 11], 6: [17, 23], 7: [23, 29] },
      signs: [[0, 14, "e"], [16, 29, "e"], [41, 14, "w"], [33, 3, "n"]],
      walkerZones: { mainHall: [[1, 13, 40, 17]] },
      landmarks: {
        1: { name: "the rocking horse", art: "rockingHorse", solid: true, size: 0.9, foot: [3, 1] },
        2: { name: "the green dino", art: "playDino", solid: true, size: 0.98, foot: [3, 3] },
        3: { name: "the plastic people", art: "mannequins", solid: true, size: 0.98 },
        4: { name: "the orange tent", art: "tent", solid: true, size: 0.9, foot: [3, 1], color: "#e8761a" },
      },
    },

    /* Public library: the main hall from the doors to the archive at the back, reading
       rooms on both sides (reference with the globe, periodicals with the tall clock), the
       stacks, the children's room (toy castle) and the media room (owl statue). Loops: every
       wing room has two doors. */
    library: {
      palette: { wall: "#7a6a58", shelf: "#6b3f2a", counter: "#5a4535", floor: "#5a4f45", ceiling: "#2b241e", wallStyle: "wood", floorKind: "carpet", ceilingKind: "beams", light: 0.5 },
      grid: [
        "######################################",
        "#$...........#SSSS..SSSS#.........#k.#",
        "#SSSS..SSSS..#..c....c..#SSSS..SSS#.k#",
        "#............#..........#.........#..#",
        "#...1........#....c.....#...z...2.#Q##",
        "#............#####L######............#",
        "#..CCC.......#..........#SSSS..SSSS..#",
        "#..C.n.......#..........#............#",
        "#............D..........D............#",
        "#SSSS..SSSS..#..........#.KK..KK..KK.#",
        "#............#.KK....KK.#............#",
        "#............#.KK....KK.#.KK.KK...KK.#",
        "######D#######....z.....#######D######",
        "#............#.KK....KK.#............#",
        "#SSSSSSSSS...#..........#...SSSSSSSSS#",
        "#..z.........#..........#.....i......#",
        "#SSSSSSSSS..................SSSSSSSSS#",
        "#......i.............................#",
        "#SSSSSSSSS...#......z...#...SSSSSSSSS#",
        "#............#..........#........z...#",
        "#.SSSS.SSSS..#..CCCCCC..#............#",
        "######D#######..........#######D######",
        "#............#..........#............#",
        "#.........z..#..........#.KK..KK..KK.#",
        "#............#..........#............#",
        "#....3.y.....D..........D..........4.#",
        "#........i...#..........#....z.......#",
        "#............#.RR....RR.#.KK..KK..KK.#",
        "#............#$.........#...........$#",
        "#WWWWWWWWWWWW#WWWWEWWWWW#WWWWWWWWWWWW#",
      ],
      floorRects: [[14, 6, 23, 28, "w"], [14, 1, 23, 4, "k"]],
      decor: [
        [0, 13, "bookWall"], [0, 15, "bookWall"], [0, 17, "bookWall"], [0, 19, "bookWall"], [37, 13, "bookWall"], [37, 15, "bookWall"], [37, 17, "bookWall"], [37, 19, "bookWall"], [37, 20, "bookWall"],
        [0, 3, "bookWall"], [0, 10, "bookWall"], [0, 11, "bookWall"], [37, 3, "bookWall"], [37, 5, "bookWall"],
        [13, 7, "roomSign", "REFERENCE", "e"], [24, 7, "roomSign", "PERIODICALS", "w"], [13, 24, "roomSign", "CHILDREN", "e"], [24, 24, "roomSign", "MEDIA", "w"],
        [13, 15, "roomSign", "BOOKS A-M", "e"], [24, 15, "roomSign", "BOOKS N-Z", "w"], [17, 5, "roomSign", "ARCHIVE", "s"], [34, 4, "roomSign", "RARE BOOKS", "s"],
        [15, 5, "bigSign", "LIBRARY", "s"], [21, 5, "bigSign", "QUIET PLEASE", "s"], [13, 20, "mural", "READ", "e"], [24, 20, "mural", "DREAM", "w"],
        [0, 23, "poster", "STORY TIME"], [0, 26, "mural", "FAIRY TALES"], [37, 23, "tvScreen"], [37, 25, "poster", "COMPUTERS"],
        [37, 7, "noticeBoard"], [37, 9, "calendar"], [0, 7, "wallMap", "CITY MAP"], [13, 10, "noticeBoard", "EVENTS", "e"], [24, 10, "clock", null, "w"],
        [13, 28, "exitSign", "EXIT", "e"], [24, 28, "exitSign", "EXIT", "w"], [37, 1, "graffiti", "READ TO LIVE"],
      ],
      scatter: { every: 4, keys: [["bookWall"], ["bookWall"], ["crack"], ["poster", "READ MORE"]] },
      spots: { 2: [31, 4], 3: [14, 13], 4: [23, 14], 5: [11, 27], 6: [21, 28], 7: [29, 8] },
      signs: [[13, 14, "e"], [13, 26, "e"], [24, 26, "w"], [19, 5, "s"]],
      walkerZones: { mainHall: [[14, 6, 23, 28]] },
      landmarks: {
        1: { name: "the giant globe", art: "globe", solid: true, size: 0.98 },
        2: { name: "the tall clock", art: "grandClock", solid: true, size: 0.98 },
        3: { name: "the toy castle", art: "kidsCastle", solid: true, size: 0.98, foot: [3, 3] },
        4: { name: "the owl statue", art: "owlStatue", solid: true, size: 0.85 },
      },
    },
  };

  /* ---------- Expand the authoring shorthand into the contract shape ---------- */
  const WALLISH = "#WSXGDLE"; // full-height tiles: a wall face behind them is never seen
  const SIDES = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
  function expand(L) {
    const g = L.grid;
    const h = g.length;
    const w = g[0].length;
    const at = (x, y) => (y < 0 || y >= h || x < 0 || x >= w ? "#" : g[y][x]);
    const open = (x, y) => Object.keys(SIDES).filter((s) => !WALLISH.includes(at(x + SIDES[s][0], y + SIDES[s][1])));
    if (L.floorRects) {
      const base = Object.keys(FLOOR_KEY).find((k) => FLOOR_KEY[k] === L.palette.floorKind) || "t";
      const rows = g.map((r) => r.split("").map(() => base));
      L.floorRects.forEach(([x0, y0, x1, y1, ch]) => {
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) rows[y][x] = ch;
      });
      L.floors = rows.map((r) => r.join(""));
      L.floorKey = FLOOR_KEY;
      delete L.floorRects;
    }
    const taken = new Set();
    L.decor = (L.decor || []).map(([x, y, tex, text, face]) => {
      taken.add(x + "," + y);
      const sides = open(x, y);
      const d = { x, y, tex };
      if (text) d.text = text;
      if (face || sides.length === 1) d.face = face || sides[0];
      return d;
    });
    (L.signs || []).forEach(([x, y]) => taken.add(x + "," + y)); // the readable wall signs (building.js) keep their tiles
    if (L.scatter) {
      // generic decor on bare walls that face exactly one way, spaced out, picked by a fixed hash
      const { every, keys } = L.scatter;
      const near = (x, y) => [-1, 0, 1].some((dy) => [-1, 0, 1].some((dx) => taken.has(x + dx + "," + (y + dy))));
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (g[y][x] !== "#" || near(x, y)) continue;
          const sides = open(x, y);
          if (sides.length !== 1) continue;
          const hash = ((x * 73856093) ^ (y * 19349663) ^ (w * 83492791)) >>> 0;
          if (hash % every) continue;
          const [tex, text] = keys[(hash >>> 8) % keys.length];
          const d = { x, y, tex, face: sides[0] };
          if (text) d.text = text;
          L.decor.push(d);
          taken.add(x + "," + y);
        }
      }
      delete L.scatter;
    }
  }
  Object.values(LAYOUTS).forEach(expand);

  ZSR.LAYOUTS = LAYOUTS;
  ZSR.LAYOUT_ART = LAYOUT_ART;
  ZSR.LAYOUT_DECOR = LAYOUT_DECOR;
})(typeof globalThis !== "undefined" ? globalThis : this);
