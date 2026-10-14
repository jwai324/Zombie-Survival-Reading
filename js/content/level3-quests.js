/* Reading level 3: the crew's story quests and errands (T.crew.quests, T.crew.errands). The talk, tips,
   reports and the dog are in level3-crew.js. Facts: js/story-quests.js and js/story-crew.js (ERRANDS).
   See docs/CREW.md and docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[3] = root.ZSR.TEXT[3] || { level: 3 });
  T.crew = T.crew || {};
  T.crew.quests = Object.assign(T.crew.quests || {}, {});
  T.crew.errands = Object.assign(T.crew.errands || {}, {});
})(typeof globalThis !== "undefined" ? globalThis : this);
