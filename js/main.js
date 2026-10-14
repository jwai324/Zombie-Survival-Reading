/* Screen flow: title (save slots) -> yard (cabin defense) -> map -> road -> building -> map -> ... -> yard.
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
  const SCREENS = ["screen-title", "screen-newsave", "screen-settings", "screen-howto", "screen-map", "screen-base", "screen-backpack", "screen-note", "screen-pause", "screen-death", "screen-confirm", "screen-wrong"];
  const ORDINAL = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th" };
  let settingsReturn = "screen-title";
  let titleRaf = 0;
  let active = null; // "yard" | "road" | "building" | "river" | null
  const firstPerson = () => active === "building" || active === "yard" || active === "river";
  let pendingSlot = null;

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
  /** Yes/No dialog. opts: caption, yes/no labels, yesDisabled, onNo, onCancel (Esc; falls back to onNo). */
  let confirmCancel = null;
  function confirm(text, onYes, opts) {
    const o = opts || {};
    const close = () => {
      confirmCancel = null;
      $("screen-confirm").classList.add("hidden");
    };
    $("confirm-caption").textContent = o.caption || "Sure?";
    $("confirm-text").textContent = text;
    $("btn-confirm-yes").textContent = o.yes || "Yes";
    $("btn-confirm-no").textContent = o.no || "No";
    $("btn-confirm-yes").disabled = !!o.yesDisabled;
    $("screen-confirm").classList.remove("hidden");
    $("btn-confirm-yes").onclick = () => {
      close();
      onYes();
    };
    $("btn-confirm-no").onclick = () => {
      close();
      if (o.onNo) o.onNo();
    };
    confirmCancel = o.onCancel || o.onNo || null;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

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
    $("settings-for").textContent = whoseSettings();
    refreshTitle();
  }
  // first person needs a keyboard and mouse; on a touch-only device say so instead of leading into a dead end
  const touchOnly = !!(root.matchMedia && root.matchMedia("(pointer: coarse) and (hover: none)").matches);
  /** Each save keeps its own settings; these lines say which save the Settings screen changes. */
  function activeLabel() {
    const slot = State.listSlots().find((x) => x.active && x.save);
    return slot ? slot.label || "Player " + slot.id : null;
  }
  function whoseSettings() {
    const who = activeLabel();
    return who ? "Settings for " + who + ". Each save keeps its own." : "Settings for the next new save. Each save keeps its own.";
  }
  /** The title screen: one row per save slot. Display only; never reloads the save while a trip runs. */
  function refreshTitle() {
    const who = activeLabel();
    $("title-grade").textContent = touchOnly ? "This game needs a keyboard and mouse. Open it on a laptop or desktop." : (who ? who + ": r" : "R") + "eading level " + ORDINAL[State.settings.level] + " grade. Change it in Settings.";
    const list = $("slot-list");
    list.innerHTML = "";
    State.listSlots().forEach((slot) => {
      const row = document.createElement("div");
      row.className = "slot" + (slot.save ? "" : " empty");
      const info = document.createElement("div");
      if (slot.save) {
        const s = slot.save;
        const level = Object.values(s.rooms || {}).reduce((a, b) => a + b, 0);
        info.innerHTML = '<div class="who">' + esc(slot.label || "Player " + slot.id) + '</div><div class="sum">Day ' + s.day + " · base level " + level + " · " + (s.backpack || []).length + " notes · " + (s.scrap || 0) + " scrap · " + ORDINAL[slot.settings.level] + " grade</div>";
      } else info.innerHTML = '<div class="who muted">Slot ' + slot.id + '</div><div class="sum">Empty</div>';
      const acts = document.createElement("div");
      acts.className = "acts";
      if (slot.save) {
        const go = document.createElement("button");
        go.className = "btn go";
        go.textContent = "Continue";
        go.addEventListener("click", () => {
          Audio.unlock();
          Audio.play("click");
          if (!State.loadSave(slot.id)) return;
          applySettings(); // this save's own reading level, text size and the rest
          goYardWithDay(); // an unread day page (closed mid-read) comes first
        });
        const del = document.createElement("button");
        del.className = "btn del";
        del.textContent = "Delete";
        del.addEventListener("click", () => confirm("Delete " + (slot.label || "this save") + "? Day " + slot.save.day + " is gone for good.", () => {
          State.deleteSlot(slot.id);
          applySettings(); // deleting the active save falls back to the shared settings
        }));
        acts.appendChild(go);
        acts.appendChild(del);
      } else {
        const make = document.createElement("button");
        make.className = "btn";
        make.textContent = "New save";
        make.addEventListener("click", () => {
          Audio.unlock();
          Audio.play("click");
          pendingSlot = slot.id;
          $("newsave-name").value = "";
          show("screen-newsave");
          setTimeout(() => $("newsave-name").focus(), 50);
        });
        acts.appendChild(make);
      }
      row.appendChild(info);
      row.appendChild(acts);
      list.appendChild(row);
    });
    if (touchOnly) list.querySelectorAll(".btn").forEach((b) => (b.disabled = true));
  }
  function startNewGame() {
    const name = $("newsave-name").value;
    State.newGame(pendingSlot, name);
    pendingSlot = null;
    applySettings();
    if (!State.settings.seenHowto) {
      State.settings.seenHowto = true;
      State.saveSettings();
      settingsReturn = "start";
      renderHowto();
      show("screen-howto");
    } else goYardWithDay();
  }
  /** Home with today's page first: the recap, June's journal, the radio. Then the yard. */
  function goYardWithDay(opts, after) {
    const log = State.save && State.save.log;
    const entry = log && log.length ? log[log.length - 1] : null;
    if (!entry || entry.read) {
      goYard(opts);
      if (after) after();
      return;
    }
    hideScreens();
    showCanvas(null);
    Backpack.showDay(entry, {
      primary: "Into the yard",
      onClose() {
        State.commit(); // keeps the "read" mark (words read) on the saved day
        goYard(opts);
        if (after) after();
      },
    });
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
  const CONTROLS_FALLBACK = ["Road: aim with the mouse, hold to fire. A and D, the arrow keys or the side buttons change lanes. Your left lane goes straight past side streets and lots. For a lot on the right, use the right lane; for one on the left, the turn lane that opens on the far left. Where roads meet there is one lane per road and yours may turn: match the arrow on the sign and be in that lane before the white stop line.", "Inside and in the yard: W A S D move, the mouse looks, click fires, Shift runs, B opens the backpack, M opens the map of a building, P or Esc pauses.", "E does it all: reads notes, opens and closes doors (the cabin's too), uses keypads, stuck locks, drawers and alarm panels (do exactly what the note says), tries a key at a stash, leaves a building, uses the computer and the things in the cabin, rings the dinner bell, starts the van, and fixes a hole in the fence (1 scrap) or a broken door or window (2 scrap).", "Traps in the yard: T sets a spike trap, R a blast trap, on the ground in front of you or just past the fence.", "Guns: more guns are hidden in buildings around town. Walk over one to pick it up; bring it home to keep it. 1 to 5, Q or the mouse wheel switch guns. Hold to draw the bow, let go to shoot. Mod guns with scrap in the cabin's Weapons tab.", "Fishing: the pole is 6 (or Q). Click to cast at the water, click again when the float dips. Take a gun with the line out and the pole stays propped on the bank; E at it takes it back.", "Backpack: notes you have read, and medical kits. Use a kit to heal to full.", "Workbench: building and upgrading is a short typing round. Type what is on the screen before the timer runs out; out of time just means try again.", "Map: tap a place, then Drive. At a place you can go back inside."];
  function renderHowto() {
    const t = ZSR.text();
    const body = $("howto-body");
    body.innerHTML = "";
    const paras = (t && t.howto) || ["You run the last van out of a cabin at the edge of town. Drive to the places on the map, read the notes people left, clear the walkers, bring back what the base needs.", "Inside every building a note tells you how to open the locked room and where to go next. Do exactly what it says: a wrong code sets off an alarm, a wrong drawer can be a trap, and a wrong move jams the lock (a crowbar from the workbench pries it open). Back at the cabin, build at the computer between waves and hold the fence when they come.", "The game saves only at the cabin. If you go down, you are back at your last save."];
    paras.forEach((p) => {
      const e = document.createElement("p");
      e.textContent = p;
      body.appendChild(e);
    });
    // the controls list is in-world text too: it comes at the reading level, keys shown as <kbd>
    const list = $("howto-controls");
    list.innerHTML = "";
    ((t && t.controls) || CONTROLS_FALLBACK).forEach((line) => {
      const li = document.createElement("li");
      const parts = String(line).split(":");
      const head = parts.length > 1 ? parts.shift() : null;
      if (head) {
        const b = document.createElement("strong");
        b.textContent = head + ":";
        li.appendChild(b);
      }
      const rest = parts.join(":");
      // single capital letters and known key names become key caps
      rest.split(/(\b(?:W|A|S|D|E|B|M|P|T|R|Q|Esc|Shift)\b)/).forEach((piece, i) => {
        if (i % 2) {
          const k = document.createElement("kbd");
          k.textContent = piece;
          li.appendChild(k);
        } else li.appendChild(document.createTextNode(piece));
      });
      list.appendChild(li);
    });
  }

  /* ---------- Yard (home base) ---------- */
  function goYard(opts) {
    hideScreens();
    active = "yard";
    showCanvas("fp");
    Interior.enterYard(opts);
  }
  /** Copy the yard's fence and traps into the save and write it. Never in the middle of a wave:
      a wave is saved only once it is cleared, so dying in it reloads the state before it began. */
  function syncYard() {
    if (Interior.mode !== "yard" || !State.save) return;
    if (Interior.phase && Interior.phase.kind === "wave") return;
    State.save.fence = Interior.fenceState();
    State.save.yardTraps = Interior.traps.filter((t) => t.uses > 0).map((t) => ({ x: t.x, y: t.y, type: t.type, uses: t.uses }));
    State.save.house.hp = Interior.houseState();
    State.commit();
  }
  const yardHooks = {
    /** The office computer in the cabin: the build menu. The yard waits while it is open. */
    onComputer() {
      Interior.pause();
      Base.open({
        onClose() {
          Interior.refreshYard();
          Interior.resume();
        },
        onChanged(key) {
          Interior.refreshYard({ rebuildFence: key === "walls" });
          if (key === "walls" || key === "doors" || key === "windows") syncYard();
        },
        fenceHoles: () => Interior.fenceHoles().length,
        onRepairFence() {
          const n = Interior.repairAllHoles();
          syncYard();
          return n;
        },
        houseDamage: () => Interior.houseDamage(),
        onRepairHouse() {
          const n = Interior.repairHouse();
          syncYard();
          return n;
        },
      });
    },
    /** The radio shelf in the living room: June's journal and the radio, every day so far. */
    onJournal() {
      Interior.pause();
      Backpack.openDays(() => Interior.resume());
    },
    /** The typewriter in the play room: a free typing round. */
    onPractice() {
      Interior.pause();
      Base.practice(() => Interior.resume());
    },
    onVan() {
      syncYard();
      const depart = () => {
        Interior.leave();
        State.startTrip();
        openMap("base");
      };
      const max = State.vanMaxHp();
      if (State.save.vanHp >= max) return depart();
      const hp = Math.floor(State.save.vanHp);
      // the van is hurt: offer a full repair before the trip starts
      Interior.pause();
      const cost = State.repairCost();
      const scrap = State.save.scrap;
      const short = scrap < cost;
      const price = cost ? cost + " scrap" : "free";
      confirm(
        "The van has " + hp + " of " + max + " health. " + (short ? "A full fix costs " + cost + " scrap. You have " + scrap + "." : "Fix it before you go? Cost: " + price + ". You have " + scrap + " scrap."),
        () => {
          if (State.repairVan()) Audio.play("buy");
          depart();
        },
        {
          caption: "Fix the van?",
          yes: short ? "Not enough scrap" : "Fix it (" + price + ")",
          yesDisabled: short,
          no: "Go as is",
          onNo: depart,
          onCancel: () => Interior.resume(), // Esc: stay in the yard
        }
      );
    },
    onWaveCleared() {
      syncYard();
    },
    onYardChanged() {
      syncYard();
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
    if (!State.trip) return goYard();
    const from = State.trip.at;
    const r = Map.route(from, destId);
    if (!r) return;
    const loc = W.LOCATIONS.find((l) => l.id === destId);
    const secs = Math.round(Math.min(W.SETTINGS.tripMaxSeconds, Math.max(W.SETTINGS.tripMinSeconds, r.dist * W.SETTINGS.tripSecondsPerUnit)));
    hideScreens();
    Map.hide();
    showCanvas("road");
    active = "road";
    // the road follows the route the map showed; a wrong turn asks what next (onWrongTurn)
    Game.startTrip({ to: destId, name: loc.name, seconds: secs, danger: loc.danger, path: r.path });
  }
  /** A wrong turn on the road: try the drive again, open the town map, or go back where the van set out. */
  function onWrongTurn(info) {
    const St = ZSR.Streets;
    $("wrong-caption").textContent = St.text("wrongTitle");
    $("wrong-text").textContent = info.msg;
    const retry = $("btn-wrong-retry");
    retry.textContent = St.text("tryAgain");
    $("btn-wrong-map").textContent = St.text("townMap");
    $("btn-wrong-back").textContent = St.text("goBack", { origin: info.originName });
    retry.onclick = () => {
      Audio.play("click");
      hideScreens();
      Game.retry();
    };
    $("btn-wrong-map").onclick = () => {
      Audio.play("click");
      Game.stop();
      openMap(State.trip.at);
    };
    $("btn-wrong-back").onclick = () => {
      Audio.play("click");
      Game.stop();
      // out of the cabin's own driveway nothing is lost or gained: the trip never left (as the map's yard button)
      if (info.origin === "base") backToYard();
      else onArrive(info.origin);
    };
    show("screen-wrong");
    retry.focus();
  }
  /** Back out of a trip that has not reached any place yet: no day passes. */
  function backToYard() {
    State.trip = null;
    Map.hide();
    goYard({ firstCalm: 30 });
  }
  function onArrive(destId) {
    if (!State.trip) return goYard();
    State.trip.at = destId;
    showCanvas(null);
    if (destId === "base") {
      const t = State.trip;
      const cargo = Object.values(t.cargo).reduce((a, b) => a + b, 0);
      State.returnHome();
      goYardWithDay({ firstCalm: W.DEFENSE.firstCalmSeconds }, () => Interior.toast("Home. " + cargo + " item" + (cargo === 1 ? "" : "s") + " unloaded. Day " + State.save.day + ". Saved.", 4));
      return;
    }
    const dest = W.LOCATIONS.find((l) => l.id === destId);
    if (dest.outdoor) return enterRiver(dest); // River Landing: no door, no note, just out of the van
    // back at a place already entered this trip: straight in, as you left it
    if (State.trip.rooms && State.trip.rooms[destId]) enterBuilding(dest);
    else showDoor(destId);
  }
  /** The note at the door; parked outside until the player goes in or drives off. */
  function showDoor(destId) {
    const loc = W.LOCATIONS.find((l) => l.id === destId);
    const door = W.NOTES[destId].door;
    State.trip.atDoor = destId;
    hideScreens();
    Backpack.read(destId, door.id, {
      isDoor: true,
      found: door.found,
      primary: "Go in",
      secondary: { label: "Back to the map", action: () => openMap(destId) },
      onClose: () => enterBuilding(loc),
    });
  }
  /** From the map, at a place: straight back in once the door note has been read. */
  function reenter(destId) {
    if (!State.trip) return goYard();
    const loc = W.LOCATIONS.find((l) => l.id === destId);
    if (!loc || destId === "base") return;
    if (loc.outdoor) return enterRiver(loc);
    if (State.noteRead(W.NOTES[destId].door.id)) enterBuilding(loc);
    else showDoor(destId);
  }
  function enterBuilding(loc) {
    State.trip.atDoor = null;
    hideScreens();
    showCanvas("fp");
    active = "building";
    Interior.enter(loc);
  }
  /** River Landing: out of the van on the dirt turnout, the dock and the river ahead. */
  function enterRiver(loc) {
    State.trip.atDoor = null;
    hideScreens();
    showCanvas("fp");
    active = "river";
    Interior.enterRiver(loc);
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
      if (!State.trip) return goYard();
      openMap(State.trip.at);
    },
  };

  /* ---------- Shared: pause, backpack, death ---------- */
  function overlayOpen() {
    return ["screen-pause", "screen-note", "screen-backpack", "screen-base", "screen-bench", "screen-confirm", "screen-wrong", "screen-lock"].some((id) => $(id) && !$(id).classList.contains("hidden"));
  }
  function pauseActive() {
    if (active === "road" && Game.running && !Game.paused) Game.pause();
    if (firstPerson() && Interior.running && !Interior.paused) Interior.pause();
  }
  function resumeActive() {
    hideScreens();
    if (active === "road") Game.resume();
    if (firstPerson()) Interior.resume();
  }
  function onPause() {
    if (overlayOpen()) return;
    pauseActive();
    $("pause-note").textContent = active === "yard" ? "The base is saved after every wave, build and repair." : "Nothing since your last save at the cabin is kept if you quit.";
    show("screen-pause");
  }
  function onPauseKey() {
    if (!$("screen-confirm").classList.contains("hidden")) {
      $("screen-confirm").classList.add("hidden"); // Esc answers "No", or cancels when the dialog says how
      const cancel = confirmCancel;
      confirmCancel = null;
      if (cancel) cancel();
      return;
    }
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
    const reason = active !== "yard" && active !== "road" && Interior.deathReason;
    Interior.deathReason = null;
    $("death-text").textContent = reason ? reason + " Everything since you left the cabin is gone." : active === "yard" ? "The fence gave and the yard filled up. Your last save at the cabin is still there." : active === "road" ? "The van is wrecked on the road. Everything since you left the cabin is gone." : active === "river" ? "They got you down by the river. Everything since you left the cabin is gone." : "They got you inside. Everything since you left the cabin is gone.";
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
    State.loadSave(); // resync memory to the disk save; drops the trip and any uncommitted yard scrap
    active = null;
    show("screen-title");
    refreshTitle();
  }

  /* ---------- Full screen ---------- */
  // The top-left button shows only while the page is not full screen, and never where the
  // browser cannot go full screen (iPhone Safari).
  const fsCan = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || (root.matchMedia && root.matchMedia("(display-mode: fullscreen)").matches));
  }
  function syncFullscreen() {
    const show = fsCan && !isFullscreen();
    $("btn-fullscreen").classList.toggle("hidden", !show);
    document.documentElement.classList.toggle("fs-btn", show);
  }
  function enterFullscreen() {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req) return;
    const p = req.call(el);
    if (p && p.catch) p.catch(() => {}); // refused (not from a click, or blocked by the page's host): the button stays
  }

  /* ---------- Wiring ---------- */
  function wire() {
    $("btn-fullscreen").addEventListener("click", (e) => {
      e.currentTarget.blur(); // so Space and Enter in the game never press it again
      Audio.play("click");
      enterFullscreen();
    });
    ["fullscreenchange", "webkitfullscreenchange"].forEach((ev) => document.addEventListener(ev, syncFullscreen));
    root.addEventListener("resize", syncFullscreen); // F11 full screen fires no fullscreenchange
    syncFullscreen();
    $("btn-newsave-start").addEventListener("click", () => {
      Audio.play("click");
      startNewGame();
    });
    $("newsave-name").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        startNewGame();
      }
    });
    $("btn-newsave-back").addEventListener("click", () => {
      pendingSlot = null;
      show("screen-title");
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
      if (settingsReturn === "start") goYardWithDay();
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
    $("btn-pause-howto").addEventListener("click", () => {
      settingsReturn = "screen-pause";
      renderHowto();
      show("screen-howto");
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
    $("map-btn-yard").addEventListener("click", backToYard); // back out of a trip before leaving the driveway
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
    Game.init($("game"), { onArrive, onWrongTurn, onDeath, onPause, onPauseKey });
    Interior.init($("fp"), {
      onComputer: () => yardHooks.onComputer(),
      onJournal: () => yardHooks.onJournal(),
      onPractice: () => yardHooks.onPractice(),
      onVan: () => yardHooks.onVan(),
      onWaveCleared: () => yardHooks.onWaveCleared(),
      onYardChanged: () => yardHooks.onYardChanged(),
      onReadNote: (n, loc) => buildingHooks.onReadNote(n, loc),
      onExit: () => buildingHooks.onExit(),
      onDeath,
      onPause,
      onPauseKey,
      onBackpack,
    });
    Map.init($("map-canvas"), { onDrive: drive, onEnter: reenter });
    if (ZSR.Typing && ZSR.Typing.init) ZSR.Typing.init();
    wire();
    State.loadSave();
    applySettings();
    show("screen-title");
  });

  ZSR.Main = { syncYard };
})(typeof globalThis !== "undefined" ? globalThis : this);
