/* Story facts for the crew's story quests: five per crew member, each one object to bring home from one
   building (and, for Pip, the dog). Words at six reading levels: js/content/levelN-crew.js.
   Design: docs/CREW.md. Loaded after js/story-crew.js. */
(function (root) {
  "use strict";
  const W = root.ZSR.WORLD;

  W.QUESTS = [];
  W.DOG = { ideas: [], facts: {} };
})(typeof globalThis !== "undefined" ? globalThis : this);
