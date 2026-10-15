/* Level 4: the crew's words for the new walker kinds and the wrecked builds (CREW_TIPS tomas lanky, armored,
   wrecked; pip screamer, wreckers; CREW_REPORTS builds, buildsFree: facts in js/story-crew.js).
   A second crew part: it adds to T.crew from level4-crew.js and never replaces it (docs/TEXT_GUIDE.md "Schema"),
   so each crew member's tips merge one by one. */
(function (root) {
  "use strict";
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[4] = root.ZSR.TEXT[4] || { level: 4 });
  T.crew = T.crew || {};
  const tips = (T.crew.tips = T.crew.tips || {});
  tips.tomas = Object.assign(tips.tomas || {}, {
    lanky: "Tomas says the tall, thin walkers are even lankier than he is, and he would know. Their long arms reach farther than any other walker's. Keep more space between you and one than feels necessary.",
    armored: "Tomas says the walkers in helmets and heavy coats take a lot more hits to bring down. He can hear the shots ring off the metal. They are slow, though, so back away and keep shooting.",
    wrecked: "Tomas has walked the plots and lists the builds that walkers have wrecked: {rooms}. A wrecked build does nothing at all until it is fixed, and fixing it all costs {cost} scrap.",
  });
  tips.pip = Object.assign(tips.pip || {}, {
    screamer: "Pip says some walkers scream the moment they spot you, loud enough to hear across the yard. Every awake walker nearby hears it and speeds up for a while, but sleeping ones sleep on. So stop a screamer first, before the rest come running.",
    wreckers: "Pip has counted every wave and noticed something. Some walkers ignore you and go for the van and the builds. Pip calls them wreckers. Shoot one or get close, and it turns on you instead.",
  });
  T.crew.reports = Object.assign(T.crew.reports || {}, {
    builds: "Tomas spent the quiet fixing wrecked builds in the yard: {fixed} in all. It took {scrap} scrap from the base. Each one he fixed is back to work, and he checked them all twice.",
    buildsFree: "Tomas spent the quiet fixing wrecked builds in the yard: {fixed} in all. It cost no scrap at all. Each one he fixed is back to work, and Tomas looks pleased with himself.",
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
