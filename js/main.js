/* Screen flow: title -> road -> (sign) -> haven -> road -> ... -> game over. */
(function (root) {
  "use strict";
  const ZSR = root.ZSR;
  const State = ZSR.State;
  const Game = ZSR.Game;
  const Haven = ZSR.Haven;
  const Audio = ZSR.Audio;

  const $ = (id) => document.getElementById(id);
  const SCREENS = ["screen-title", "screen-settings", "screen-howto", "screen-sign", "screen-haven", "screen-pause", "screen-gameover"];
  let settingsReturn = "screen-title";
  let titleRaf = 0;

  function show(id) {
    SCREENS.forEach((s) => $(s).classList.toggle("hidden", s !== id));
    if (id === "screen-title") startTitleAnimation();
    else cancelAnimationFrame(titleRaf);
  }
  function hideAll() {
    SCREENS.forEach((s) => $(s).classList.add("hidden"));
    cancelAnimationFrame(titleRaf);
  }

  const ORDINAL = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th" };

  function applySettings() {
    document.documentElement.setAttribute("data-size", State.settings.textSize);
    document.querySelectorAll("#grade-seg button").forEach((b) => b.classList.toggle("on", Number(b.dataset.grade) === State.settings.grade));
    document.querySelectorAll("#size-seg button").forEach((b) => b.classList.toggle("on", b.dataset.size === State.settings.textSize));
    $("opt-sound").checked = !!State.settings.sound;
    $("opt-aim").checked = !!State.settings.aimAssist;
    $("opt-shake").checked = !!State.settings.shake;
    refreshTitle();
  }

  function refreshTitle() {
    const g = State.settings.grade;
    $("title-grade").textContent = "Reading level: " + ORDINAL[g] + " grade. Change it in Settings.";
    const best = State.best[g];
    $("title-best").textContent = best ? "Best run at this level: " + best.miles + " miles, " + best.havens + " havens, " + best.correct + " questions right." : "No runs at this level yet.";
    $("btn-continue").classList.toggle("hidden", !State.hasCheckpoint());
  }

  function startTitleAnimation() {
    const c = $("title-van");
    const t0 = performance.now();
    cancelAnimationFrame(titleRaf);
    const loop = () => {
      if ($("screen-title").classList.contains("hidden")) return;
      Game.showcase(c, { armor: 2, engine: 1, bumper: 2, paint: 3, damage: 2, fireRate: 0, spread: 1 }, (performance.now() - t0) / 1000);
      titleRaf = requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Flow ---------- */
  function startRoad() {
    hideAll();
    Game.startSegment();
  }

  function newRun() {
    State.newRun();
    startRoad();
  }

  function continueRun() {
    if (!State.loadCheckpoint()) return newRun();
    startRoad();
  }

  function onSegmentEnd() {
    const run = State.run;
    run.segment += 1;
    show("screen-haven");
    Haven.start(() => startRoad());
  }

  function onSign() {
    show("screen-sign");
    Haven.sign(() => {
      hideAll();
      Game.resume();
    });
  }

  function onGameOver() {
    const result = State.finishRun();
    const run = result ? result.entry : { miles: 0, kills: 0, correct: 0, havens: 0 };
    const stats = $("gameover-stats");
    stats.innerHTML = "";
    const items = [
      [run.miles.toFixed ? run.miles.toFixed(1) : run.miles, "miles"],
      [run.havens, "havens"],
      [run.kills, "downed"],
      [run.correct, "right answers"],
    ];
    items.forEach(([v, l]) => {
      const d = document.createElement("div");
      d.className = "stat";
      d.innerHTML = '<span class="v">' + v + '</span><span class="l">' + l + "</span>";
      stats.appendChild(d);
    });
    $("gameover-best").textContent = result && result.isBest ? "New best run at this reading level." : result && result.prev ? "Best at this level: " + result.prev.miles + " miles." : "";
    show("screen-gameover");
    refreshTitle();
  }

  function pauseGame() {
    if (!Game.running || Game.paused) return;
    Game.pause();
    show("screen-pause");
  }
  function resumeGame() {
    hideAll();
    Game.resume();
  }

  /**
   * Back to the home screen from anywhere. From a haven the current run is
   * checkpointed first (scrap and answers earned there are kept); from the
   * road, the save from the last haven stands.
   */
  function goHome(saveNow) {
    Audio.play("click");
    Game.stop();
    Haven.leave();
    if (saveNow && State.run) State.checkpoint();
    State.run = null;
    show("screen-title");
    refreshTitle();
  }

  /* ---------- Wiring ---------- */
  function wire() {
    $("btn-play").addEventListener("click", () => {
      Audio.unlock();
      Audio.play("click");
      if (!State.settings.seenHowto) {
        State.settings.seenHowto = true;
        State.saveSettings();
        settingsReturn = "play";
        show("screen-howto");
      } else newRun();
    });
    $("btn-continue").addEventListener("click", () => {
      Audio.unlock();
      Audio.play("click");
      continueRun();
    });
    $("btn-settings").addEventListener("click", () => {
      settingsReturn = "screen-title";
      show("screen-settings");
    });
    $("btn-howto").addEventListener("click", () => {
      settingsReturn = "screen-title";
      show("screen-howto");
    });
    $("btn-howto-back").addEventListener("click", () => {
      Audio.play("click");
      if (settingsReturn === "play") newRun();
      else show(settingsReturn);
    });
    $("btn-settings-back").addEventListener("click", () => {
      Audio.play("click");
      if (settingsReturn === "screen-pause") show("screen-pause");
      else show("screen-title");
    });

    document.querySelectorAll("#grade-seg button").forEach((b) =>
      b.addEventListener("click", () => {
        State.settings.grade = Number(b.dataset.grade);
        State.saveSettings();
        applySettings();
      })
    );
    document.querySelectorAll("#size-seg button").forEach((b) =>
      b.addEventListener("click", () => {
        State.settings.textSize = b.dataset.size;
        State.saveSettings();
        applySettings();
      })
    );
    const bindToggle = (id, key) =>
      $(id).addEventListener("change", (e) => {
        State.settings[key] = e.target.checked;
        State.saveSettings();
      });
    bindToggle("opt-sound", "sound");
    bindToggle("opt-aim", "aimAssist");
    bindToggle("opt-shake", "shake");

    $("btn-pause").addEventListener("click", pauseGame);
    $("btn-resume").addEventListener("click", resumeGame);
    $("btn-pause-settings").addEventListener("click", () => {
      settingsReturn = "screen-pause";
      show("screen-settings");
    });
    // Home from the road or the pause menu keeps the last haven's save.
    $("btn-quit").addEventListener("click", () => goHome(false));
    $("btn-home").addEventListener("click", () => goHome(false));
    $("btn-sign-home").addEventListener("click", () => goHome(false));
    // Home from a haven saves what was earned there first.
    $("btn-haven-home").addEventListener("click", () => goHome(true));

    $("btn-again").addEventListener("click", () => {
      Audio.play("click");
      newRun();
    });
    $("btn-gameover-title").addEventListener("click", () => show("screen-title"));

  }

  /** P or Esc toggles the pause screen (but never closes the sign or settings). */
  function onPauseKey() {
    if (!Game.paused) pauseGame();
    else if (!$("screen-pause").classList.contains("hidden")) resumeGame();
  }

  document.addEventListener("DOMContentLoaded", () => {
    Game.init($("game"), { onSegmentEnd, onSign, onGameOver, onPause: pauseGame, onPauseKey });
    wire();
    applySettings();
    show("screen-title");
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
