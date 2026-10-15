/* Level 6: the crew's words for the new walker kinds and the wrecked builds (CREW_TIPS tomas lanky, armored,
   wrecked; pip screamer, wreckers; CREW_REPORTS builds, buildsFree: facts in js/story-crew.js).
   A second crew part: it adds to T.crew from level6-crew.js and never replaces it (docs/TEXT_GUIDE.md "Schema"),
   so each crew member's tips merge one by one. */
(function (root) {
  "use strict";
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[6] = root.ZSR.TEXT[6] || { level: 6 });
  T.crew = T.crew || {};
  const tips = (T.crew.tips = T.crew.tips || {});
  tips.tomas = Object.assign(tips.tomas || {}, {
    lanky: "Tomas, who has been called lanky more times than he can count, says the tall, thin walkers are even lankier than he is. Their long arms reach farther than any other walker's, he warns, so leave more space between you and one than your instincts suggest. Do not let it close the distance.",
    armored: "Tomas says the walkers in helmets and heavy coats, riot gear and firefighter gear by the look of it, take a lot more hits to bring down. He swears he can hear the shots ring off the metal. They are slow, though, he adds, so back away, keep your distance and keep shooting until one stays down.",
    wrecked: "Tomas has walked every plot with a grim face and lists the builds that walkers have wrecked: {rooms}. A wrecked build does nothing at all until it is fixed, he explains, so for now it is only a pile of boards. Fixing it all costs {cost} scrap.",
  });
  tips.pip = Object.assign(tips.pip || {}, {
    screamer: "Pip says some walkers let out a scream the moment they spot you, a sound that carries a long way and is hard to forget. Every walker nearby takes it as a signal and speeds up for a while, so stop a screamer first, before the rest of them come running.",
    wreckers: "Pip has counted every wave and noticed a pattern worth knowing. Some walkers ignore you entirely and go for the van and the builds, as if they know what you worked for. Pip calls them wreckers. Shoot one, or simply get close, and it abandons the builds and turns on you instead.",
  });
  T.crew.reports = Object.assign(T.crew.reports || {}, {
    builds: "Tomas spent the quiet hours putting the wrecked builds in the yard back together: {fixed} in all. It took {scrap} scrap from the base. Each one he fixed is doing its job again, he reports, though he would very much like the walkers to find another hobby.",
    buildsFree: "Tomas spent the quiet hours putting the wrecked builds in the yard back together: {fixed} in all. It cost no scrap at all, which he considers the best kind of repair. Each one he fixed is doing its job again.",
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
