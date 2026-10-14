/* The crew's save state, mixed into ZSR.State: trust, talk, requests (story quests and errands),
   rewards and perks, reports of their work, the dog, and the crew's words at the reading level.
   Facts: js/story-crew.js and js/story-quests.js. Design: docs/CREW.md. Loaded after js/state.js. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
})(typeof globalThis !== "undefined" ? globalThis : this);
