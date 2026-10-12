/* Screen flow: title -> yard (cabin defense) -> map -> road -> building -> map -> ... -> yard.
   The base save is written only at the yard. Death reloads it. */
(function (root) {
  "use strict";
  const ZSR = root.ZSR;
  const State = ZSR.State;
  const Game = ZSR.Game;
  const Interior = ZSR.Interior;
  const Map = ZSR.Map;
  const Base = ZSR.Base;
  const Backpack = ZSR.Backpack;
  const Audio = ZSR.Audio;
  const W = ZSR.WORLD;

  const $ = (id) => document.getElementById(id);
  const SCREENS = ["screen-title", "screen-settings", "screen-howto", "screen-map", "screen-base", "screen-backpack", "screen-note", "screen-pause", "screen-death", "screen-confirm"];
  const ORDINAL = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th" };
  let settingsReturn = "screen-title";
  let titleRaf = 0;
  let active = null; // "yard" | "road" | "building" | null

  function show(id) {
    SCREENS.forEach((s) => $(s).classList.toggle("hidden", s !== id));
    if (id === "screen-title") startTitleAnimation();
    else cancelAnimationFrame(titleRaf);
  }
  function hideScreens() {
    SCREENS.forEach((s) => $(s).classList.add("hidden"));
    cancelAnimationFrame(titleRaf);
  }
  function showCanvas(which) {
    $("game").classList.toggle("hidden", which !== "road");
    $("fp").classList.toggle("hidden", which !== "fp");
  }
  function confirm(text, onYes) {
    $("confirm-text").textContent = text;
    $("screen-confirm").classList.remove("hidden");
    $("btn-confirm-yes").onclick = () => {
      $("screen-confirm").classList.add("hidden");
      onYes();
    };
    $("btn-confirm-no").onclick = () => $("screen-confirm").classList.add("hidden");
  }

  /* ---------- Settings ---------- */
  function applySettings() {
    document.documentElement.setAttribute("data-size", State.settings.textSize);
    document.querySelectorAll("#grade-seg button").forEach((b) => b.classList.toggle("on", Number(b.dataset.grade) === State.settings.level));
    $("grade-now").textContent = "(now: " + ORDINAL[State.settings.level] + " grade)";
    document.querySelectorAll("#size-seg button").forEach((b) => b.classList.toggle("on", b.dataset.size === State.settings.textSize));
    $("opt-sound").checked = !!State.settings.sound;
    $("opt-aim").checked = !!State.settings.aimAssist;
    $("opt-shake").checked = !!State.settings.shake;
    $("opt-sens").value = State.settings.mouseSens || 1;
    refreshTitle();
  }
  function refreshTitle() {
    $("title-grade").textContent = "Reading level: " + ORDINAL[State.settings.level] + " grade. Change it in Settings.";
    const has = State.hasSave();
    $("btn-continue").classList.toggle("hidden", !has);
    $("btn-play").textContent = has ? "New base (erases the save)" : "New base";
    if (has) {
      const s = State.loadSave();
      $("title-best").textContent = "Saved: day " + s.day + ", base level " + State.baseLevel() + ", " + s.backpack.length + " notes in the backpack.";
    } else $("title-best").textContent = "No save yet.";
  }
  function startTitleAnimation() {
    const c = $("title-van");
    const t0 = performance.now();
    cancelAnimationFrame(titleRaf);
    const loop = () => {
      if ($("screen-title").classList.contains("hidden")) return;
      Game.showcase(c, State.save ? State.save.upgrades : { armor: 2, engine: 1, bumper: 2, paint: 3, damage: 2, fireRate: 0, spread: 1 }, (performance.now() - t0) / 1000);
      titleRaf = requestAnimationFrame(loop);
    };
    loop();
  }
  function renderHowto() {
    const t = ZSR.text();
    const body = $("howto-body");
    body.innerHTML = "";
    const paras = (t && t.howto) || ["You run the last van out of a cabin at the edge of town. Drive to the places on the map, read the notes people left, clear the walkers, bring back what the base needs.", "Inside every building a note tells you how to open the locked room and where to go next. Back at the cabin, build between waves and hold the fence when they come.", "The game saves only at the cabin. If you go down, you are back at your last save."];
    paras.forEach((p) => {
      const e = document.createElement("p");
      e.textContent = p;
      body.appendChild(e);
    });
  }

  /* ---------- Yard (home base) ---------- */
  function goYard(opts) {
    hideScreens();
    active = "yard";
    showCanvas("fp");
    Interior.enterYard(opts);
  }
  const yardHooks = {
    onDoor() {
      Interior.pause();
      Base.open({
        onClose() {
          Interior.refreshYard();
          Interior.resume();
        },
        onChanged() {
          Interior.refreshYard();
        },
      });
    },
    onVan() {
      Interior.leave();
      State.startTrip();
      openMap("base");
    },
    onWaveCleared() {
      State.commit();
    },
  };

  /* ---------- Map and road ---------- */
  function openMap(at) {
    hideScreens();
    showCanvas(null);
    active = null;
    $("map-btn-yard").classList.toggle("hidden", at !== "base");
    show("screen-map");
    Map.show(at);
  }
  function drive(destId) {
    const from = State.trip.at;
    const r = Map.route(from, destId);
    if (!r) return;
    const loc = W.LOCATIONS.find((l) => l.id === destId);
    const secs = Math.round(Math.min(W.SETTINGS.tripMaxSeconds, Math.max(W.SETTINGS.tripMinSeconds, r.dist * W.SETTINGS.tripSecondsPerUnit)));
    hideScreens();
    Map.hide();
    showCanvas("road");
    active = "road";
    Game.startTrip({ to: destId, name: loc.name, seconds: secs, danger: loc.danger });
  }
  function onArrive(destId) {
    State.trip.at = destId;
    showCanvas(null);
    if (destId === "base") {
      const t = State.trip;
      const cargo = Object.values(t.cargo).reduce((a, b) => a + b, 0);
      State.returnHome();
      goYard({ firstCalm: W.DEFENSE.firstCalmSeconds });
      Interior.toast("Home. " + cargo + " item" + (cargo === 1 ? "" : "s") + " unloaded, day " + State.save.day + ". Saved.", 5);
      return;
    }
    const loc = W.LOCATIONS.find((l) => l.id === destId);
    const door = W.NOTES[destId].door;
    hideScreens();
    Backpack.read(destId, door.id, {
      isDoor: true,
      found: door.found,
      primary: "Go in",
      secondary: { label: "Back to the map", action: () => openMap(destId) },
      onClose: () => enterBuilding(loc),
    });
  }
  function enterBuilding(loc) {
    hideScreens();
    showCanvas("fp");
    active = "building";
    Interior.enter(loc);
  }

  /* ---------- Building hooks ---------- */
  const buildingHooks = {
    onReadNote(noteObj, loc) {
      Interior.pause();
      Backpack.read(loc.id, noteObj.id, {
        found: noteObj.found,
        onClose() {
          Interior.noteWasRead(noteObj);
          Interior.resume();
        },
      });
    },
    onExit() {
      Interior.leave();
      openMap(State.trip.at);
    },
  };

  /* ---------- Shared: pause, backpack, death ---------- */
  function pauseActive() {
    if (active === "road" && Game.running && !Game.paused) Game.pause();
    if ((active === "building" || active === "yard") && Interior.running && !Interior.paused) Interior.pause();
  }
  function resumeActive() {
    hideScreens();
    if (active === "road") Game.resume();
    if (active === "building" || active === "yard") Interior.resume();
  }
  function onPause() {
    if (!$("screen-pause").classList.contains("hidden") || !$("screen-note").classList.contains("hidden") || !$("screen-backpack").classList.contains("hidden") || !$("screen-base").classList.contains("hidden")) return;
    pauseActive();
    $("pause-note").textContent = active === "yard" ? "The base is saved after every wave and every build." : "Nothing since your last save at the cabin is kept if you quit.";
    show("screen-pause");
  }
  function onPauseKey() {
    if (!$("screen-pause").classList.contains("hidden")) resumeActive();
    else onPause();
  }
  function onBackpack() {
    if (!$("screen-backpack").classList.contains("hidden")) return;
    pauseActive();
    Backpack.open(() => resumeActive());
  }
  function onDeath() {
    showCanvas(null);
    const t = State.trip;
    const stats = $("death-stats");
    stats.innerHTML = "";
    const items = t ? [[t.walkers, "walkers downed"], [Object.values(t.cargo).reduce((a, b) => a + b, 0), "cargo lost"], [t.notes.length, "notes lost"], [t.scrap, "scrap lost"]] : [[State.save.day, "day"], [State.baseLevel(), "base level"]];
    items.forEach(([v, l]) => {
      const d = document.createElement("div");
      d.className = "stat";
      d.innerHTML = '<span class="v">' + v + '</span><span class="l">' + l + "</span>";
      stats.appendChild(d);
    });
    $("death-text").textContent = active === "yard" ? "The fence gave and the yard filled up. Your last save at the cabin is still there." : active === "road" ? "The van is wrecked on the road. Everything since you left the cabin is gone." : "They got you inside. Everything since you left the cabin is gone.";
    active = null;
    show("screen-death");
  }
  function reload() {
    State.abandonTrip();
    goYard();
  }
  function quitToTitle() {
    Game.stop();
    Interior.leave();
    showCanvas(null);
    State.trip = null;
    active = null;
    show("screen-title");
    refreshTitle();
  }

  /* ---------- Wiring ---------- */
  function wire() {
    $("btn-play").addEventListener("click", () => {
      Audio.unlock();
      Audio.play("click");
      const start = () => {
        State.newGame();
        if (!State.settings.seenHowto) {
          State.settings.seenHowto = true;
          State.saveSettings();
          settingsReturn = "start";
          renderHowto();
          show("screen-howto");
        } else goYard();
      };
      if (State.hasSave()) confirm("Start a new base? The current save (day " + (State.save ? State.save.day : "?") + ") is erased.", start);
      else start();
    });
    $("btn-continue").addEventListener("click", () => {
      Audio.unlock();
      Audio.play("click");
      if (State.loadSave()) goYard();
    });
    $("btn-settings").addEventListener("click", () => {
      settingsReturn = "screen-title";
      show("screen-settings");
    });
    $("btn-howto").addEventListener("click", () => {
      settingsReturn = "screen-title";
      renderHowto();
      show("screen-howto");
    });
    $("btn-howto-back").addEventListener("click", () => {
      Audio.play("click");
      if (settingsReturn === "start") goYard();
      else show(settingsReturn);
    });
    $("btn-settings-back").addEventListener("click", () => {
      Audio.play("click");
      if (settingsReturn === "screen-pause") show("screen-pause");
      else show("screen-title");
    });
    document.querySelectorAll("#grade-seg button").forEach((b) =>
      b.addEventListener("click", () => {
        State.settings.level = Number(b.dataset.grade);
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
    $("opt-sens").addEventListener("input", (e) => {
      State.settings.mouseSens = Number(e.target.value);
      State.saveSettings();
    });

    $("btn-pause").addEventListener("click", onPause);
    $("int-btn-pause").addEventListener("click", onPause);
    $("int-btn-backpack").addEventListener("click", onBackpack);
    $("btn-resume").addEventListener("click", resumeActive);
    $("btn-pause-backpack").addEventListener("click", () => {
      $("screen-pause").classList.add("hidden");
      Backpack.open(() => show("screen-pause"));
    });
    $("btn-pause-settings").addEventListener("click", () => {
      settingsReturn = "screen-pause";
      show("screen-settings");
    });
    $("btn-quit").addEventListener("click", () => {
      if (State.trip) confirm("Quit to the title? Everything since your last save at the cabin is lost.", quitToTitle);
      else quitToTitle();
    });
    $("map-btn-backpack").addEventListener("click", () => Backpack.open());
    $("map-btn-yard").addEventListener("click", () => {
      // back out of a trip before leaving the driveway
      State.trip = null;
      Map.hide();
      goYard({ firstCalm: 30 });
    });
    $("map-btn-home").addEventListener("click", () => confirm("Quit to the title? Everything since your last save at the cabin is lost.", quitToTitle));
    $("btn-reload").addEventListener("click", () => {
      Audio.play("click");
      reload();
    });
    $("btn-death-title").addEventListener("click", () => {
      State.abandonTrip();
      quitToTitle();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    Game.init($("game"), { onArrive, onDeath, onPause, onPauseKey });
    Interior.init($("fp"), {
      onDoor: () => yardHooks.onDoor(),
      onVan: () => yardHooks.onVan(),
      onWaveCleared: () => yardHooks.onWaveCleared(),
      onReadNote: (n, loc) => buildingHooks.onReadNote(n, loc),
      onExit: () => buildingHooks.onExit(),
      onDeath,
      onPause,
      onBackpack,
    });
    Map.init($("map-canvas"), { onDrive: drive });
    wire();
    applySettings();
    show("screen-title");
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
