/* The cabin build menu: rooms, inventory, garage, repairs. Opens from the
   cabin door in the yard; the yard is paused while it is open. Every action
   commits the base save. */
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

  const Base = {
    hooks: {},
    tab: "rooms",

    open(hooks) {
      this.hooks = hooks || this.hooks;
      document.getElementById("screen-base").classList.remove("hidden");
      this.render();
    },
    close() {
      document.getElementById("screen-base").classList.add("hidden");
      if (this.hooks.onClose) this.hooks.onClose();
    },

    render() {
      const S = State();
      const s = S.save;
      const t = ZSR.text();
      const body = document.getElementById("base-body");
      body.innerHTML = "";

      // header
      const head = el("div", "base-head");
      head.appendChild(el("div", "stat", '<span class="v">' + s.day + '</span><span class="l">day</span>'));
      head.appendChild(el("div", "stat", '<span class="v">' + s.scrap + '</span><span class="l">scrap</span>'));
      head.appendChild(el("div", "stat" + (s.food <= 0 ? " bad" : ""), '<span class="v">' + s.food + '</span><span class="l">food</span>'));
      head.appendChild(el("div", "stat", '<span class="v">' + Math.round(s.vanHp) + "/" + S.vanMaxHp() + '</span><span class="l">van</span>'));
      head.appendChild(el("div", "stat", '<span class="v">' + S.baseLevel() + "/24" + '</span><span class="l">base level</span>'));
      body.appendChild(head);
      if (t && t.base && t.base.intro) body.appendChild(el("p", "base-intro", esc(t.base.intro)));
      if (s.food <= 0) body.appendChild(el("p", "warn", "No food. The crew is hungry: the van starts the next trip weaker. Bring food crates home or grow some."));

      // tabs
      const tabs = el("div", "tabs");
      [["rooms", "Rooms"], ["garage", "Garage"], ["inventory", "Cargo & stock"]].forEach(([k, label]) => {
        const b = el("button", "tab" + (this.tab === k ? " on" : ""), label);
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
      else body.appendChild(this.inventory());

      const row = el("div", "btn-row");
      const back = el("button", "btn big", "Back to the yard");
      back.addEventListener("click", () => {
        ZSR.Audio.play("click");
        this.close();
      });
      const pack = el("button", "btn alt", "Backpack");
      pack.addEventListener("click", () => ZSR.Backpack.open());
      row.appendChild(back);
      row.appendChild(pack);
      body.appendChild(row);
    },

    rooms() {
      const S = State();
      const s = S.save;
      const t = ZSR.text();
      const wrap = el("div", "rooms");
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
        if (can.maxed) {
          card.appendChild(el("p", "small muted", "Fully built."));
        } else {
          const def = can.def;
          card.appendChild(el("p", "small", "<strong>Next:</strong> " + esc(txt && txt.next ? txt.next[lvl] : "Level " + (lvl + 1))));
          const needs = el("ul", "needs");
          Object.entries(def.needs).forEach(([k, n]) => {
            const have = s.inventory[k] || 0;
            needs.appendChild(el("li", have >= n ? "ok" : "short", esc(W().ITEMS[k].name) + " <span>" + have + " / " + n + "</span>"));
          });
          needs.appendChild(el("li", s.scrap >= def.scrap ? "ok" : "short", "Scrap <span>" + s.scrap + " / " + def.scrap + "</span>"));
          card.appendChild(needs);
          const btn = el("button", "btn" + (can.ok ? " go" : ""), "Build level " + (lvl + 1));
          btn.disabled = !can.ok;
          btn.addEventListener("click", () => {
            if (S.upgradeRoom(key)) {
              ZSR.Audio.play("buy");
              if (this.hooks.onChanged) this.hooks.onChanged(key);
              this.render();
            }
          });
          card.appendChild(btn);
        }
        wrap.appendChild(card);
      });
      return wrap;
    },

    garage() {
      const S = State();
      const s = S.save;
      const fx = S.effects();
      const wrap = el("div");
      const cap = fx.tierCap;
      wrap.appendChild(el("p", "small muted", "Garage level " + s.rooms.garage + ": van and gun upgrades up to tier " + cap + ", Spread Shot two tiers lower" + (cap < 5 ? ". Build the Garage room to go higher." : ".") + (fx.freeRepair ? " Repairs are free here." : " Repairs cost " + U().REPAIR.cost + " scrap.")));
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
      gunG.appendChild(el("h3", null, "The gun"));
      Object.keys(U().DEFS).forEach((key) => {
        const d = U().DEFS[key];
        const level = s.upgrades[key];
        const cost = U().cost(key, level);
        const capFor = (tc) => Math.min(d.max, key === "spread" ? Math.max(1, tc - 2) : tc);
        const capped = level >= capFor(cap);
        const garageLevels = W().BASE_ROOMS.garage.levels;
        const needIdx = garageLevels.findIndex((l) => capFor(l.effect.tierCap) > level);
        const card = el("div", "upgrade" + (cost == null ? " maxed" : ""));
        card.appendChild(el("div", "icon", d.icon));
        const mid = el("div");
        mid.appendChild(el("div", "name", esc(d.name) + (key === "paint" ? " <span class='small muted'>(" + esc(U().stats(s.upgrades).look.name) + ")</span>" : "")));
        mid.appendChild(el("div", "desc", esc(d.desc)));
        const pips = el("div", "pips");
        for (let i = 0; i < d.max; i++) pips.appendChild(el("span", "pip" + (i < level ? " on" : "")));
        mid.appendChild(pips);
        card.appendChild(mid);
        const btn = el("button", "btn", cost == null ? "MAX" : capped ? "Garage " + (needIdx < 0 ? garageLevels.length : needIdx + 1) + " needed" : cost + " scrap");
        btn.disabled = cost == null || capped || s.scrap < cost;
        btn.onclick = () => {
          const c = U().cost(key, s.upgrades[key]);
          if (c == null || capped || s.scrap < c) return;
          s.scrap -= c;
          s.upgrades[key] += 1;
          if (key === "armor") s.vanHp = Math.min(S.vanMaxHp(), s.vanHp + 30);
          S.commit();
          ZSR.Audio.play("buy");
          if (this.hooks.onChanged) this.hooks.onChanged(key);
          this.render();
        };
        card.appendChild(btn);
        (d.group === "van" ? vanG : gunG).appendChild(card);
      });
      // repair
      const rep = el("div", "upgrade");
      rep.appendChild(el("div", "icon", U().REPAIR.icon));
      const rmid = el("div");
      rmid.appendChild(el("div", "name", esc(U().REPAIR.name)));
      rmid.appendChild(el("div", "desc", fx.freeRepair ? "Ruby fixes the van for free." : esc(U().REPAIR.desc) + " +" + U().REPAIR.heal + " health."));
      rep.appendChild(rmid);
      const full = s.vanHp >= S.vanMaxHp();
      const rbtn = el("button", "btn", full ? "FULL" : fx.freeRepair ? "Repair" : U().REPAIR.cost + " scrap");
      rbtn.disabled = full || (!fx.freeRepair && s.scrap < U().REPAIR.cost);
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

    inventory() {
      const S = State();
      const s = S.save;
      const wrap = el("div");
      wrap.appendChild(el("p", "small muted", "Everything stored at the base. Cargo from a trip is unloaded here when you get home."));
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
          ul.appendChild(el("li", "short", esc(W().ITEMS[k].name) + " <span>" + n + " more</span>" + (where.length ? '<br><span class="small muted">' + esc(where.join(", ")) + "</span>" : '<br><span class="small muted">Somewhere you have not found yet. Read the notes.</span>')));
        });
        wrap.appendChild(ul);
      }
      return wrap;
    },
  };

  ZSR.Base = Base;
})(typeof globalThis !== "undefined" ? globalThis : this);
