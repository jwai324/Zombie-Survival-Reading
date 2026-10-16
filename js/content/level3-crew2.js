/* Level 3: the crew's words for the new walker kinds and the wrecked builds (CREW_TIPS tomas lanky, armored,
   wrecked; pip screamer, wreckers; CREW_REPORTS builds, buildsFree: facts in js/story-crew.js).
   A second crew part: it adds to T.crew from level3-crew.js and never replaces it (docs/TEXT_GUIDE.md "Schema"),
   so each crew member's tips merge one by one. */
(function (root) {
  "use strict";
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[3] = root.ZSR.TEXT[3] || { level: 3 });
  T.crew = T.crew || {};
  const tips = (T.crew.tips = T.crew.tips || {});
  tips.tomas = Object.assign(tips.tomas || {}, {
    lanky: "Tomas says the tall, thin walkers are even lankier than he is. He does not love that. Their long arms reach farther than the others. Keep more space between you and one.",
    armored: "Tomas says some walkers wear helmets and heavy coats. They take a lot more hits to bring down. The good news is that they are slow, so back away and keep shooting.",
    wrecked: "Tomas lists the builds that walkers have wrecked: {rooms}. A wrecked build does nothing until it is fixed. Fixing it all costs {cost} scrap.",
  });
  tips.pip = Object.assign(tips.pip || {}, {
    screamer: "Pip says some walkers scream the moment they spot you. Every awake walker nearby hears it and speeds up for a while. Sleeping ones sleep right through it. So Pip says to stop a screamer first.",
    wreckers: "Pip has counted every wave. Some walkers go for the van and the builds instead of you. Pip calls them wreckers. Shoot one or get close, and it turns on you.",
  });
  T.crew.reports = Object.assign(T.crew.reports || {}, {
    builds: "Tomas fixed wrecked builds in the yard while it was quiet: {fixed} in all. It took {scrap} scrap from the base, and each one he fixed works again.",
    buildsFree: "Tomas fixed wrecked builds in the yard while it was quiet: {fixed} in all. It cost no scrap at all, and each one he fixed works again.",
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
