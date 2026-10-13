/* The cabin build menu: rooms, garage, weapons, traps, inventory, fence repair. Opens from the
   cabin door in the yard; the yard is paused while it is open. Building, upgrading and
   crafting go through the workbench (a typing round); repairs are instant. Every action
   commits the base save. Hovering any option shows a description. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const W = () => ZSR.WORLD;
  const U = () => ZSR.Upgrades;

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const itemName = (k) => (W().ITEMS[k] ? W().ITEMS[k].name : k);
  const needsText = (needs, scrap) => Object.entries(needs).map(([k, n]) => n + " " + itemName(k)).concat(scrap ? [scrap + " scrap"] : []).join(", ");

  /* ---------- Hover tips: one floating box, filled from data-tip on the element ---------- */
  const Tip = {
    el: null,
    init() {
      this.el = document.getElementById("tip");
      if (!this.el || this.bound) return;
      this.bound = true;
      document.addEventListener("mouseover", (e) => {
        const t = e.target.closest && e.target.closest("[data-tip]");
        if (t) this.show(t);
        else this.hide();
      });
      document.addEventListener("mousemove", (e) => {
        if (this.target) this.place(e.clientX, e.clientY);
      });
      document.addEventListener("mouseout", (e) => {
        const t = e.target.closest && e.target.closest("[data-tip]");
        if (t && t === this.target && !(e.relatedTarget && t.contains(e.relatedTarget))) this.hide();
      });
      document.addEventListener("click", () => this.hide(), true);
    },
    show(target) {
      if (!this.el) return;
      this.target = target;
      this.el.innerHTML = target.dataset.tip;
      this.el.classList.remove("hidden");
    },
    place(x, y) {
      const e = this.el;
      const w = e.offsetWidth;
      const h = e.offsetHeight;
      let left = x + 16;
      let top = y + 18;
      if (left + w > root.innerWidth - 8) left = Math.max(8, x - w - 12);
      if (top + h > root.innerHeight - 8) top = Math.max(8, y - h - 12);
      e.style.left = left + "px";
      e.style.top = top + "px";
    },
    hide() {
      this.target = null;
      if (this.el) this.el.classList.add("hidden");
    },
  };
  const tip = (node, html) => {
    node.setAttribute("data-tip", html);
    return node;
  };

  const Base = {
    hooks: {},
    tab: "rooms",

    open(hooks) {
      this.hooks = hooks || this.hooks;
      Tip.init();
      document.getElementById("screen-base").classList.remove("hidden");
      this.render();
    },
    close() {
      Tip.hide();
      document.getElementById("screen-base").classList.add("hidden");
      if (this.hooks.onClose) this.hooks.onClose();
    },

    /** Everything that is built or made goes through the workbench: a typing round first, then `apply`. */
    craft(title, costText, apply) {
      const S = State();
      const T = ZSR.Typing;
      if (!T || !T.open) {
        // no workbench module loaded: build directly so the game is never stuck
        if (apply()) {
          ZSR.Audio.play("buy");
          this.render();
        }
        return;
      }
      Tip.hide();
      const typing = S.save.typing || { stage: 0, tutorialSeen: false };
      let built = false;
      T.open({
        title,
        cost: costText,
        stage: typing.stage,
        tutorialSeen: !!typing.tutorialSeen,
        upgrades: S.save.upgrades,
        onLessonDone: () => {
          // the finger lesson is read once; the Finger guide button brings it back on demand
          S.save.typing.tutorialSeen = true;
          S.commit();
        },
        onSuccess: (result) => {
          if (apply()) {
            built = true;
            S.typingDone(result);
            ZSR.Audio.play("buy");
          }
        },
        onClose: () => {
          this.render();
        },
      });
      return built;
    },

    render() {
      const S = State();
      const s = S.save;
      const t = ZSR.text();
      const body = document.getElementById("base-body");
      body.innerHTML = "";

      // header
      const head = el("div", "base-head");
      head.appendChild(tip(el("div", "stat", '<span class="v">' + s.day + '</span><span class="l">day</span>'), "<strong>Day " + s.day + "</strong><span class='t-line'>A day passes every time you drive home. Items you took come back after " + W().SETTINGS.restockDays + " days.</span>"));
      head.appendChild(tip(el("div", "stat", '<span class="v">' + s.scrap + '</span><span class="l">scrap</span>'), "<strong>Scrap</strong><span class='t-line'>The money of the Fall. Walkers drop it, piles hold it. Rooms, upgrades, traps and fence repairs all cost scrap.</span>"));
      head.appendChild(tip(el("div", "stat" + (s.food <= 0 ? " bad" : ""), '<span class="v">' + s.food + '</span><span class="l">food</span>'), "<strong>Food</strong><span class='t-line'>Every trip eats 1. At 0 the crew is hungry and the van is weaker. The Garden and the Farm grow food each day.</span>"));
      head.appendChild(tip(el("div", "stat", '<span class="v">' + Math.round(s.vanHp) + "/" + S.vanMaxHp() + '</span><span class="l">van</span>'), "<strong>Van health</strong><span class='t-line'>Repair it in the Garage tab. Armor plating and the Walls room raise the maximum.</span>"));
      head.appendChild(tip(el("div", "stat", '<span class="v">' + S.baseLevel() + "/" + S.maxBaseLevel() + '</span><span class="l">base level</span>'), "<strong>Base level</strong><span class='t-line'>All room levels added up. " + Object.keys(W().BASE_ROOMS).length + " rooms, 3 levels each.</span>"));
      body.appendChild(head);
      if (t && t.base && t.base.intro) body.appendChild(el("p", "base-intro", esc(t.base.intro)));
      if (s.food <= 0) body.appendChild(el("p", "warn", "No food. The crew is hungry: the van starts the next trip weaker. Bring food crates home or grow some."));

      // tabs
      const tabs = el("div", "tabs");
      const TABS = [["rooms", "Rooms", "Build the cabin's rooms with items plus scrap. Each build is a typing round at the workbench."], ["garage", "Garage", "Van and van-gun upgrades, and van repair. Upgrades are typing rounds; repairs are instant."], ["weapons", "Weapons", "The guns you carry on foot. Pick one, and mod it with scrap: damage, range, fire rate, accuracy."], ["traps", "Traps", "Craft traps at the workbench, then set them in the yard with T and R."], ["inventory", "Cargo & stock", "Everything in storage, and what the next builds still need."]];
      TABS.forEach(([k, label, hint]) => {
        const b = tip(el("button", "tab" + (this.tab === k ? " on" : ""), label), "<strong>" + label + "</strong><span class='t-line'>" + hint + "</span>");
        b.addEventListener("click", () => {
          this.tab = k;
          ZSR.Audio.play("click");
          this.render();
        });
        tabs.appendChild(b);
      });
      body.appendChild(tabs);

      if (this.tab === "rooms") body.appendChild(this.rooms());
      else if (this.tab === "garage") body.appendChild(this.garage());
      else if (this.tab === "weapons") body.appendChild(this.weapons());
      else if (this.tab === "traps") body.appendChild(this.traps());
      else body.appendChild(this.inventory());

      const row = el("div", "btn-row");
      const back = tip(el("button", "btn big", "Back to the yard"), "Close the menu and go back outside. The yard was paused while you were in here.");
      back.addEventListener("click", () => {
        ZSR.Audio.play("click");
        this.close();
      });
      const pack = tip(el("button", "btn alt", "Backpack"), "Your notes and medical kits. Pack kits from storage here at the cabin.");
      pack.addEventListener("click", () => ZSR.Backpack.open(() => this.render()));
      row.appendChild(back);
      row.appendChild(pack);
      body.appendChild(row);
    },

    /** The fence line: how many holes, fix them all for scrap. */
    fenceRow() {
      const S = State();
      const holes = this.hooks.fenceHoles ? this.hooks.fenceHoles() : 0;
      const cost = holes * W().SETTINGS.fenceRepairScrap;
      const row = el("div", "fence-row" + (holes ? " bad" : ""));
      row.appendChild(el("span", "stock", holes ? "Fence: " + holes + " hole" + (holes > 1 ? "s" : "") : "Fence: whole"));
      if (holes) {
        const b = tip(el("button", "btn" + (S.save.scrap >= cost ? " go" : ""), "Fix all for " + cost + " scrap"), "<strong>Fix the fence</strong><span class='t-line'>" + W().SETTINGS.fenceRepairScrap + " scrap per hole. Holes never close on their own. You can also stand at a gap in the yard and press E.</span>");
        b.disabled = S.save.scrap < W().SETTINGS.fenceRepairScrap;
        b.addEventListener("click", () => {
          if (this.hooks.onRepairFence) this.hooks.onRepairFence();
          this.render();
        });
        row.appendChild(b);
        row.appendChild(el("span", "small muted", "Or press E at a gap outside."));
      } else row.appendChild(el("span", "small muted", "Walkers claw through it during waves. Every hole costs " + W().SETTINGS.fenceRepairScrap + " scrap to rebuild."));
      return row;
    },

    rooms() {
      const S = State();
      const s = S.save;
      const t = ZSR.text();
      const wrap = el("div");
      wrap.appendChild(this.fenceRow());
      const grid = el("div", "rooms");
      Object.entries(W().BASE_ROOMS).forEach(([key, room]) => {
        const lvl = s.rooms[key];
        const txt = t && t.base && t.base.rooms && t.base.rooms[key];
        const card = el("div", "room" + (lvl >= 3 ? " maxed" : ""));
        const head = el("div", "room-head");
        head.appendChild(el("h3", null, esc(room.name)));
        const pips = el("div", "pips");
        for (let i = 0; i < 3; i++) pips.appendChild(el("span", "pip" + (i < lvl ? " on" : "")));
        head.appendChild(pips);
        card.appendChild(head);
        card.appendChild(el("p", "room-desc", esc(txt ? txt.desc : room.name)));
        const can = S.canUpgradeRoom(key);
        const nextText = txt && txt.next ? txt.next[lvl] : "Level " + (lvl + 1);
        const tipHtml = "<strong>" + esc(room.name) + " · level " + lvl + " of 3</strong><span class='t-line'>" + esc(txt ? txt.desc : "") + "</span>" + (can.maxed ? "<span class='t-line'>Fully built.</span>" : "<span class='t-line'><strong>Next:</strong> " + esc(nextText) + "</span><span class='t-line'><strong>Needs:</strong> " + esc(needsText(can.def.needs, can.def.scrap)) + "</span>" + (can.requires.length ? "<span class='t-line'><strong>Requires:</strong> " + esc(can.requires.map((r) => r.name + " " + r.level).join(", ")) + "</span>" : ""));
        tip(card, tipHtml);
        if (can.maxed) {
          card.appendChild(el("p", "small muted", "Fully built."));
        } else {
          const def = can.def;
          card.appendChild(el("p", "small", "<strong>Next:</strong> " + esc(nextText)));
          const needs = el("ul", "needs");
          Object.entries(def.needs).forEach(([k, n]) => {
            const have = s.inventory[k] || 0;
            needs.appendChild(el("li", have >= n ? "ok" : "short", esc(itemName(k)) + " <span>" + have + " / " + n + "</span>"));
          });
          needs.appendChild(el("li", s.scrap >= def.scrap ? "ok" : "short", "Scrap <span>" + s.scrap + " / " + def.scrap + "</span>"));
          can.requires.forEach((r) => needs.appendChild(el("li", r.ok ? "ok" : "short", esc(r.name) + " level " + r.level + " <span>" + (r.ok ? "built" : "needed") + "</span>")));
          card.appendChild(needs);
          const btn = el("button", "btn" + (can.ok ? " go" : ""), can.locked.length ? esc(can.locked[0].name) + " " + can.locked[0].level + " first" : "Build level " + (lvl + 1));
          btn.disabled = !can.ok;
          tip(btn, can.ok ? "<strong>Build at the workbench</strong><span class='t-line'>A short typing round. Nothing is spent until you finish it.</span>" : can.locked.length ? "<strong>Locked</strong><span class='t-line'>Build " + esc(can.locked.map((r) => r.name + " to level " + r.level).join(" and ")) + " first.</span>" : "<strong>Not yet</strong><span class='t-line'>Missing: " + esc(Object.entries(can.missing).map(([k, n]) => n + " " + itemName(k)).concat(can.scrapShort ? [can.scrapShort + " scrap"] : []).join(", ")) + "</span>");
          btn.addEventListener("click", () => {
            if (!S.canUpgradeRoom(key).ok) return;
            this.craft("Build " + room.name + " level " + (lvl + 1), needsText(def.needs, def.scrap), () => {
              const ok = S.upgradeRoom(key);
              if (ok && this.hooks.onChanged) this.hooks.onChanged(key);
              return ok;
            });
          });
          card.appendChild(btn);
        }
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
      return wrap;
    },

    garage() {
      const S = State();
      const s = S.save;
      const fx = S.effects();
      const wrap = el("div");
      const cap = fx.tierCap;
      wrap.appendChild(el("p", "small muted", "Garage level " + s.rooms.garage + ": van and van-gun upgrades up to tier " + cap + ", Spread Shot two tiers lower" + (cap < 5 ? ". Build the Garage room to go higher." : ".") + (fx.freeRepair ? " Repairs are free here." : " Repairs cost " + W().SETTINGS.repairMinScrap + " scrap or more, 1 for every " + W().SETTINGS.repairScrapPerHp + " health missing.")));
      const preview = el("canvas");
      preview.id = "garage-van";
      preview.width = 360;
      preview.height = 200;
      wrap.appendChild(preview);
      ZSR.Game.showcase(preview, s.upgrades, 0);
      const groups = el("div", "upgrade-groups");
      const vanG = el("div", "upgrade-group");
      vanG.appendChild(el("h3", null, "The van"));
      const gunG = el("div", "upgrade-group");
      gunG.appendChild(el("h3", null, "The van's gun (on the road)"));
      const STAT = {
        armor: (st) => "Van health " + st.maxHp,
        engine: (st) => "Speed x" + st.speed.toFixed(2),
        bumper: (st) => "Ram damage " + st.ram,
        paint: (st) => st.look.name,
        damage: (st) => "Damage " + st.damage + " per hit",
        fireRate: (st) => st.fireInterval.toFixed(2) + " s between shots",
        spread: (st) => st.bullets + " round" + (st.bullets > 1 ? "s" : "") + " per shot",
      };
      Object.keys(U().DEFS).forEach((key) => {
        const d = U().DEFS[key];
        const level = s.upgrades[key];
        const can = S.canBuyUpgrade(key);
        const card = el("div", "upgrade" + (can.maxed ? " maxed" : ""));
        card.appendChild(el("div", "icon", d.icon));
        const mid = el("div");
        mid.appendChild(el("div", "name", esc(d.name) + (key === "paint" ? " <span class='small muted'>(" + esc(U().stats(s.upgrades).look.name) + ")</span>" : "")));
        mid.appendChild(el("div", "desc", esc(d.desc)));
        const pips = el("div", "pips");
        for (let i = 0; i < d.max; i++) pips.appendChild(el("span", "pip" + (i < level ? " on" : "")));
        mid.appendChild(pips);
        card.appendChild(mid);
        const now = U().stats(s.upgrades);
        const nextU = Object.assign({}, s.upgrades, { [key]: level + 1 });
        const after = can.maxed ? null : U().stats(nextU);
        tip(card, "<strong>" + esc(d.name) + " · tier " + level + " of " + d.max + "</strong><span class='t-line'>" + esc(d.desc) + "</span><span class='t-line'><strong>Now:</strong> " + esc(STAT[key](now)) + "</span>" + (after ? "<span class='t-line'><strong>Next:</strong> " + esc(STAT[key](after)) + " for " + can.cost + " scrap</span>" : "<span class='t-line'>Maxed out.</span>") + (can.capped && !can.maxed ? "<span class='t-line'>Garage level " + can.garageNeeded + " needed for the next tier.</span>" : ""));
        const btn = el("button", "btn" + (can.ok ? " go" : ""), can.maxed ? "MAX" : can.capped ? "Garage " + can.garageNeeded + " needed" : can.cost + " scrap");
        btn.disabled = !can.ok;
        tip(btn, can.ok ? "<strong>Upgrade at the workbench</strong><span class='t-line'>A short typing round. The scrap is spent when you finish.</span>" : can.maxed ? "Nothing more to add." : can.capped ? "Build the Garage room to level " + can.garageNeeded + " first." : "Not enough scrap: " + can.cost + " needed, " + s.scrap + " held.");
        btn.addEventListener("click", () => {
          if (!S.canBuyUpgrade(key).ok) return;
          this.craft(d.name + " tier " + (level + 1), can.cost + " scrap", () => {
            const ok = S.buyUpgrade(key);
            if (ok && this.hooks.onChanged) this.hooks.onChanged(key);
            return ok;
          });
        });
        card.appendChild(btn);
        (d.group === "van" ? vanG : gunG).appendChild(card);
      });
      // repair: instant, back to full
      const rep = el("div", "upgrade");
      rep.appendChild(el("div", "icon", U().REPAIR.icon));
      const rmid = el("div");
      rmid.appendChild(el("div", "name", "Full repair"));
      const full = s.vanHp >= S.vanMaxHp();
      const cost = S.repairCost();
      rmid.appendChild(el("div", "desc", fx.freeRepair ? "Ruby fixes the van for free. Back to full health." : esc(U().REPAIR.desc) + " Back to full health: 1 scrap for every " + W().SETTINGS.repairScrapPerHp + " missing."));
      rep.appendChild(rmid);
      tip(rep, "<strong>Van repair</strong><span class='t-line'>Van health " + Math.round(s.vanHp) + " of " + S.vanMaxHp() + ".</span><span class='t-line'>" + (full ? "Nothing to fix." : fx.freeRepair ? "Free with the Garage room." : cost + " scrap brings it back to full.") + " No typing needed.</span>");
      const rbtn = el("button", "btn" + (!full && s.scrap >= cost ? " go" : ""), full ? "FULL" : cost ? cost + " scrap" : "Repair");
      rbtn.disabled = full || s.scrap < cost;
      rbtn.addEventListener("click", () => {
        if (S.repairVan()) {
          ZSR.Audio.play("buy");
          this.render();
        }
      });
      rep.appendChild(rbtn);
      vanG.appendChild(rep);
      groups.appendChild(vanG);
      groups.appendChild(gunG);
      wrap.appendChild(groups);
      return wrap;
    },

    /** On-foot weapons: the ones you hold, their mods, and hints for the ones still out there. */
    weapons() {
      const S = State();
      const s = S.save;
      const WP = ZSR.Weapons;
      const wrap = el("div");
      wrap.appendChild(el("p", "small muted", "Guns lie on the floor in buildings around the city, a different place every game. Pick one up and it is in your hands; bring it home and it is yours. Outside, 1 to 5, Q or the mouse wheel switch guns. Mods cost scrap and are typing rounds at the workbench."));
      const grid = el("div", "rooms weapons");
      const where = (w) => (w.danger[1] <= 2 ? "Somewhere close to home, in one of the quieter places." : w.danger[0] >= 4 ? "Only in one of the most dangerous places in town." : "Somewhere in the middle of town.");
      const fmt = (st) => {
        const shots = st.draw ? 1 / (st.draw + st.interval) : 1 / st.interval;
        const extra = [];
        if (st.noise === 0) extra.push("silent");
        if (st.pierce > 1) extra.push("goes through " + st.pierce + " walkers");
        if (st.move < 1) extra.push("you walk " + Math.round((1 - st.move) * 100) + "% slower");
        return "Damage " + st.damage + " · range " + st.range + " · " + shots.toFixed(1) + " shots/s · spread " + ((st.spread * 180) / Math.PI).toFixed(1) + "°" + (extra.length ? " · " + extra.join(", ") : "");
      };
      WP.ORDER.forEach((id) => {
        const w = WP.WEAPONS[id];
        const owned = s.weapons.owned.includes(id);
        const on = owned && S.equippedWeapon() === id;
        const card = el("div", "room weapon" + (on ? " on" : "") + (owned ? "" : " missing"));
        const head = el("div", "room-head");
        head.appendChild(el("h3", null, w.slot + " · " + esc(w.name)));
        card.appendChild(head);
        const icon = el("canvas", "weapon-icon");
        icon.width = 128;
        icon.height = 64;
        icon.getContext("2d").drawImage(ZSR.Draw3.weaponIcon(id), 0, 0);
        card.appendChild(icon);
        card.appendChild(el("p", "room-desc", esc(w.desc)));
        if (!owned) {
          card.appendChild(el("p", "small", "<strong>Not found yet.</strong> " + esc(where(w))));
          tip(card, "<strong>" + esc(w.name) + "</strong><span class='t-line'>" + esc(w.desc) + "</span><span class='t-line'>" + esc(where(w)) + "</span>");
          grid.appendChild(card);
          return;
        }
        const st = S.weaponStats(id);
        card.appendChild(el("p", "small", esc(fmt(st))));
        tip(card, "<strong>" + esc(w.name) + "</strong><span class='t-line'>" + esc(w.desc) + "</span><span class='t-line'>" + esc(fmt(st)) + "</span>");
        const pick = el("button", "btn" + (on ? "" : " go"), on ? "In hand" : "Carry this one");
        pick.disabled = on;
        tip(pick, "Take the " + esc(w.name.toLowerCase()) + " outside. You can still switch with " + w.slot + " or Q.");
        pick.addEventListener("click", () => {
          if (S.equipWeapon(id)) {
            S.commit();
            ZSR.Audio.play("equip");
            if (this.hooks.onChanged) this.hooks.onChanged("weapon");
            this.render();
          }
        });
        card.appendChild(pick);
        Object.keys(WP.MODS).forEach((key) => {
          const m = WP.mod(id, key);
          const can = S.canBuyMod(id, key);
          const row = el("div", "upgrade" + (can.maxed ? " maxed" : ""));
          row.appendChild(el("div", "icon", m.icon));
          const mid = el("div");
          mid.appendChild(el("div", "name", esc(m.name)));
          const pips = el("div", "pips");
          for (let i = 0; i < WP.MOD_MAX; i++) pips.appendChild(el("span", "pip" + (i < can.level ? " on" : "")));
          mid.appendChild(pips);
          row.appendChild(mid);
          const next = can.maxed ? null : WP.stats(id, Object.assign({}, s.weapons.mods[id], { [key]: can.level + 1 }));
          const STAT = { damage: (x) => "damage " + x.damage, range: (x) => "range " + x.range, rate: (x) => (x.draw ? (1 / (x.draw + x.interval)).toFixed(1) : (1 / x.interval).toFixed(1)) + " shots/s", aim: (x) => "spread " + ((x.spread * 180) / Math.PI).toFixed(1) + "°" };
          tip(row, "<strong>" + esc(m.name) + " · tier " + can.level + " of " + WP.MOD_MAX + "</strong><span class='t-line'>" + esc(m.desc) + "</span><span class='t-line'><strong>Now:</strong> " + esc(STAT[key](st)) + "</span>" + (next ? "<span class='t-line'><strong>Next:</strong> " + esc(STAT[key](next)) + " for " + can.cost + " scrap</span>" : "<span class='t-line'>Maxed out.</span>"));
          const btn = el("button", "btn" + (can.ok ? " go" : ""), can.maxed ? "MAX" : can.cost + " scrap");
          btn.disabled = !can.ok;
          btn.addEventListener("click", () => {
            if (!S.canBuyMod(id, key).ok) return;
            this.craft(w.name + ": " + m.name.toLowerCase() + " tier " + (can.level + 1), can.cost + " scrap", () => {
              const ok = S.buyMod(id, key);
              if (ok && this.hooks.onChanged) this.hooks.onChanged("weapon");
              return ok;
            });
          });
          row.appendChild(btn);
          card.appendChild(row);
        });
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
      return wrap;
    },

    traps() {
      const S = State();
      const s = S.save;
      const t = ZSR.text();
      const wrap = el("div");
      wrap.appendChild(el("p", "small muted", "Traps are set in the yard, on the ground in front of you or just past the fence. Walkers walk into them. Spent traps are gone."));
      const grid = el("div", "rooms");
      Object.entries(W().TRAPS).forEach(([key, def]) => {
        const txt = t && t.base && t.base.traps && t.base.traps[key];
        const can = S.canCraftTrap(key);
        const have = (s.traps && s.traps[key]) || 0;
        const card = el("div", "room");
        const head = el("div", "room-head");
        head.appendChild(el("h3", null, esc(def.name)));
        head.appendChild(el("span", "stock", "x" + have));
        card.appendChild(head);
        card.appendChild(el("p", "room-desc", esc(txt ? txt.desc : def.name + ": " + def.damage + " damage, " + def.uses + " use" + (def.uses > 1 ? "s" : "") + ". Place with " + def.key + ".")));
        tip(card, "<strong>" + esc(def.name) + "</strong><span class='t-line'>" + esc(txt ? txt.desc : "") + "</span><span class='t-line'><strong>Damage:</strong> " + def.damage + (def.radius > 0.6 ? " to every walker close by" : " to the walker that steps on it") + " · <strong>lasts:</strong> " + def.uses + " walker" + (def.uses > 1 ? "s" : "") + "</span><span class='t-line'><strong>Set it with:</strong> the " + def.key + " key in the yard</span><span class='t-line'><strong>Needs:</strong> " + esc(needsText(def.needs, def.scrap)) + "</span>");
        const needs = el("ul", "needs");
        Object.entries(def.needs).forEach(([k, n]) => {
          const h = s.inventory[k] || 0;
          needs.appendChild(el("li", h >= n ? "ok" : "short", esc(itemName(k)) + " <span>" + h + " / " + n + "</span>"));
        });
        needs.appendChild(el("li", s.scrap >= def.scrap ? "ok" : "short", "Scrap <span>" + s.scrap + " / " + def.scrap + "</span>"));
        can.requires.forEach((r) => needs.appendChild(el("li", r.ok ? "ok" : "short", esc(r.name) + " level " + r.level + " <span>" + (r.ok ? "built" : "needed") + "</span>")));
        card.appendChild(needs);
        const btn = el("button", "btn" + (can.ok ? " go" : ""), can.locked.length ? esc(can.locked[0].name) + " " + can.locked[0].level + " first" : "Craft one");
        btn.disabled = !can.ok;
        tip(btn, can.ok ? "<strong>Craft at the workbench</strong><span class='t-line'>A short typing round. Nothing is spent until you finish.</span>" : can.locked.length ? "Build " + esc(can.locked.map((r) => r.name + " to level " + r.level).join(" and ")) + " first." : "Missing: " + esc(Object.entries(can.missing).map(([k, n]) => n + " " + itemName(k)).concat(can.scrapShort ? [can.scrapShort + " scrap"] : []).join(", ")));
        btn.addEventListener("click", () => {
          if (!S.canCraftTrap(key).ok) return;
          this.craft("Craft a " + def.name.toLowerCase(), needsText(def.needs, def.scrap), () => S.craftTrap(key));
        });
        card.appendChild(btn);
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
      return wrap;
    },

    inventory() {
      const S = State();
      const s = S.save;
      const wrap = el("div");
      wrap.appendChild(el("p", "small muted", "Everything stored at the base. Cargo from a trip is unloaded here when you get home. Medical kits are packed into the backpack from here (open the Backpack)."));
      const grid = el("div", "inv");
      const keys = Object.keys(W().ITEMS);
      let any = false;
      keys.forEach((k) => {
        const n = s.inventory[k] || 0;
        if (!n) return;
        any = true;
        const it = W().ITEMS[k];
        const cell = el("div", "inv-item");
        cell.appendChild(el("span", "code", esc(it.code)));
        cell.appendChild(el("span", "name", esc(it.name)));
        cell.appendChild(el("span", "n", "×" + n));
        cell.style.borderLeftColor = it.color;
        const uses = Object.entries(W().BASE_ROOMS).filter(([, r]) => r.levels.some((l) => l.needs[k])).map(([, r]) => r.name).concat(Object.values(W().TRAPS).filter((tr) => tr.needs[k]).map((tr) => tr.name));
        tip(cell, "<strong>" + esc(it.name) + " ×" + n + "</strong><span class='t-line'>Used by: " + (uses.length ? esc(uses.join(", ")) : "nothing yet") + (k === "meds" ? ". Also packed as health kits." : "") + "</span>");
        grid.appendChild(cell);
      });
      if (!any) wrap.appendChild(el("p", "muted", "Nothing yet. Drive out, read the notes, bring things back."));
      wrap.appendChild(grid);
      // what each room still needs, as a shopping list
      const want = {};
      Object.entries(W().BASE_ROOMS).forEach(([key, room]) => {
        const def = room.levels[s.rooms[key]];
        if (!def) return;
        Object.entries(def.needs).forEach(([k, n]) => (want[k] = Math.max(want[k] || 0, n - (s.inventory[k] || 0))));
      });
      const list = Object.entries(want).filter(([, n]) => n > 0);
      if (list.length) {
        wrap.appendChild(el("h3", null, "Still needed for the next builds"));
        const ul = el("ul", "needs");
        list.forEach(([k, n]) => {
          const where = W().LOCATIONS.filter((l) => l.id !== "base" && (l.items.includes(k) || l.cache.includes(k)) && S.isKnown(l.id)).map((l) => l.name);
          ul.appendChild(el("li", "short", esc(itemName(k)) + " <span>" + n + " more</span>" + (where.length ? '<br><span class="small muted">' + esc(where.join(", ")) + "</span>" : '<br><span class="small muted">Somewhere you have not found yet. Read the notes.</span>')));
        });
        wrap.appendChild(ul);
      }
      return wrap;
    },
  };

  ZSR.Base = Base;
  ZSR.Tip = Tip;
})(typeof globalThis !== "undefined" ? globalThis : this);
