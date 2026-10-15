/* Level 1: the crew's words for the new walker kinds and the wrecked builds (CREW_TIPS tomas lanky, armored,
   wrecked; pip screamer, wreckers; CREW_REPORTS builds, buildsFree: facts in js/story-crew.js).
   A second crew part: it adds to T.crew from level1-crew.js and never replaces it (docs/TEXT_GUIDE.md "Schema"),
   so each crew member's tips merge one by one. */
(function (root) {
  "use strict";
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[1] = root.ZSR.TEXT[1] || { level: 1 });
  T.crew = T.crew || {};
  const tips = (T.crew.tips = T.crew.tips || {});
  tips.tomas = Object.assign(tips.tomas || {}, {
    lanky: "Tomas says some walkers are tall and thin, like him. Their long arms reach far. Keep more space between you and one.",
    armored: "Tomas says walkers in helmets and heavy coats take many more hits. But they are slow. Back up and keep shooting.",
    wrecked: "Tomas lists the builds walkers wrecked: {rooms}. A wrecked build does nothing until it is fixed. Fixing it all costs {cost} scrap.",
  });
  tips.pip = Object.assign(tips.pip || {}, {
    screamer: "Pip says some walkers scream when they see you. Walkers close by hear it and speed up. Stop a screamer first.",
    wreckers: "Some walkers go for the van and the builds. Pip calls them wreckers. Shoot one, or get close, and it comes for you.",
  });
  T.crew.reports = Object.assign(T.crew.reports || {}, {
    builds: "Tomas fixed wrecked builds in the yard. He fixed {fixed} in all. It took {scrap} scrap from the base.",
    buildsFree: "Tomas fixed wrecked builds in the yard. He fixed {fixed} in all. It cost no scrap at all.",
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
