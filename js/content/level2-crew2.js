/* Level 2: the crew's words for the new walker kinds and the wrecked builds (CREW_TIPS tomas lanky, armored,
   wrecked; pip screamer, wreckers; CREW_REPORTS builds, buildsFree: facts in js/story-crew.js).
   A second crew part: it adds to T.crew from level2-crew.js and never replaces it (docs/TEXT_GUIDE.md "Schema"),
   so each crew member's tips merge one by one. */
(function (root) {
  "use strict";
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[2] = root.ZSR.TEXT[2] || { level: 2 });
  T.crew = T.crew || {};
  const tips = (T.crew.tips = T.crew.tips || {});
  tips.tomas = Object.assign(tips.tomas || {}, {
    lanky: "Tomas says some walkers are tall and thin, even thinner than he is. Their long arms reach farther than the others. Keep more space between you and one.",
    armored: "Tomas says some walkers wear helmets and heavy coats. They take a lot more hits to bring down. They are slow, though. Back away and keep shooting.",
    wrecked: "Tomas lists the builds that walkers have wrecked: {rooms}. A wrecked build does nothing at all until it is fixed. Fixing it all costs {cost} scrap.",
  });
  tips.pip = Object.assign(tips.pip || {}, {
    screamer: "Pip says some walkers scream when they spot you. The walkers nearby hear it and speed up for a while. So stop a screamer first, Pip says.",
    wreckers: "Pip says some walkers skip you. They go for the van and the builds. Pip calls them wreckers. Shoot one or get close, and it comes for you.",
  });
  T.crew.reports = Object.assign(T.crew.reports || {}, {
    builds: "Tomas fixed wrecked builds in the yard: {fixed} in all. It took {scrap} scrap from the base. Each one he fixed works again.",
    buildsFree: "Tomas fixed wrecked builds in the yard: {fixed} in all. It cost no scrap at all. Each one he fixed works again.",
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
