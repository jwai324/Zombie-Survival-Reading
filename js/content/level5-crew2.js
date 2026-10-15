/* Level 5: the crew's words for the new walker kinds and the wrecked builds (CREW_TIPS tomas lanky, armored,
   wrecked; pip screamer, wreckers; CREW_REPORTS builds, buildsFree: facts in js/story-crew.js).
   A second crew part: it adds to T.crew from level5-crew.js and never replaces it (docs/TEXT_GUIDE.md "Schema"),
   so each crew member's tips merge one by one. */
(function (root) {
  "use strict";
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[5] = root.ZSR.TEXT[5] || { level: 5 });
  T.crew = T.crew || {};
  const tips = (T.crew.tips = T.crew.tips || {});
  tips.tomas = Object.assign(tips.tomas || {}, {
    lanky: "Tomas says the tall, thin walkers are even lankier than he is, which is saying something. Their long arms reach farther than any other walker's. Give one more room than you think it needs, and never let it close the gap.",
    armored: "Tomas says the walkers in helmets and heavy coats take a lot more hits to bring down. He swears he can hear the shots ring off the metal. They are slow, though, so back away, keep your distance, and keep shooting.",
    wrecked: "Tomas has walked the plots with a frown and lists the builds that walkers have wrecked: {rooms}. A wrecked build does nothing at all until it is fixed, he says, and fixing it all costs {cost} scrap.",
  });
  tips.pip = Object.assign(tips.pip || {}, {
    screamer: "Pip says some walkers let out a scream the moment they spot you, and the sound carries a long way. Every awake walker nearby hears it and speeds up for a while, though sleeping ones sleep right through it. So stop a screamer first, before the others come running at you.",
    wreckers: "Pip has counted every wave and noticed a pattern: some walkers ignore you completely and go for the van and the builds. Pip calls them wreckers. Shoot one, or just get close, and it forgets the builds and turns on you instead.",
  });
  T.crew.reports = Object.assign(T.crew.reports || {}, {
    builds: "Tomas spent the quiet putting wrecked builds in the yard back together: {fixed} in all. It took {scrap} scrap from the base. Each one he fixed is doing its job again, he says, and he would like the walkers to leave them alone.",
    buildsFree: "Tomas spent the quiet putting wrecked builds in the yard back together: {fixed} in all. It cost no scrap at all. Each one he fixed is doing its job again, he says, with real satisfaction.",
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
