/* The city map: a hand-drawn board of streets and known locations.
   Pick a destination, see the route, drive. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const W = () => ZSR.WORLD;
  const INK = "#0f1012";
  const TAU = Math.PI * 2;

  const TYPE_LABEL = { base: "Home base", gas: "Gas station", store: "Store", shop: "Auto shop", station: "Station", school: "School", hospital: "Hospital", utility: "Utility", industrial: "Industrial", mall: "Mall", library: "Library" };

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const Map = {
    canvas: null,
    ctx: null,
    hooks: {},
    at: "base",
    selected: null,
    hover: null,
    visible: false,

    init(canvas, hooks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.hooks = hooks || {};
      this.info = document.getElementById("map-info");
      const pick = (e) => {
        const r = canvas.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 1000;
        const y = ((e.clientY - r.top) / r.height) * 700;
        return this.hitTest(x, y);
      };
      canvas.addEventListener("click", (e) => {
        const id = pick(e);
        if (id) this.select(id);
      });
      canvas.addEventListener("mousemove", (e) => {
        const id = pick(e);
        if (id !== this.hover) {
          this.hover = id;
          canvas.style.cursor = id ? "pointer" : "default";
          this.draw();
        }
      });
      this.graph = this.buildGraph();
    },

    buildGraph() {
      const adj = {};
      const pos = {};
      W().LOCATIONS.forEach((l) => (pos[l.id] = l));
      W().ROADS.forEach(([a, b]) => {
        const d = Math.hypot(pos[a].x - pos[b].x, pos[a].y - pos[b].y);
        (adj[a] = adj[a] || []).push([b, d]);
        (adj[b] = adj[b] || []).push([a, d]);
      });
      return adj;
    },
    /** Shortest road route (Dijkstra). Returns { path: [ids], dist }. */
    route(from, to) {
      const dist = {};
      const prev = {};
      const done = new Set();
      Object.keys(this.graph).forEach((k) => (dist[k] = Infinity));
      dist[from] = 0;
      while (true) {
        let u = null;
        Object.keys(dist).forEach((k) => {
          if (!done.has(k) && (u == null || dist[k] < dist[u])) u = k;
        });
        if (u == null || dist[u] === Infinity) break;
        if (u === to) break;
        done.add(u);
        (this.graph[u] || []).forEach(([v, d]) => {
          if (dist[u] + d < dist[v]) {
            dist[v] = dist[u] + d;
            prev[v] = u;
          }
        });
      }
      if (dist[to] === Infinity) return null;
      const path = [to];
      while (path[0] !== from) path.unshift(prev[path[0]]);
      return { path, dist: dist[to] };
    },

    show(at) {
      this.at = at || "base";
      this.selected = null;
      this.visible = true;
      this.draw();
      this.renderInfo();
    },
    hide() {
      this.visible = false;
    },

    hitTest(x, y) {
      let best = null;
      W().LOCATIONS.forEach((l) => {
        if (!State().isKnown(l.id)) return;
        const d = Math.hypot(l.x - x, l.y - y);
        if (d < 34 && (!best || d < best.d)) best = { d, id: l.id };
      });
      return best ? best.id : null;
    },
    select(id) {
      this.selected = id;
      ZSR.Audio.play("click");
      this.draw();
      this.renderInfo();
    },

    /* ---------- Info panel ---------- */
    renderInfo() {
      const S = State();
      const info = this.info;
      info.innerHTML = "";
      const fx = S.effects();
      const t = ZSR.text();
      const id = this.selected;
      const huge = document.documentElement.getAttribute("data-size") === "huge";
      if (!id) {
        info.appendChild(el("h3", null, this.at === "base" ? "Where to?" : "Next stop?"));
        info.appendChild(el("p", "small muted", huge ? "Pick a place. Notes and the Radio reveal more." : "Tap a place on the map. Only places you know about are shown. Notes and the Radio reveal more."));
        if (huge) {
          const list = el("div", "btn-col");
          W().LOCATIONS.filter((l) => S.isKnown(l.id) && l.id !== this.at).forEach((l) => {
            const b = el("button", "btn", esc(l.name));
            b.addEventListener("click", () => this.select(l.id));
            list.appendChild(b);
          });
          info.appendChild(list);
        }
        if (this.at !== "base") {
          const home = el("button", "btn big go", "Drive home");
          home.addEventListener("click", () => this.hooks.onDrive && this.hooks.onDrive("base"));
          info.appendChild(home);
        }
        return;
      }
      const loc = W().LOCATIONS.find((l) => l.id === id);
      info.appendChild(el("h3", null, esc(loc.name)));
      info.appendChild(el("p", "small muted", esc(TYPE_LABEL[loc.type] || loc.type) + (loc.id === "base" ? "" : " · " + (fx.showDanger || S.locState(id).visits ? "danger " + loc.danger + " of 5" : "danger unknown"))));
      const blurb = t && t.locations && t.locations[id] && t.locations[id].blurb;
      if (blurb) info.appendChild(el("p", null, esc(blurb)));
      if (loc.id !== "base") {
        const st = S.locState(id);
        const items = loc.items.filter((_, i) => S.itemAvailable(id, "i" + i));
        const cacheLeft = loc.cache.filter((_, i) => !st.cacheTaken["c" + i]);
        if (fx.mapShowsStock || fx.showStock || (fx.notesShowStock && S.noteRead(W().NOTES[id].door.id))) {
          info.appendChild(el("p", "small", "<strong>On the floor:</strong> " + (items.length ? items.map((k) => esc(W().ITEMS[k].name)).join(", ") : "nothing right now")));
          info.appendChild(el("p", "small", "<strong>" + esc(loc.cacheName) + ":</strong> " + (st.cacheOpened ? (cacheLeft.length ? cacheLeft.map((k) => esc(W().ITEMS[k].name)).join(", ") : "emptied") : fx.mapShowsCaches ? "locked, " + cacheLeft.length + " items" : "locked")));
        } else if (fx.mapShowsCaches) {
          info.appendChild(el("p", "small", "<strong>" + esc(loc.cacheName) + ":</strong> " + (st.cacheOpened ? (cacheLeft.length ? cacheLeft.length + " items left" : "emptied") : "locked")));
        }
        if (st.visits) info.appendChild(el("p", "small muted", "Visited " + st.visits + " time" + (st.visits > 1 ? "s" : "") + "."));
      }
      const r = this.at === id ? null : this.route(this.at, id);
      if (huge) {
        const back = el("button", "btn alt", "Other places");
        back.addEventListener("click", () => {
          this.selected = null;
          this.renderInfo();
        });
        info.appendChild(back);
      }
      if (this.at === id && id !== "base" && S.trip && S.trip.atDoor === id) {
        info.appendChild(el("p", "small muted", "You are parked at the door."));
        const go = el("button", "btn big go", "Go in");
        go.addEventListener("click", () => this.hooks.onEnter && this.hooks.onEnter(id));
        info.appendChild(go);
      } else if (this.at === id) info.appendChild(el("p", "small muted", "You are here."));
      else if (r) {
        const secs = Math.round(Math.min(W().SETTINGS.tripMaxSeconds, Math.max(W().SETTINGS.tripMinSeconds, r.dist * W().SETTINGS.tripSecondsPerUnit)));
        info.appendChild(el("p", "small muted", "Drive: about " + secs + " seconds by road" + (loc.id === "base" ? ". Cargo is unloaded and the day ends." : ".")));
        const go = el("button", "btn big go", loc.id === "base" ? "Drive home" : "Drive there");
        go.addEventListener("click", () => this.hooks.onDrive && this.hooks.onDrive(id));
        info.appendChild(go);
      }
    },

    /* ---------- Drawing ---------- */
    draw() {
      const ctx = this.ctx;
      const c = this.canvas;
      const S = State();
      const Wd = 1000;
      const H = 700;
      c.width = Wd;
      c.height = H;
      // paper
      ctx.fillStyle = "#e6dfcc";
      ctx.fillRect(0, 0, Wd, H);
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      for (let y = 4; y < H; y += 8) for (let x = 4 + ((y / 8) % 2) * 4; x < Wd; x += 8) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, TAU);
        ctx.fill();
      }
      // river on the west, hills on the north
      ctx.strokeStyle = "#8fb0c0";
      ctx.lineWidth = 26;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(40, 120);
      ctx.quadraticCurveTo(90, 330, 60, 520);
      ctx.quadraticCurveTo(50, 620, 120, 690);
      ctx.stroke();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(40, 120);
      ctx.quadraticCurveTo(90, 330, 60, 520);
      ctx.quadraticCurveTo(50, 620, 120, 690);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(90,74,58,0.18)";
      for (let i = 0; i < 9; i++) {
        const hx = 150 + i * 95;
        ctx.beginPath();
        ctx.moveTo(hx - 50, 110);
        ctx.lineTo(hx, 40 + (i % 2) * 20);
        ctx.lineTo(hx + 50, 110);
        ctx.closePath();
        ctx.fill();
      }
      // district labels
      ctx.fillStyle = "rgba(15,16,18,0.35)";
      ctx.font = "700 22px Oswald, Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NORTH HILLS", 520, 95);
      ctx.fillText("DOWNTOWN", 560, 450);
      ctx.fillText("EAST SIDE", 850, 640);
      ctx.fillText("RIVERSIDE", 160, 640);

      // roads (known endpoints only, faded otherwise)
      const pos = {};
      W().LOCATIONS.forEach((l) => (pos[l.id] = l));
      W().ROADS.forEach(([a, b]) => {
        const known = S.isKnown(a) && S.isKnown(b);
        ctx.strokeStyle = known ? "#4b5057" : "rgba(75,80,87,0.18)";
        ctx.lineWidth = known ? 10 : 6;
        ctx.beginPath();
        ctx.moveTo(pos[a].x, pos[a].y);
        ctx.lineTo(pos[b].x, pos[b].y);
        ctx.stroke();
        if (known) {
          ctx.strokeStyle = "rgba(230,223,204,0.7)";
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 10]);
          ctx.beginPath();
          ctx.moveTo(pos[a].x, pos[a].y);
          ctx.lineTo(pos[b].x, pos[b].y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
      // route highlight
      if (this.selected && this.selected !== this.at) {
        const r = this.route(this.at, this.selected);
        if (r) {
          ctx.strokeStyle = "#d9a21b";
          ctx.lineWidth = 7;
          ctx.setLineDash([14, 8]);
          ctx.lineDashOffset = -(performance.now() / 40) % 22;
          ctx.beginPath();
          r.path.forEach((id, i) => (i ? ctx.lineTo(pos[id].x, pos[id].y) : ctx.moveTo(pos[id].x, pos[id].y)));
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      // locations
      const fx = S.effects();
      W().LOCATIONS.forEach((l) => {
        if (!S.isKnown(l.id)) return;
        this.drawIcon(ctx, l, l.id === this.selected, l.id === this.hover, fx);
      });
      // you are here
      const here = pos[this.at];
      ZSR.Draw.van(ctx, here.x + 30, here.y - 26, { upgrades: S.save.upgrades, scale: 0.34, moving: false, aim: -Math.PI / 2 });
      // compass
      ctx.save();
      ctx.translate(940, 60);
      ZSR.Draw.star(ctx, 0, 0, 4, 28, 9, -Math.PI / 2);
      ZSR.Draw.fillStroke(ctx, "#f3eee0", 3);
      ctx.fillStyle = INK;
      ctx.font = "700 14px Oswald, Impact, sans-serif";
      ctx.fillText("N", 0, -34);
      ctx.restore();
    },

    drawIcon(ctx, l, selected, hover, fx) {
      const S = State();
      const x = l.x;
      const y = l.y;
      const size = l.id === "base" ? 30 : 24;
      ctx.save();
      ctx.translate(x, y);
      if (selected || hover) {
        ctx.beginPath();
        ctx.arc(0, 0, size + 12, 0, TAU);
        ctx.fillStyle = selected ? "rgba(217,162,27,0.45)" : "rgba(217,162,27,0.2)";
        ctx.fill();
      }
      ctx.lineJoin = "round";
      ctx.lineWidth = 3;
      ctx.strokeStyle = INK;
      const roof = { base: "#5b6b3a", gas: "#b3261e", store: "#3f5a8a", shop: "#4b5057", station: "#8a3a30", school: "#8a6a2e", hospital: "#9aa39a", utility: "#5f6b6e", industrial: "#6e6a60", mall: "#6b3f8a", library: "#3f7a6a" }[l.type] || "#4b5057";
      // building body
      ctx.fillStyle = "#f3eee0";
      ctx.fillRect(-size, -size * 0.4, size * 2, size * 1.2);
      ctx.strokeRect(-size, -size * 0.4, size * 2, size * 1.2);
      // roof
      ctx.fillStyle = roof;
      ctx.beginPath();
      if (l.type === "gas") {
        ctx.rect(-size * 1.2, -size * 0.7, size * 2.4, size * 0.3);
      } else if (l.type === "utility") {
        ctx.moveTo(-size * 0.6, -size * 0.4);
        ctx.lineTo(0, -size * 1.3);
        ctx.lineTo(size * 0.6, -size * 0.4);
      } else {
        ctx.moveTo(-size * 1.1, -size * 0.4);
        ctx.lineTo(0, -size);
        ctx.lineTo(size * 1.1, -size * 0.4);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // door and windows
      ctx.fillStyle = INK;
      ctx.fillRect(-4, size * 0.2, 8, size * 0.6);
      ctx.fillStyle = "#2b3540";
      ctx.fillRect(-size * 0.75, -size * 0.1, size * 0.4, size * 0.35);
      ctx.fillRect(size * 0.35, -size * 0.1, size * 0.4, size * 0.35);
      // danger pips
      if (l.id !== "base" && (fx.showDanger || S.locState(l.id).visits)) {
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = i < l.danger ? (l.danger >= 4 ? "#b3261e" : "#d9a21b") : "#f3eee0";
          ctx.fillRect(-size + i * 10, size * 0.95, 8, 6);
          ctx.strokeStyle = INK;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-size + i * 10, size * 0.95, 8, 6);
        }
      }
      // cache marker
      if (l.id !== "base" && fx.mapShowsCaches && !S.locState(l.id).cacheOpened) {
        ctx.fillStyle = "#b3261e";
        ctx.beginPath();
        ctx.arc(size, -size * 0.4, 7, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      // label
      ctx.fillStyle = INK;
      ctx.font = "700 15px Oswald, Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(l.name.toUpperCase(), 0, size * 1.1 + 4);
      ctx.restore();
    },
  };

  ZSR.Map = Map;
})(typeof globalThis !== "undefined" ? globalThis : this);
