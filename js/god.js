/* God mode: the owner's test sandbox. Type !godmode anywhere (title, yard, road, building, map, a menu) and the
   god menu opens; type it again any time to reopen it, or click the GOD MODE badge. Esc closes the menu.
   Nothing is saved while god mode is on (js/state.js: write() does nothing, commit() keeps the sandbox in memory,
   a death reloads the sandbox). Exit god mode (or quit to the title) and the real save comes back from disk.
   The menu: Travel (reveal every place; go to any place at its door or straight inside; drive from any place to
   any place), Guns (own, hold, mod), Items (any count; unlimited), Crew (the day, trust stars, offer or jump to
   any story quest), Cheats (can't die, hold the calm, start a wave, clear walkers, spawn a walker of any kind in
   front of you, heal), Sandbox (start over, exit). Every list comes from the data (LOCATIONS, WEAPONS, MODS, ITEMS,
   CREW, QUESTS, WALKER_TYPES), so it grows with them.
   Owner decisions: DESIGN.md, "God mode". Loaded after js/main.js; ZSR.God.act runs without a page (tests). */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const S = () => ZSR.State;
  const W = () => ZSR.WORLD;
  const Main = () => (ZSR.Main && ZSR.Main.god) || null;

  const PHRASE = "!godmode";
  const KEY_GAP_MS = 3000; // longest pause between two keys of the phrase
  const TOP_UP = 999; // what "unlimited" and "fill everything" set scrap and every item to

  /* ---------- The sandbox's actions (no page needed) ---------- */
  const Act = {
    /** Every place known on the map. Returns how many were added. */
    revealAll() {
      const s = S().save;
      const add = W().LOCATIONS.map((l) => l.id).filter((id) => !s.known.includes(id));
      s.known.push(...add);
      S().commit();
      return add.length;
    },
    /** Own a gun or not (the pistol always stays). */
    setOwned(id, own) {
      const wp = S().save.weapons;
      if (!ZSR.Weapons.WEAPONS[id] || id === "pistol") return false;
      wp.owned = wp.owned.filter((w) => w !== id);
      if (own) wp.owned.push(id);
      if (!own && wp.equipped === id) wp.equipped = "pistol";
      S().commit();
      return true;
    },
    equip(id) {
      const ok = S().equipWeapon(id);
      if (ok) S().commit();
      return ok;
    },
    setMod(id, key, level) {
      const mods = S().save.weapons.mods[id];
      if (!mods || !(key in mods)) return false;
      mods[key] = Math.max(0, Math.min(ZSR.Weapons.MOD_MAX, Math.round(Number(level) || 0)));
      S().commit();
      return true;
    },
    /** Every gun owned, every mod at its top tier. */
    allGuns() {
      const wp = S().save.weapons;
      ZSR.Weapons.ORDER.forEach((id) => {
        if (!wp.owned.includes(id)) wp.owned.push(id);
        Object.keys(wp.mods[id] || {}).forEach((k) => (wp.mods[id][k] = ZSR.Weapons.MOD_MAX));
      });
      S().commit();
    },
    /** The counts the Items tab edits: scrap, food, medical kits packed, crowbars, then every other item. */
    countKeys() {
      return ["scrap", "food", "kits", "crowbars"].concat(Object.keys(W().ITEMS).filter((k) => k !== "food"));
    },
    count(key) {
      const s = S().save;
      if (key === "scrap" || key === "food" || key === "kits" || key === "crowbars") return s[key] || 0;
      return s.inventory[key] || 0;
    },
    setCount(key, n) {
      const s = S().save;
      let v = Math.max(0, Math.round(Number(n) || 0));
      if (key === "kits") v = Math.min(v, W().SETTINGS.kitsMax);
      if (key === "scrap" || key === "food" || key === "kits" || key === "crowbars") s[key] = v;
      else if (W().ITEMS[key]) s.inventory[key] = v;
      else return false;
      S().commit();
      return true;
    },
    /** Scrap and every item at TOP_UP, kits at the most the backpack carries. */
    fillAll() {
      const s = S().save;
      s.scrap = Math.max(s.scrap || 0, TOP_UP);
      s.food = Math.max(s.food || 0, TOP_UP);
      s.crowbars = Math.max(s.crowbars || 0, TOP_UP);
      s.kits = W().SETTINGS.kitsMax;
      Object.keys(W().ITEMS).forEach((k) => k !== "food" && (s.inventory[k] = Math.max(s.inventory[k] || 0, TOP_UP)));
    },
    /** Unlimited: everything filled now and topped up again on every save (after every build). */
    setUnlimited(on) {
      const g = S().god;
      g.cheats.unlimited = !!on;
      g.onCommit = on ? () => Act.fillAll() : null;
      S().commit();
    },
    setDay(n) {
      S().save.day = Math.max(1, Math.round(Number(n) || 1));
      S().commit();
    },
    /** Trust set to exactly this many stars (CREW_RULES.stars). */
    setStars(id, n) {
      const stars = (W().CREW_RULES && W().CREW_RULES.stars) || [];
      const k = Math.max(0, Math.min(stars.length, Math.round(Number(n) || 0)));
      S().crewSave().trust[id] = k ? stars[k - 1] : 0;
      S().commit();
    },
    quest(qid) {
      return (W().QUESTS || []).find((q) => q && q.id === qid) || null;
    },
    /** Forget a story quest (not accepted again), and the trip's hold on its object. */
    resetQuest(qid) {
      const q = this.quest(qid);
      if (!q) return false;
      delete S().crewSave().quests[qid];
      const t = S().trip;
      if (t) {
        t.quest = (t.quest || []).filter((x) => x !== qid);
        if (t.dogQuest === qid) {
          t.dog = false;
          t.dogQuest = null;
        }
      }
      S().commit();
      return true;
    },
    /** The giver offers this quest the next time you talk to them, whatever its gates (crewstate.js offer). */
    offerQuest(qid) {
      const q = this.quest(qid);
      if (!q) return false;
      this.resetQuest(qid);
      S().reveal([q.at]);
      S().god.offer[q.giver] = qid;
      S().commit();
      return true;
    },
    /** The quest accepted (its object waits on its spot) and its place known. */
    activateQuest(qid) {
      const q = this.quest(qid);
      if (!q) return false;
      this.resetQuest(qid);
      S().reveal([q.at]);
      S().crewSave().quests[qid] = { state: "active", day: S().save.day, doneDay: null };
      S().commit();
      return true;
    },
    setCheat(name, on) {
      S().god.cheats[name] = !!on;
    },
  };

  /* ---------- The scene underneath ---------- */
  const Scene = {
    /** The gun in hand again from the save (after a gun or mod change). */
    refreshGun() {
      const I = ZSR.Interior;
      if (!I || !I.running || !I.player || !I.gun) return;
      const id = S().hasWeapon(I.gun.id) ? I.gun.id : S().equippedWeapon();
      I.gun = S().weaponStats(id);
      I.updateHud();
    },
    hud() {
      const I = ZSR.Interior;
      if (I && I.running && I.player) I.updateHud();
    },
    inYard() {
      const I = ZSR.Interior;
      return !!(I && I.running && I.mode === "yard" && I.phase);
    },
    /** Out of the calm into a wave now (as the dinner bell, without the wait). */
    startWave() {
      if (!this.inYard()) return "Only in the yard.";
      const ph = ZSR.Interior.phase;
      if (ph.kind !== "calm") return "A wave is already on.";
      if (ZSR.Interior.yardHold) return "June's tutorial holds the calm until its yard steps are done.";
      ph.t = 0;
      ph.forced = true;
      return "Here they come.";
    },
    clearWalkers() {
      const I = ZSR.Interior;
      if (!I || !I.running || !I.walkers) return "Only in the yard or a building.";
      const n = I.walkers.length;
      I.walkers.length = 0;
      if (I.fallen) I.fallen.length = 0; // the downed ones and the blood go too
      if (I.blood) I.blood.length = 0;
      // a wave still spawning ends now: it clears on the next frame, as if fought off
      if (I.mode === "yard" && I.phase && I.phase.kind === "wave") I.phase.spawned = I.phase.total;
      I.updateHud();
      return n + " walker" + (n === 1 ? "" : "s") + " gone.";
    },
    /** One awake walker of `type` (a WORLD.WALKER_TYPES id) in front of you: on foot (the yard, a building, the
        river) or on the road ahead of the van. It is a plain attacker (no raid, no wrecking). Says what happened. */
    spawnWalker(type) {
      const T = W().WALKER_TYPES[type];
      if (!T) return "No walker kind " + type + ".";
      const name = T.name.toLowerCase();
      const a = /^[aeiou]/.test(name) ? "An " : "A "; // an armored, a lanky
      const G = ZSR.Game;
      if (G && G.running && G.zombies) {
        // the road's contract (as Interior's): spawnWalkerAhead(type) places that kind on screen, ahead of the van,
        // and returns it. A road without it cannot place a kind (its spawnZombie picks one at random): not asked
        const z = typeof G.spawnWalkerAhead === "function" ? G.spawnWalkerAhead(type) : null;
        return z && z.type === type ? a + name + " on the road ahead." : "The road cannot place " + a.toLowerCase() + name + " yet.";
      }
      const I = ZSR.Interior;
      if (!I || !I.running || !I.player || !I.walkers || !I.spawnWalkerAhead) return "Only in the yard, a building, the river or on the road.";
      return I.spawnWalkerAhead(type) ? a + name + " in front of you." : "No room in front of you: turn to open ground.";
    },
    heal() {
      const I = ZSR.Interior;
      const t = S().trip;
      let did = false;
      if (I && I.running && I.player) did = I.heal() || did;
      if (t && t.vanMaxHp) {
        t.vanHp = t.vanMaxHp;
        did = true;
      }
      if (!t) {
        S().save.vanHp = S().vanMaxHp();
        S().commit();
        did = true;
      }
      return did ? "Healed." : "Nothing to heal.";
    },
    /** Stand the player a step from this tile, facing it (a story object or the dog). */
    placeNear(spot) {
      const I = ZSR.Interior;
      if (!I || !I.player || !Array.isArray(spot)) return false;
      const tx = spot[0] + 0.5;
      const ty = spot[1] + 0.5;
      for (const r of [1.5, 2, 1.1, 2.5, 3]) {
        for (let k = 0; k < 8; k++) {
          const x = tx + Math.cos((k * Math.PI) / 4) * r;
          const y = ty + Math.sin((k * Math.PI) / 4) * r;
          if (I.solidForPlayer(x, y) || (I.lineClear && !I.lineClear(x, y, tx, ty))) continue;
          I.player.x = x;
          I.player.y = y;
          I.player.a = Math.atan2(ty - y, tx - x);
          return true;
        }
      }
      return false;
    },
  };

  /* ---------- The menu ---------- */
  let el = null; // the menu's section
  let badge = null;
  let open = false;
  let tab = "travel";
  let msg = "";
  let held = {}; // what the menu paused: { game, interior }
  let started = ""; // what the sandbox started from, for the Sandbox tab
  let spawnKind = null; // the Cheats tab's "Spawn walker" kind (a WALKER_TYPES id), kept while the tab is rebuilt

  /** A small element builder: h("button", { class: "btn", onclick }, "Go"). */
  function h(tag, attrs, kids) {
    const e = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k in e && k !== "list") e[k] = v;
      else e.setAttribute(k, v === true ? "" : v);
    });
    (Array.isArray(kids) ? kids : kids == null ? [] : [kids]).forEach((c) => c != null && e.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return e;
  }
  const btn = (label, onclick, cls) => h("button", { class: "btn" + (cls ? " " + cls : ""), onclick }, label);
  const placeName = (id) => (W().LOCATIONS.find((l) => l.id === id) || { name: id }).name;
  function placeSelect(id, withBase) {
    return h("select", { id }, W().LOCATIONS.filter((l) => withBase || l.id !== "base").map((l) => h("option", { value: l.id }, l.name + (S().isKnown(l.id) ? "" : " (not known)"))));
  }
  function questTitle(q) {
    try {
      const t = ZSR.crewFill(ZSR.crewText("quest", q.id, "title")).trim();
      if (t) return t;
    } catch (e) {
      /* a missing text: the object's name below */
    }
    return (q.object && q.object.name) || q.id;
  }
  function say(text) {
    msg = text || "";
    render();
  }
  /** Go somewhere (ZSR.Main.god.go) and close the menu on the new scene. */
  function go(where, after) {
    const M = Main();
    if (!M) return say("The game is not ready yet.");
    if (ZSR.Locks && ZSR.Locks.isOpen()) return say("A lock prompt is open: close the menu (Esc), Esc out of the lock, then try again.");
    held = {};
    const ok = M.go(where);
    if (ok && after) after();
    close();
    if (!ok) openMenu("That trip could not start (no road between those two places). Pick again.");
  }

  function build() {
    if (el || typeof document === "undefined" || !document.body) return;
    el = h("section", { id: "screen-god", class: "screen overlay hidden" }, h("div", { class: "panel god-panel", id: "god-panel" }));
    document.body.appendChild(el);
    badge = h("button", { id: "god-badge", class: "btn hidden", title: "God mode is on: nothing is saved. Click for the god menu.", onclick: () => openMenu() }, "God mode");
    document.body.appendChild(badge);
  }

  function render() {
    if (!el) return;
    const panel = el.querySelector("#god-panel");
    panel.innerHTML = "";
    panel.appendChild(h("div", { class: "caption" }, "God mode"));
    if (!S().god) return renderStart(panel);
    panel.appendChild(h("p", { class: "god-sub" }, "Nothing is saved. " + started + " Day " + S().save.day + "."));
    const TABS = [["travel", "Travel"], ["guns", "Guns"], ["items", "Items"], ["crew", "Crew"], ["cheats", "Cheats"], ["sandbox", "Sandbox"]];
    panel.appendChild(h("div", { class: "god-tabs" }, TABS.map(([k, label]) => btn(label, () => ((tab = k), say("")), k === tab ? "on" : "alt"))));
    if (msg) panel.appendChild(h("p", { class: "god-msg" }, msg));
    const body = h("div", { class: "god-body" });
    ({ travel: renderTravel, guns: renderGuns, items: renderItems, crew: renderCrew, cheats: renderCheats, sandbox: renderSandbox })[tab](body);
    panel.appendChild(body);
    panel.appendChild(h("div", { class: "btn-row" }, [btn("Exit god mode", exitGod, "alt"), btn("Back to the game", close, "go")]));
  }

  function renderStart(panel) {
    const s = S().save;
    panel.appendChild(h("p", { class: "tagline" }, "A sandbox for testing: go anywhere, get any gun, item or quest. Nothing you do in it is saved. Your real save is not touched."));
    if (msg) panel.appendChild(h("p", { class: "god-msg" }, msg));
    const copy = btn(s ? "Copy my save (" + (s.label || "Player") + ", day " + s.day + ")" : "Copy my save (none loaded)", () => begin(false), "big");
    copy.disabled = !s;
    panel.appendChild(h("div", { class: "btn-row god-start" }, [copy, btn("Fresh game (day 1)", () => begin(true), "big go"), btn("Cancel", close, "alt")]));
  }
  function begin(fresh) {
    const M = Main();
    if (!M) return say("The game is not ready yet.");
    if (ZSR.Locks && ZSR.Locks.isOpen()) return say("A lock prompt is open: close the menu (Esc), Esc out of the lock, then try again.");
    const label = S().save && S().save.label;
    held = {};
    if (!M.begin(fresh)) return say("Could not start.");
    started = fresh || !label ? "Started fresh." : "Started from a copy of " + label + ".";
    tab = "travel";
    msg = "";
    sync();
    close();
  }
  function exitGod() {
    const M = Main();
    if (ZSR.Locks && ZSR.Locks.isOpen()) return say("A lock prompt is open: close the menu (Esc), Esc out of the lock, then try again.");
    held = {};
    close();
    if (M) M.exit();
    sync();
  }

  function renderTravel(body) {
    const known = W().LOCATIONS.filter((l) => S().isKnown(l.id)).length;
    body.appendChild(h("h3", {}, "The map"));
    body.appendChild(h("div", { class: "god-row" }, [h("span", {}, known + " of " + W().LOCATIONS.length + " places known."), btn("Reveal every place", () => say(Act.revealAll() + " places revealed."))]));
    body.appendChild(h("h3", {}, "Go to a place"));
    body.appendChild(h("p", { class: "god-note" }, "Each trip starts fresh from the sandbox's base. At the door shows the door note first."));
    body.appendChild(h("div", { class: "god-row" }, [placeSelect("god-place", false), btn("At the door", () => go({ kind: "jump", to: val("god-place") })), btn("Straight inside", () => go({ kind: "inside", to: val("god-place") }), "go")]));
    body.appendChild(h("div", { class: "god-row" }, [btn("The yard (home)", () => go({ kind: "yard" }), "go")]));
    body.appendChild(h("h3", {}, "Drive"));
    const from = placeSelect("god-from", true);
    const to = placeSelect("god-to", true);
    body.appendChild(h("div", { class: "god-row" }, [h("label", {}, ["From ", from]), h("label", {}, ["to ", to]), btn("Drive", () => (val("god-from") === val("god-to") ? say("Pick two different places.") : go({ kind: "drive", from: val("god-from"), to: val("god-to") })), "go")]));
    if (W().LOCATIONS[1]) to.value = W().LOCATIONS[1].id;
  }
  const val = (id) => {
    const e = document.getElementById(id);
    return e ? e.value : null;
  };

  function renderGuns(body) {
    const Wp = ZSR.Weapons;
    const wp = S().save.weapons;
    body.appendChild(h("div", { class: "god-row" }, [btn("Every gun, every mod maxed", () => (Act.allGuns(), Scene.refreshGun(), say("All guns, all mods.")), "go")]));
    body.appendChild(h("p", { class: "god-note" }, "Changes take hold at once. In hand: the gun you start with in each new scene."));
    Wp.ORDER.forEach((id) => {
      const w = Wp.WEAPONS[id];
      const own = h("input", { type: "checkbox", checked: wp.owned.includes(id), disabled: id === "pistol", onchange: (e) => (Act.setOwned(id, e.target.checked), Scene.refreshGun(), render()) });
      const hand = h("input", { type: "radio", name: "god-equip", checked: wp.equipped === id, disabled: !wp.owned.includes(id), onchange: () => (Act.equip(id), Scene.refreshGun(), render()) });
      const mods = Object.keys(Wp.MODS).map((k) => {
        const names = id === "bow" && Wp.BOW_MODS && Wp.BOW_MODS[k] ? Wp.BOW_MODS[k].name : Wp.MODS[k].name;
        const sel = h("select", { onchange: (e) => (Act.setMod(id, k, e.target.value), Scene.refreshGun()) }, Array.from({ length: Wp.MOD_MAX + 1 }, (_, n) => h("option", { value: n }, String(n))));
        sel.value = String((wp.mods[id] || {})[k] || 0);
        return h("label", { class: "god-mod" }, [names + " ", sel]);
      });
      body.appendChild(h("div", { class: "god-card" }, [h("div", { class: "god-row" }, [h("strong", {}, w.name), h("label", {}, [own, " Have it"]), h("label", {}, [hand, " In hand"])]), h("div", { class: "god-row" }, mods)]));
    });
  }

  function renderItems(body) {
    const unl = h("input", { type: "checkbox", checked: S().cheat("unlimited"), onchange: (e) => (Act.setUnlimited(e.target.checked), Scene.hud(), render()) });
    body.appendChild(h("div", { class: "god-row" }, [btn("Fill everything", () => (Act.fillAll(), S().commit(), Scene.hud(), say("Filled to " + TOP_UP + ".")), "go"), h("label", {}, [unl, " Unlimited: topped up to " + TOP_UP + " after every build"])]));
    body.appendChild(h("p", { class: "god-note" }, "Base storage. Things picked up on a trip still ride in the van until you get home."));
    const LABEL = { scrap: "Scrap", food: "Food", kits: "Medical kits packed (max " + W().SETTINGS.kitsMax + ")", crowbars: "Crowbars" };
    const grid = h("div", { class: "god-grid" });
    Act.countKeys().forEach((k) => {
      const input = h("input", { type: "number", min: 0, value: Act.count(k), onchange: (e) => (Act.setCount(k, e.target.value), Scene.hud(), (e.target.value = Act.count(k))) });
      grid.appendChild(h("label", {}, [h("span", {}, LABEL[k] || W().ITEMS[k].name), input]));
    });
    body.appendChild(grid);
  }

  function renderCrew(body) {
    const day = h("input", { type: "number", min: 1, value: S().save.day, onchange: (e) => (Act.setDay(e.target.value), render()) });
    body.appendChild(h("div", { class: "god-row" }, [h("label", {}, ["Day ", day]), h("span", { class: "god-note" }, "Quests and topics open by day and stars.")]));
    body.appendChild(h("p", { class: "god-note" }, "Offer now: go to the yard and talk to them (E). Jump to it: the quest is accepted and you stand by its object."));
    const stars = (W().CREW_RULES && W().CREW_RULES.stars) || [];
    S().crewIds().forEach((id) => {
      const sel = h("select", { onchange: (e) => (Act.setStars(id, e.target.value), render()) }, Array.from({ length: stars.length + 1 }, (_, n) => h("option", { value: n }, n + " star" + (n === 1 ? "" : "s"))));
      sel.value = String(S().stars(id));
      const card = h("div", { class: "god-card" }, h("div", { class: "god-row" }, [h("strong", {}, ZSR.crewName(id)), h("label", {}, ["Trust ", sel])]));
      (W().QUESTS || [])
        .filter((q) => q && q.giver === id)
        .forEach((q) => {
          const st = S().questState(q.id) || (S().god.offer[id] === q.id ? "offered" : "not taken");
          card.appendChild(
            h("div", { class: "god-row god-quest" }, [
              h("span", {}, [h("strong", {}, q.id), " " + questTitle(q) + " · " + placeName(q.at) + " · ", h("em", {}, st)]),
              btn("Offer now", () => (Act.offerQuest(q.id), say(ZSR.crewName(id) + " will ask for " + q.id + " when you talk to them in the yard."))),
              // accepted first: the building lays out the objects of accepted quests as you walk in
              btn("Jump to it", () => (Act.activateQuest(q.id), go({ kind: "inside", to: q.at }, () => Scene.placeNear(q.spot))), "go"),
              btn("Reset", () => (Act.resetQuest(q.id), say(q.id + " is not taken now.")), "alt"),
            ])
          );
        });
      body.appendChild(card);
    });
  }

  function renderCheats(body) {
    const tog = (name, label) => h("label", { class: "god-tog" }, [h("input", { type: "checkbox", checked: S().cheat(name), onchange: (e) => (Act.setCheat(name, e.target.checked), render()) }), " " + label]);
    body.appendChild(tog("noDie", "Can't die: walkers, booby traps and crashes do no harm to you, the van, the fence or the cabin"));
    body.appendChild(tog("holdCalm", "Hold the calm: no wave comes in the yard until this is off (Start a wave still works)"));
    body.appendChild(h("div", { class: "god-row" }, [btn("Start a wave now", () => say(Scene.startWave()), "go"), btn("Clear all walkers", () => say(Scene.clearWalkers())), btn("Heal to full", () => say(Scene.heal()))]));
    // one walker of any kind, from the facts (WALKER_TYPES), in front of you
    // (the kind picked is kept: say() rebuilds this tab, and Spawn again spawns the same kind)
    const kinds = walkerTypes();
    if (!kinds.includes(spawnKind)) spawnKind = kinds[0];
    const kind = h("select", { onchange: (e) => (spawnKind = e.target.value) }, kinds.map((id) => h("option", { value: id, selected: id === spawnKind }, W().WALKER_TYPES[id].name)));
    kind.value = spawnKind;
    body.appendChild(h("div", { class: "god-row" }, [h("label", {}, ["Spawn walker: ", kind]), btn("Spawn in front of you", () => say(Scene.spawnWalker(spawnKind)), "go")]));
    body.appendChild(h("p", { class: "god-note" }, "Wave and walker buttons act on the scene under this menu: close it to see them."));
  }

  function renderSandbox(body) {
    body.appendChild(h("p", {}, "Start over drops this sandbox and starts a new one. Exit god mode goes to the title with your real save as you left it. Refreshing the page also ends god mode."));
    const copy = btn("Start over: copy of my real save", () => {
      // the copy is of the save on disk, never of this sandbox
      const real = S().peekSave();
      if (!real) return say("There is no real save to copy.");
      exitGod();
      begin(false);
    });
    body.appendChild(h("div", { class: "btn-row god-start" }, [copy, btn("Start over: fresh game", () => begin(true), "go")]));
  }

  /* ---------- Open, close, the badge ---------- */
  function openMenu(note) {
    build();
    if (!el) return;
    if (!open) {
      const G = ZSR.Game;
      const I = ZSR.Interior;
      held = { game: !!(G && G.running && !G.paused), interior: !!(I && I.running && !I.paused) };
      if (held.game) G.pause();
      if (held.interior) I.pause();
    }
    open = true;
    msg = note || "";
    el.classList.remove("hidden");
    render();
  }
  function close() {
    if (!el) return;
    open = false;
    el.classList.add("hidden");
    const G = ZSR.Game;
    const I = ZSR.Interior;
    if (held.game && G && G.running) G.resume();
    if (held.interior && I && I.running) I.resume();
    held = {};
  }
  /** Show the badge while god mode is on; redraw the menu if it is open. */
  function sync() {
    build();
    if (badge) badge.classList.toggle("hidden", !S().god);
    if (!S().god) started = "";
    if (open) render();
  }

  /* ---------- The phrase ---------- */
  // On the window, capturing, and added before every other key handler (they are added on page load or later),
  // so it sees each key first. Once "!" has started the phrase, its next letters stop here: the game never takes
  // the g, d, m and e as moves, the building map or E. While the menu is open the game gets no keys at all;
  // the menu's own boxes still take typing (only the propagation stops, never the key's default).
  let typed = "";
  let lastKey = 0;
  function onKey(e) {
    if (open) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
      e.stopImmediatePropagation();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || !e.key || e.key.length !== 1) return; // Shift alone keeps the phrase going
    const now = Date.now();
    if (now - lastKey > KEY_GAP_MS) typed = "";
    lastKey = now;
    const k = e.key.toLowerCase();
    typed = PHRASE.startsWith(typed + k) ? typed + k : PHRASE.startsWith(k) ? k : "";
    if (typed.length > 1) e.stopImmediatePropagation();
    if (typed === PHRASE) {
      typed = "";
      e.preventDefault();
      openMenu();
    }
  }
  if (root.addEventListener) root.addEventListener("keydown", onKey, true);

  /** Every walker kind god mode can spawn: the facts' ids, in their order. */
  function walkerTypes() {
    return Object.keys(W().WALKER_TYPES || {});
  }

  ZSR.God = { act: Act, scene: Scene, open: openMenu, close, sync, isOpen: () => open, walkerTypes, PHRASE };
})(typeof globalThis !== "undefined" ? globalThis : this);
