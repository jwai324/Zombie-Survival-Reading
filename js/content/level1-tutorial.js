/* Reading level 1: June's first-run tutorial. ONE text for every player, whatever the reading level (owner
   decision 2026-10-14, DESIGN.md "Owner decisions: the first-run tutorial"). js/tutorial.js reads
   ZSR.TEXT[1].tutorial and nothing else; Tutorial.CARDS there says which cards exist and what each pictures.
   tests/validate-text.js checkTutorial holds every line to level 1 as ERRORS: whole sentences of at most 9 words
   that end in . or !, no questions, no digits, no place names, each card's keys named as capitals, {next} only in
   vanWait. Card ids are stored in saves (settings.tutorial): never rename or remove one; add new ones at the end. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[1] = root.ZSR.TEXT[1] || { level: 1 });
  T.tutorial = {
    nowTry: "Now you try",
    // a toast when E at the van comes too early: "June: The van has to wait. Next, talk to the crew."
    vanWait: "The van has to wait. Next, {next}.",
    // the labels on the arrow that points at things in the yard (a crew member's arrow shows their name)
    arrow: { van: "Van", computer: "Computer", walker: "Walker" },

    /* ---------- The yard: the van waits for all of it ---------- */
    walk: {
      title: "Walk and look",
      text: "I look after this crew and this cabin. Let me show you the basics first. Press W, A, S and D to walk. Move the mouse to look around. The arrow keys turn you too.",
      try: "Walk a few steps. Then turn and look all around.",
      item: "Walk and look around",
    },
    bag: {
      title: "Your backpack",
      text: "Your backpack holds your notes, keys and medical kits. Press B to open it. Press B again to close it. The backpack button at the top works too.",
      try: "Press B to open your backpack. Press B again to close it.",
      item: "Open the backpack",
    },
    shoot: {
      title: "Stop a walker",
      text: "A walker is coming into the yard. It is slow, but it can still hurt you. Put the cross in the middle on it. Click or press Space to shoot. Keep at it until it goes down.",
      try: "Find the walker. Shoot it until it goes down.",
      bow: "Hold the mouse button down. Let go to shoot.",
      item: "Stop the walker",
    },
    talk: {
      title: "Talk to the crew",
      text: "We all live here at the cabin. Each of us knows useful things. Walk up close to one of us. Look right at them and press E. Press E again when you are done.",
      try: "Walk up to one of us and press E.",
      item: "Talk to the crew",
    },
    computer: {
      title: "The computer",
      text: "The computer is in the office in the cabin. You build new rooms there. Each room needs things from town. Bring them home, and build here. Press E at the computer to use it. Click Step away from the computer.",
      try: "Go to the computer and press E. Then click Step away from the computer.",
      item: "Use the computer",
    },
    ready: {
      title: "Ready to go",
      text: "You know the basics now. Walkers may come to the fence soon. Press P to stop the game at any time. The pause button at the top works too. Walk to the van and press E. Then pick a place on the map.",
      try: "Walk to the van and press E.",
      item: "Head out in the van",
    },

    /* ---------- One card the first time you reach each new screen ---------- */
    map: {
      title: "The town map",
      text: "This is the town map. Click a place to pick it. Read the way there, one step at a time. Then click Drive there. The notes you find show you new places.",
    },
    road: {
      title: "On the road",
      text: "The van drives itself. Press A or D to change lanes. Aim with the mouse. Hold the mouse button down to shoot. Read the sign at each corner. Get in the lane with your arrow. Be in that lane before the white line.",
    },
    door: {
      title: "The door note",
      text: "Someone left a note at this door. Read it before you go in. It tells you what waits inside. Every note you read goes in your backpack.",
    },
    building: {
      title: "Inside a building",
      text: "Walkers may be in here, so be careful. Press E to open doors and read notes. Press M to see a map of this place. The map button at the top works too. Find the way out and press E to leave.",
    },
    lock: {
      title: "A lock",
      text: "This lock needs the right answer. Your notes tell you what to do. Read the note. Do just what it says. A wrong try can cost a lot. If you are not sure, click Step back. Then read your notes in the backpack.",
    },
    river: {
      title: "The river",
      text: "You fish here with a fishing pole. Fish you catch become food at home. Hold the pole, then click to cast. Wait for the float to dip. Then click fast to land the fish. Walkers come out of the trees, so look around. Press E at the van to leave.",
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
