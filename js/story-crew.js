/* Story facts for the crew at home base (June, Tomas, Pip): who they are, where they spend the calm,
   the rules they live by, what they talk about, their live tips and reports, and their errands.
   The words at six reading levels live in js/content/levelN-crew.js. Design: docs/CREW.md.
   Loaded after js/story-home.js. */
(function (root) {
  "use strict";
  const W = root.ZSR.WORLD;

  W.CREW = {};
  W.CREW_RULES = {};
  W.CREW_TALK = {};
  W.CREW_TIPS = {};
  W.CREW_REPORTS = {};
  W.ERRANDS = {};
})(typeof globalThis !== "undefined" ? globalThis : this);
