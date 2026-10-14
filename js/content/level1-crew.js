/* Reading level 1: the crew at home base. Talk, tips, reports, story quests, errands, the dog.
   Facts: js/story-crew.js and js/story-quests.js. See docs/CREW.md and docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[1] = root.ZSR.TEXT[1] || { level: 1 });
  T.crew = T.crew || {};
})(typeof globalThis !== "undefined" ? globalThis : this);
