/* The city map: a hand-drawn board of streets, side streets and known locations, with
   street names. Pick a destination, see the route, drive (the road itself shows no route:
   plan it here, then read the signs). Names and side streets come from js/streets.js.
   The board zooms (buttons, wheel, pinch, + and -) and pans (drag); it draws at the screen's
   own resolution. A picked route shows every turn the van takes: a numbered badge where it
   turns, the lanes of that turn as the road's sign will show them (heading up), and the side
   of the road the destination's lot is on. The turns come from Streets.buildDrive, the very
   drive the road builds, so the map and the road never disagree. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const W = () => ZSR.WORLD;
  const INK = "#0f1012";
  const PAPER = "#e6dfcc";
  const PAPER3 = "#f3eee0";
  const AMBER = "#d9a21b";
  const TAU = Math.PI * 2;
  const MW = 1000; // the board in map units
  const MH = 700;
  const ZMIN = 1;
  const ZMAX = 4;
  const ZSTEP = 1.5; // one press of + or -
  const FONT = (px) => "700 " + px + "px Oswald, Impact, sans-serif";

  const TYPE_LABEL = { base: "Home base", gas: "Gas station", store: "Store", shop: "Auto shop", station: "Station", school: "School", hospital: "Hospital", utility: "Utility", industrial: "Industrial", mall: "Mall", library: "Library" };
  const DISTRICTS = [
    ["NORTH HILLS", 520, 95],
    ["DOWNTOWN", 560, 450],
    ["EAST SIDE", 850, 640],
    ["RIVERSIDE", 160, 640],
  ];

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const unit = (x, y) => {
    const d = Math.hypot(x, y) || 1;
    return [x / d, y / d];
  };
  const angle = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); // signed, + is a right turn
  /** Distance from (px,py) to segment (x0,y0)-(x1,y1). */
  function segDist(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const t = clamp(((px - x0) * dx + (py - y0) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    return Math.hypot(px - x0 - dx * t, py - y0 - dy * t);
  }
  const iconSize = (l) => (l.id === "base" ? 30 : 24);
  /** The box an icon covers, in its own units around its spot (roof, canopy, danger pips). */
  const ICON_BOX = [-1.25, -1.35, 1.25, 1.25];

  const Map = {
    canvas: null,
    ctx: null,
    hooks: {},
    at: "base",
    selected: null,
    hover: null,
    focus: null, // the step a click in the list showed on the board
    visible: false,
    view: { z: 1, cx: MW / 2, cy: MH / 2 },
    guides: {},
    layoutCache: null,

    init(canvas, hooks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.hooks = hooks || {};
      this.info = document.getElementById("map-info");
      canvas.style.touchAction = "none";
      // one finger or the mouse: a tap picks a place, a drag pans; two fingers pinch to zoom
      const ptrs = {};
      let drag = null;
      let pinch = null;
      const pinchState = () => {
        const [a, b] = Object.values(ptrs);
        return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      };
      canvas.addEventListener("pointerdown", (e) => {
        if (e.button != null && e.button > 0) return;
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (err) {
          /* a synthetic pointer: nothing to capture */
        }
        ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
        const n = Object.keys(ptrs).length;
        if (n === 1) drag = { x: e.clientX, y: e.clientY, cx: this.view.cx, cy: this.view.cy, moved: false };
        else if (n === 2) {
          const p = pinchState();
          pinch = Object.assign(p, { z: this.view.z, m: this.toMap(p.mx, p.my) });
          drag = null;
        }
      });
      canvas.addEventListener("pointermove", (e) => {
        if (!ptrs[e.pointerId]) {
          const id = this.pick(e.clientX, e.clientY);
          if (id !== this.hover) {
            this.hover = id;
            this.draw();
          }
          this.setCursor();
          return;
        }
        ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
        if (pinch && Object.keys(ptrs).length >= 2) {
          const p = pinchState();
          this.zoomTo(pinch.z * (p.d / pinch.d), pinch.m.x, pinch.m.y, p.mx, p.my);
          return;
        }
        if (!drag) return;
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) > 6) drag.moved = true;
        if (!drag.moved) return;
        const u = MW / ((this.canvas.clientWidth || MW) * this.view.z); // map units per CSS px
        this.view.cx = drag.cx - dx * u;
        this.view.cy = drag.cy - dy * u;
        this.clampView();
        this.canvas.style.cursor = "grabbing";
        this.draw();
      });
      const up = (e) => {
        if (!ptrs[e.pointerId]) return;
        delete ptrs[e.pointerId];
        if (pinch) {
          // a pinch never picks a place, even as its last finger lifts
          if (Object.keys(ptrs).length < 2) pinch = null;
          drag = null;
          return;
        }
        if (e.type === "pointerup" && drag && !drag.moved) {
          const id = this.pick(e.clientX, e.clientY);
          if (id) this.select(id);
        }
        drag = null;
        this.setCursor();
      };
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
      canvas.addEventListener("pointerleave", () => {
        if (this.hover && !Object.keys(ptrs).length) {
          this.hover = null;
          this.draw();
        }
      });
      canvas.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          const f = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.06 : 0.002));
          const m = this.toMap(e.clientX, e.clientY);
          this.zoomTo(this.view.z * f, m.x, m.y, e.clientX, e.clientY);
        },
        { passive: false }
      );
      // the zoom buttons over the board
      const btn = (id, fn) => {
        const b = document.getElementById(id);
        if (b) b.addEventListener("click", fn);
        return b;
      };
      this.btnIn = btn("map-zoom-in", () => this.zoomBy(ZSTEP));
      this.btnOut = btn("map-zoom-out", () => this.zoomBy(1 / ZSTEP));
      this.btnAll = btn("map-zoom-all", () => this.fitAll());
      this.btnRoute = btn("map-zoom-route", () => this.fitRoute());
      // + and - zoom, 0 shows the whole board (only while the map is up with nothing over it)
      document.addEventListener("keydown", (e) => {
        if (!this.visible || e.ctrlKey || e.metaKey || e.altKey) return;
        const tag = e.target && e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        const scr = document.getElementById("screen-map");
        if (!scr || scr.classList.contains("hidden") || document.querySelector(".screen.overlay:not(.hidden)")) return;
        if (e.key === "+" || e.key === "=") this.zoomBy(ZSTEP);
        else if (e.key === "-" || e.key === "_") this.zoomBy(1 / ZSTEP);
        else if (e.key === "0") this.fitAll();
        else return;
        e.preventDefault();
      });
      let raf = 0;
      root.addEventListener("resize", () => {
        if (!this.visible || raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          this.draw();
        });
      });
      // the label layout measures text: once the web font is in, measure again
      if (document.fonts && document.fonts.ready)
        document.fonts.ready.then(() => {
          this.layoutCache = null;
          if (this.visible) this.draw();
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
    /** Shortest road route (Dijkstra). Returns { path: [ids], dist }. The road drives this same path. */
    route(from, to) {
      if (ZSR.Streets) return ZSR.Streets.route(from, to);
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
    /** Road seconds for a route, before the drive out of the first place (the same sum as the road's). */
    tripSeconds(dist) {
      const S = W().SETTINGS;
      return Math.min(S.tripMaxSeconds, Math.max(S.tripMinSeconds, dist * S.tripSecondsPerUnit));
    },

    /**
     * Every turn of the route from `from` to `to`, read off the drive the road builds:
     * { path, start (heading in on the first place's own drive, or null), steps }. One step per road
     * (the turn onto it, at the place it leaves), then the destination's lot. Each step: { node, x, y
     * (map units), ox, oy (the way out), lanes: [{ rel, ok }] left to right, choice (a sign there) };
     * the lot step also has lot: true, nx, ny (toward the lot) and side (+1 right, -1 left).
     */
    guideFor(from, to) {
      const key = from + ">" + to;
      if (this.guides[key] !== undefined) return this.guides[key];
      const St = ZSR.Streets;
      const r = from !== to && St ? this.route(from, to) : null;
      if (!r || r.path.length < 2) return (this.guides[key] = null);
      const path = r.path;
      const scale = St.scaleFor(r.dist, this.tripSeconds(r.dist), St.GEOM.baseSpeed);
      const drive = St.buildDrive(path, { scale, speed: St.GEOM.baseSpeed });
      const P = path.map((id) => W().LOCATIONS.find((l) => l.id === id));
      const turnAt = {};
      drive.decisions.forEach((d) => d.kind === "junction" && (turnAt[d.node] = d));
      const lanesOf = (dec) => dec.lanes.map((k) => ({ rel: dec.options[k].rel, ok: !!dec.options[k].correct }));
      const steps = [];
      for (let i = 0; i < path.length - 1; i++) {
        const [ox, oy] = unit(P[i + 1].x - P[i].x, P[i + 1].y - P[i].y);
        const dec = turnAt[path[i]];
        let lanes;
        if (dec) lanes = lanesOf(dec);
        else {
          // no sign here: the road just bends on (or the van starts on the one road out)
          let rel = 0;
          if (i > 0) {
            const [ix, iy] = unit(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
            rel = angle(ix, iy, ox, oy);
          }
          lanes = [{ rel, ok: true }];
        }
        steps.push({ node: path[i], x: P[i].x, y: P[i].y, ox, oy, lanes, choice: !!dec });
      }
      const dest = drive.decisions.find((d) => d.kind === "dest");
      const side = dest.lot.side;
      steps.push({ node: to, lot: true, x: dest.qx / scale, y: dest.qy / scale, ox: dest.ux, oy: dest.uy, nx: -dest.uy * side, ny: dest.ux * side, side, lanes: lanesOf(dest), choice: true });
      const sd = St.startDir(path[0]);
      return (this.guides[key] = { path, dist: r.dist, start: sd, steps });
    },

    show(at) {
      this.at = at || "base";
      this.selected = null;
      this.focus = null;
      this.visible = true;
      this.view = { z: 1, cx: MW / 2, cy: MH / 2 };
      this.draw();
      this.renderInfo();
    },
    hide() {
      this.visible = false;
    },

    /* ---------- View: zoom and pan ---------- */
    clampView() {
      const v = this.view;
      v.z = clamp(v.z, ZMIN, ZMAX);
      const hw = MW / 2 / v.z;
      const hh = MH / 2 / v.z;
      v.cx = clamp(v.cx, hw, MW - hw);
      v.cy = clamp(v.cy, hh, MH - hh);
    },
    /** A screen point (client px) as a map point. */
    toMap(clientX, clientY) {
      const c = this.canvas;
      const r = c.getBoundingClientRect();
      const w = c.clientWidth || r.width || MW;
      const h = c.clientHeight || r.height || MH;
      const fx = (clientX - r.left - (c.clientLeft || 0)) / w;
      const fy = (clientY - r.top - (c.clientTop || 0)) / h;
      const v = this.view;
      return { x: v.cx + (fx - 0.5) * (MW / v.z), y: v.cy + (fy - 0.5) * (MH / v.z) };
    },
    /** Zoom to z keeping map point (mx,my) under the screen point (clientX,clientY) (the board's middle by default). */
    zoomTo(z, mx, my, clientX, clientY) {
      const v = this.view;
      v.z = clamp(z, ZMIN, ZMAX);
      if (clientX == null) {
        v.cx = mx;
        v.cy = my;
      } else {
        const c = this.canvas;
        const r = c.getBoundingClientRect();
        const fx = (clientX - r.left - (c.clientLeft || 0)) / (c.clientWidth || r.width || MW);
        const fy = (clientY - r.top - (c.clientTop || 0)) / (c.clientHeight || r.height || MH);
        v.cx = mx - (fx - 0.5) * (MW / v.z);
        v.cy = my - (fy - 0.5) * (MH / v.z);
      }
      this.clampView();
      this.setCursor();
      this.draw();
    },
    zoomBy(f) {
      this.zoomTo(this.view.z * f, this.view.cx, this.view.cy);
    },
    fitAll() {
      this.focus = null;
      this.zoomTo(1, MW / 2, MH / 2);
    },
    /** Frame the whole picked route, as close as it fits. */
    fitRoute() {
      const g = this.selected ? this.guideFor(this.at, this.selected) : null;
      if (!g) return this.fitAll();
      this.focus = null;
      const xs = g.steps.map((s) => s.x);
      const ys = g.steps.map((s) => s.y);
      const pad = 70;
      const x0 = Math.min(...xs) - pad;
      const x1 = Math.max(...xs) + pad;
      const y0 = Math.min(...ys) - pad * 1.6; // the zoom buttons sit over the top edge
      const y1 = Math.max(...ys) + pad;
      this.zoomTo(Math.min(2.6, MW / (x1 - x0), MH / (y1 - y0)), (x0 + x1) / 2, (y0 + y1) / 2);
    },
    /** Show one step of the route up close. */
    focusStep(i) {
      const g = this.selected ? this.guideFor(this.at, this.selected) : null;
      if (!g || !g.steps[i]) return;
      this.focus = i;
      const s = g.steps[i];
      this.zoomTo(Math.max(this.view.z, 2.6), s.x + (s.lot ? 0 : s.ox * 30), s.y + (s.lot ? 0 : s.oy * 30));
    },
    setCursor() {
      if (!this.canvas) return;
      this.canvas.style.cursor = this.hover ? "pointer" : this.view.z > 1.001 ? "grab" : "default";
      const z = this.view.z;
      if (this.btnIn) this.btnIn.disabled = z >= ZMAX - 1e-3;
      if (this.btnOut) this.btnOut.disabled = z <= ZMIN + 1e-3;
      if (this.btnAll) this.btnAll.disabled = z <= ZMIN + 1e-3;
      if (this.btnRoute) this.btnRoute.classList.toggle("hidden", !(this.selected && this.selected !== this.at));
    },

    pick(clientX, clientY) {
      const m = this.toMap(clientX, clientY);
      return this.hitTest(m.x, m.y);
    },
    hitTest(x, y) {
      const k = 1 / Math.sqrt(this.view.z);
      let best = null;
      W().LOCATIONS.forEach((l) => {
        if (!State().isKnown(l.id)) return;
        const d = Math.hypot(l.x - x, l.y - y);
        if (d < 34 * k && (!best || d < best.d)) best = { d, id: l.id };
      });
      // a place's name picks it too
      if (!best && this.layoutCache)
        this.layoutCache.names.forEach((n) => {
          if (x > n.x0 && x < n.x1 && y > n.y0 && y < n.y1) best = { d: 0, id: n.id };
        });
      return best ? best.id : null;
    },
    select(id) {
      this.selected = id;
      this.focus = null;
      ZSR.Audio.play("click");
      this.setCursor();
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
      this.setCursor();
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
          const here = W().LOCATIONS.find((l) => l.id === this.at);
          const been = S.trip && S.trip.rooms && S.trip.rooms[this.at];
          const back = el("button", "btn", (been ? "Back into " : "Go into ") + esc(here ? here.name : "the building"));
          back.addEventListener("click", () => this.hooks.onEnter && this.hooks.onEnter(this.at));
          info.appendChild(back);
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
        // the stash: worth a trip once you hold its key
        if (loc.stash && (S.canOpenStash(id) || st.stashOpened)) {
          const stashLeft = loc.stash.filter((_, i) => !st.stashTaken["k" + i]);
          info.appendChild(el("p", "small", "<strong>" + esc(loc.stashName) + ":</strong> " + (st.stashOpened ? (stashLeft.length ? stashLeft.length + " item" + (stashLeft.length > 1 ? "s" : "") + " left" : "emptied") : "locked, and you have its key")));
        }
        if (st.visits) info.appendChild(el("p", "small muted", "Visited " + st.visits + " time" + (st.visits > 1 ? "s" : "") + "."));
      }
      const r = this.at === id ? null : this.route(this.at, id);
      if (huge) {
        const back = el("button", "btn alt", "Other places");
        back.addEventListener("click", () => {
          this.selected = null;
          this.draw();
          this.renderInfo();
        });
        info.appendChild(back);
      }
      if (this.at === id && id !== "base" && S.trip) {
        const again = S.trip.rooms && S.trip.rooms[id];
        info.appendChild(el("p", "small muted", again ? "You are parked outside. Inside is just as you left it." : "You are parked at the door."));
        const go = el("button", "btn big go", again ? "Go back in" : "Go in");
        go.addEventListener("click", () => this.hooks.onEnter && this.hooks.onEnter(id));
        info.appendChild(go);
      } else if (this.at === id) info.appendChild(el("p", "small muted", "You are here."));
      else if (r) {
        // long routes are never squeezed below the road's minimum scale (lanes need time to read), so they can run past tripMaxSeconds
        const secs0 = this.tripSeconds(r.dist);
        // ... and the drive out of this place to its first junction comes on top
        const secs = Math.round(ZSR.Streets ? Math.max(secs0, (r.dist * ZSR.Streets.GEOM.minScale) / ZSR.Streets.GEOM.baseSpeed) + ZSR.Streets.startSeconds(this.at) : secs0);
        info.appendChild(el("p", "small muted", "Drive: about " + secs + " seconds by road" + (loc.id === "base" ? ". Cargo is unloaded and the day ends." : ".")));
        // the way in words: the road shows no route, so the player reads this here, then the signs out there.
        // Each numbered step matches a badge on the board and shows the lanes its sign will show, ours lit.
        if (ZSR.Streets) {
          const St = ZSR.Streets;
          const name = (pid) => W().LOCATIONS.find((l) => l.id === pid).name;
          const g = this.guideFor(this.at, id);
          info.appendChild(el("h4", "route-head", esc(St.text("routeHead"))));
          const ol = el("ol", "route-steps");
          const lines = St.directions(r.path, (pid) => S.isKnown(pid), name);
          const tip = lines.length - 2; // the line on lanes in general: under the list, not a step
          lines.forEach((line, i) => {
            if (i === tip) return;
            const k = i < tip ? i : tip; // the step: one per road, then the lot
            const step = g && g.steps[k];
            const li = el("li", i === lines.length - 1 ? "last" : null);
            li.appendChild(el("span", "step-num", String(k + 1)));
            if (step) li.appendChild(this.laneStrip(step.lanes));
            li.appendChild(el("span", "step-text", esc(line)));
            if (step && !huge) {
              li.tabIndex = 0;
              li.setAttribute("role", "button");
              li.title = "Show this turn on the map";
              li.addEventListener("click", () => this.focusStep(k));
              li.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  this.focusStep(k);
                }
              });
            }
            ol.appendChild(li);
          });
          info.appendChild(ol);
          info.appendChild(el("p", "small muted route-tip", esc(lines[tip])));
        }
        const go = el("button", "btn big go", loc.id === "base" ? "Drive home" : "Drive there");
        go.addEventListener("click", () => this.hooks.onDrive && this.hooks.onDrive(id));
        info.appendChild(go);
      }
    },
    /** The lanes of one turn as a small strip, heading up like the road's sign: one arrow per lane, ours lit. */
    laneStrip(lanes) {
      const c = document.createElement("canvas");
      c.className = "lane-strip";
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const cw = Math.round(rem * 1.45);
      const ch = Math.round(rem * 1.6);
      const dpr = Math.min(3, root.devicePixelRatio || 1);
      c.width = Math.round(cw * lanes.length * dpr);
      c.height = Math.round(ch * dpr);
      c.style.width = cw * lanes.length + "px";
      c.style.height = ch + "px";
      const ok = lanes.findIndex((l) => l.ok);
      c.setAttribute("role", "img");
      c.setAttribute("aria-label", lanes.length > 1 ? "Lane " + (ok + 1) + " of " + lanes.length : "One lane");
      const ctx = c.getContext("2d");
      ctx.scale(dpr, dpr);
      this.drawLanes(ctx, 0, 0, cw, ch, lanes);
      return c;
    },
    /** Lane cells at (x,y), each cw x ch: ours amber, the rest paper, an arrow in each. */
    drawLanes(ctx, x, y, cw, ch, lanes) {
      const lw = Math.max(1, ch * 0.06);
      lanes.forEach((ln, i) => {
        const x0 = x + i * cw;
        ctx.fillStyle = ln.ok ? AMBER : PAPER3;
        ctx.fillRect(x0, y, cw, ch);
        const a = clamp(ln.rel, -2.4, 2.4);
        const s = ch * 0.62;
        // Draw.signArrow bends at the middle: shift it against its bend so it sits in the cell
        const sx = Math.abs(a) < 0.3 ? 0 : -Math.sin(a) * s * 0.3;
        ZSR.Draw.signArrow(ctx, x0 + cw / 2 + sx, y + ch * 0.48, ln.rel, s, ln.ok ? INK : "#7d786c");
      });
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw;
      for (let i = 1; i < lanes.length; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * cw, y);
        ctx.lineTo(x + i * cw, y + ch);
        ctx.stroke();
      }
      ctx.lineWidth = lw * 1.6;
      ctx.strokeRect(x + lw * 0.8, y + lw * 0.8, cw * lanes.length - lw * 1.6, ch - lw * 1.6);
    },

    /* ---------- Layout: where every name and badge goes at this zoom (cached; a pan only redraws) ---------- */
    layout() {
      const S = State();
      const St = ZSR.Streets;
      const c = this.canvas;
      const z = this.view.z;
      const cssW = c.clientWidth || MW * 0.8;
      const kSize = { large: 1.3, huge: 2 }[document.documentElement.getAttribute("data-size")] || 1;
      const knownIds = W()
        .LOCATIONS.filter((l) => S.isKnown(l.id))
        .map((l) => l.id);
      const key = [z.toFixed(4), this.at, this.selected, Math.round(cssW), kSize, knownIds.join(",")].join("|");
      if (this.layoutCache && this.layoutCache.key === key) return this.layoutCache;

      const ctx = this.ctx;
      const shown = cssW / MW; // CSS px per map unit at zoom 1
      const pxU = 1 / (shown * z); // map units per CSS px now
      const ik = 1 / Math.sqrt(z); // icons and roads grow slower than the zoom, so a close look has room
      const pos = {};
      W().LOCATIONS.forEach((l) => (pos[l.id] = l));
      const known = new Set(knownIds);
      const g = this.selected && this.selected !== this.at ? this.guideFor(this.at, this.selected) : null;
      const onRoute = new Set();
      if (g && St) for (let i = 0; i < g.path.length - 1; i++) onRoute.add(St.roadKey(g.path[i], g.path[i + 1]));
      const roadKnown = (a, b) => (known.has(a) && known.has(b)) || onRoute.has(a + "|" + b);
      const roads = W().ROADS.filter(([a, b]) => roadKnown(a, b)).map(([a, b]) => ({ a, b, key: a + "|" + b, x0: pos[a].x, y0: pos[a].y, x1: pos[b].x, y1: pos[b].y }));
      const stubs = St
        ? St.SIDE_STREETS.filter((ss) => roadKnown(...ss.road.split("|"))).map((ss) => Object.assign(St.sideStub(ss), { ss }))
        : [];
      const roadHalf = 5 * ik;

      // the route as the van drives it: in on its own drive, along the roads, off into the lot on its side
      let line = null;
      const badges = [];
      let van = null;
      if (g) {
        line = [];
        const p0 = pos[g.path[0]];
        if (g.start) {
          const len = 60 * ik;
          line.push([p0.x - g.start[0] * len, p0.y - g.start[1] * len]);
          van = { x: p0.x - g.start[0] * len, y: p0.y - g.start[1] * len, ang: Math.atan2(g.start[1], g.start[0]) + Math.PI / 2 };
        }
        g.path.slice(0, -1).forEach((id) => line.push([pos[id].x, pos[id].y]));
        const lot = g.steps[g.steps.length - 1];
        const into = roadHalf + 12 * ik;
        line.push([lot.x, lot.y], [lot.x + lot.nx * into, lot.y + lot.ny * into]);
        // a numbered badge where each step turns: on its road out, just past the place's icon; the last at the lot
        const br = Math.min((8.5 + 1.5 * z) * pxU * Math.sqrt(kSize), 13 / Math.pow(z, 0.6)); // a little bigger up close, never swamping a small board
        g.steps.forEach((s, i) => {
          if (s.lot) badges.push({ i, x: lot.x + lot.nx * into, y: lot.y + lot.ny * into, r: br * 1.1, step: s });
          else {
            const off = iconSize(pos[s.node]) * 1.35 * ik + br + 3 * pxU;
            badges.push({ i, x: s.x + s.ox * off, y: s.y + s.oy * off, r: br, step: s });
          }
        });
      }
      if (!van) {
        const here = pos[this.at];
        van = { x: here.x + 30 * ik, y: here.y - 26 * ik, ang: 0 };
      }

      // things a name should keep off, each a box [x0, y0, x1, y1, weight]
      const icons = W()
        .LOCATIONS.filter((l) => known.has(l.id))
        .map((l) => {
          const s = iconSize(l) * ik;
          return { id: l.id, b: [l.x + ICON_BOX[0] * s, l.y + ICON_BOX[1] * s, l.x + ICON_BOX[2] * s, l.y + ICON_BOX[3] * s] };
        });
      const vanBox = [van.x - 22 * ik, van.y - 26 * ik, van.x + 22 * ik, van.y + 26 * ik];
      ctx.font = FONT(10);
      const districtBoxes = DISTRICTS.map(([t, x, y]) => {
        const w = ctx.measureText(t).width * 2.2 * ik * 0.5; // drawn at 22 * ik
        return [x - w, y - 20 * ik, x + w, y + 4 * ik];
      });
      const lineSegs = [];
      if (line) for (let i = 0; i < line.length - 1; i++) lineSegs.push([...line[i], ...line[i + 1]]);

      /* place names: around their icon where they cover the fewest roads, icons, names and badges */
      // about 12.5 CSS px (more at a larger text size), but on a small board the whole city can't hold names that
      // big: there they shrink to fit and zooming in brings them back up to size
      const nameFs = Math.max(15 / Math.pow(z, 0.75), Math.min(Math.max(15 * shown, 12.5 * kSize) * Math.pow(z, 0.25) * pxU, 21 / Math.pow(z, 0.6)));
      const pad = 3 * pxU;
      const names = [];
      const rectCost = (x0, y0, x1, y1, own) => {
        let cost = 0;
        const cols = 7;
        const rows = 3;
        for (let r = 0; r < rows; r++)
          for (let q = 0; q < cols; q++) {
            const x = x0 + ((x1 - x0) * (q + 0.5)) / cols;
            const y = y0 + ((y1 - y0) * (r + 0.5)) / rows;
            if (x < 3 || x > MW - 3 || y < 3 || y > MH - 3) cost += 10;
            roads.forEach((rd) => {
              if (segDist(x, y, rd.x0, rd.y0, rd.x1, rd.y1) < roadHalf + pad) cost += onRoute.has(rd.key) ? 6 : 4;
            });
            stubs.forEach((st) => segDist(x, y, st.x0, st.y0, st.x1, st.y1) < roadHalf * 0.7 + pad && (cost += 3));
            lineSegs.forEach((sg) => segDist(x, y, ...sg) < roadHalf + pad && (cost += 4));
            icons.forEach((ic) => ic.id !== own && x > ic.b[0] && x < ic.b[2] && y > ic.b[1] && y < ic.b[3] && (cost += 8));
            names.forEach((n) => x > n.x0 - pad && x < n.x1 + pad && y > n.y0 - pad && y < n.y1 + pad && (cost += 12));
            badges.forEach((b) => Math.hypot(x - b.x, y - b.y) < b.r + pad && (cost += 6));
            if (x > vanBox[0] && x < vanBox[2] && y > vanBox[1] && y < vanBox[3]) cost += 6;
            districtBoxes.forEach((d) => x > d[0] && x < d[2] && y > d[1] && y < d[3] && (cost += 0.5));
          }
        return cost;
      };
      ctx.font = FONT(nameFs);
      // the route's places first, then the rest
      const order = knownIds.slice().sort((a, b) => (g && g.path.includes(b) ? 1 : 0) - (g && g.path.includes(a) ? 1 : 0));
      order.forEach((id) => {
        const l = pos[id];
        const s = iconSize(l) * ik;
        const full = l.name.toUpperCase();
        const splits = [[full]];
        const words = full.split(" ");
        if (words.length > 1 && full.length > 11) {
          let best = null;
          for (let k = 1; k < words.length; k++) {
            const a = words.slice(0, k).join(" ");
            const b = words.slice(k).join(" ");
            const w = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
            if (!best || w < best.w) best = { w, lines: [a, b] };
          }
          splits.push(best.lines);
        }
        const lh = nameFs * 1.05;
        let best = null;
        splits.forEach((lines, si) => {
          const w = Math.max(...lines.map((t) => ctx.measureText(t).width)) + pad * 2;
          const h = lines.length * lh + pad * 1.4;
          const gap = 2 * pxU;
          const L = l.x + ICON_BOX[0] * s;
          const R = l.x + ICON_BOX[2] * s;
          const T = l.y + ICON_BOX[1] * s;
          const B = l.y + ICON_BOX[3] * s;
          // [left, top, preference]
          const cands = [
            [l.x - w / 2, B + gap, 0],
            [l.x - w / 2, T - gap - h, 0.4],
            [R + gap, l.y - h / 2, 0.5],
            [L - gap - w, l.y - h / 2, 0.5],
            [R - s * 0.3, B + gap, 0.7],
            [L + s * 0.3 - w, B + gap, 0.7],
            [R - s * 0.3, T - gap - h, 0.9],
            [L + s * 0.3 - w, T - gap - h, 0.9],
            [l.x - w / 2, B + gap + lh * 0.9, 1.6],
            [l.x - w / 2, T - gap - h - lh * 0.9, 1.8],
          ];
          cands.forEach(([x0, y0, pref]) => {
            const k = rectCost(x0, y0, x0 + w, y0 + h, id) + pref + si * 1.2;
            if (!best || k < best.k) best = { k, x0, y0, w, h, lines };
          });
        });
        names.push({ id, lines: best.lines, x0: best.x0, y0: best.y0, x1: best.x0 + best.w, y1: best.y0 + best.h, lh, fs: nameFs });
      });

      /* street names along the known roads and side streets, upright, on a paper halo, each where it overlaps the
         fewest icons, place names, badges and other street names; a name that fits nowhere is left out (the
         signs and the minimap carry it), never one on the route */
      const streets = [];
      if (St) {
        const boxes = icons.map((ic) => [...ic.b, false]).concat(names.map((n) => [n.x0, n.y0, n.x1, n.y1, true]), [[...vanBox, false]]);
        badges.forEach((b) => boxes.push([b.x - b.r, b.y - b.r, b.x + b.r, b.y + b.r, true]));
        const placed = [];
        const pts = (x, y, ang, w) => {
          const out = [];
          for (let i = 0; i <= 6; i++) out.push([x + Math.cos(ang) * (-w / 2 + (w * i) / 6), y + Math.sin(ang) * (-w / 2 + (w * i) / 6)]);
          return out;
        };
        const inBox = (x, y, r) => boxes.some(([x0, y0, x1, y1]) => x > x0 - r && x < x1 + r && y > y0 - r && y < y1 + r);
        const hitsBox = (ps, r) => ps.some(([x, y]) => inBox(x, y, r * 0.5));
        const cost = (ps, r, own) => {
          let k = 0;
          ps.forEach(([x, y]) => {
            if (x < 2 || x > MW - 2 || y < 2 || y > MH - 2) k += 3;
            boxes.forEach(([x0, y0, x1, y1, name]) => {
              if (x > x0 && x < x1 && y > y0 && y < y1) k += name ? 6 : 3;
              else if (x > x0 - r && x < x1 + r && y > y0 - r && y < y1 + r) k += 1;
            });
            stubs.forEach((st) => st !== own && segDist(x, y, st.x0, st.y0, st.x1, st.y1) < r + 3 * ik && (k += 1));
            placed.forEach(([px, py]) => {
              const d = Math.hypot(px - x, py - y);
              if (d < r * 1.4) k += 3; // letters on letters
              else if (d < r * 2 + 2 * ik) k += 1;
            });
          });
          return k;
        };
        // about 12 CSS px at normal text size, at any zoom
        const roadFs = Math.max(13 / z, Math.min((12 * kSize) / shown / z, 20 / Math.pow(z, 0.6)));
        const sideFs = Math.max(12 / z, Math.min((11 * kSize) / shown / z, 18 / Math.pow(z, 0.6)));
        const label = (text, cands, size, own, must, route) => {
          ctx.font = FONT(size);
          const w = ctx.measureText(text).width;
          let best = null;
          cands.forEach((c, i) => {
            const k = cost(pts(c.x, c.y, c.ang, w), size * 0.45, own) + i * 0.01;
            if (!best || k < best.k) best = { k, c };
          });
          if (!best || (best.k >= (route ? 6 : 3) && !must)) return false;
          let { x, y, ang } = best.c;
          const mine = pts(x, y, ang, w);
          placed.push(...mine);
          if (ang > Math.PI / 2) ang -= Math.PI;
          if (ang < -Math.PI / 2) ang += Math.PI;
          // a route name that has to sit on an icon is drawn over it, after the icons, so it keeps every letter
          streets.push({ text, x, y, ang, size, late: hitsBox(mine, size * 0.45) });
          return true;
        };
        const roadLabel = (rd) => {
          const { a, b } = rd;
          const ang = Math.atan2(pos[b].y - pos[a].y, pos[b].x - pos[a].x);
          const route = onRoute.has(rd.key);
          // where it fits along the road, a size smaller if it fits nowhere
          for (const size of [roadFs, roadFs * 0.86, roadFs * 0.72]) {
            const off0 = size * 0.6 + roadHalf + 1 * ik;
            const cands = [];
            [0.5, 0.44, 0.56, 0.38, 0.62, 0.32, 0.68, 0.26, 0.74, 0.2, 0.8].forEach((t) =>
              [off0, -off0, off0 + 6 * ik, -off0 - 6 * ik].forEach((off) => {
                const mx = pos[a].x + (pos[b].x - pos[a].x) * t;
                const my = pos[a].y + (pos[b].y - pos[a].y) * t;
                cands.push({ x: mx - Math.sin(ang) * off, y: my + Math.cos(ang) * off, ang });
              })
            );
            if (label(St.STREET_NAMES[rd.key], cands, size, null, route && size === roadFs * 0.72, route)) return;
          }
        };
        const sideLabel = (st) => {
          const ss = st.ss;
          const ang = Math.atan2(st.y1 - st.y0, st.x1 - st.x0);
          const len = Math.hypot(st.x1 - st.x0, st.y1 - st.y0);
          const ux = (st.x1 - st.x0) / len;
          const uy = (st.y1 - st.y0) / len;
          const [a, b] = ss.road.split("|");
          const rx = pos[b].x - pos[a].x;
          const ry = pos[b].y - pos[a].y;
          const rl = Math.hypot(rx, ry);
          const rang = Math.atan2(ry, rx);
          const route = onRoute.has(ss.road);
          for (const size of [sideFs, sideFs * 0.84, sideFs * 0.75]) {
            ctx.font = FONT(size);
            const w = ctx.measureText(ss.name).width;
            const off = size * 0.55 + 4 * ik;
            // beside the stub, then running on past its end, then along the road it leaves on that side
            const cands = [off, -off].map((o) => ({ x: (st.x0 + st.x1) / 2 - uy * o, y: (st.y0 + st.y1) / 2 + ux * o, ang }));
            cands.push({ x: st.x1 + ux * (w / 2 + 6 * ik), y: st.y1 + uy * (w / 2 + 6 * ik), ang });
            [1, -1].forEach((dir) => {
              const along = dir * (w / 2 + 8 * ik);
              cands.push({ x: st.x0 + (rx / rl) * along + ux * (off + 4 * ik), y: st.y0 + (ry / rl) * along + uy * (off + 4 * ik), ang: rang });
            });
            if (label(ss.name, cands, size, st, route && size === sideFs * 0.75, route)) return;
          }
        };
        // the route's names first (always drawn), then the rest where they fit
        roads.filter((rd) => onRoute.has(rd.key)).forEach(roadLabel);
        stubs.filter((st) => onRoute.has(st.ss.road)).forEach(sideLabel);
        roads.filter((rd) => !onRoute.has(rd.key)).forEach(roadLabel);
        stubs.filter((st) => !onRoute.has(st.ss.road)).forEach(sideLabel);
      }

      /* close up, each turn's lanes ride beside its badge, on the side that covers the least */
      const cards = [];
      if (g && z >= 1.9) {
        const ch = Math.min(clamp(14 + 6 * z, 24, 38) * pxU * Math.sqrt(kSize), 30 / Math.pow(z, 0.6));
        const cw = ch * 0.92;
        badges.forEach((b) => {
          const w = cw * b.step.lanes.length;
          const gap = 4 * pxU;
          const cands = [
            [b.x + b.r + gap, b.y - ch / 2],
            [b.x - b.r - gap - w, b.y - ch / 2],
            [b.x - w / 2, b.y + b.r + gap],
            [b.x - w / 2, b.y - b.r - gap - ch],
          ];
          let best = null;
          cands.forEach(([x0, y0], i) => {
            const k = rectCost(x0, y0, x0 + w, y0 + ch, null) + i * 0.1;
            if (!best || k < best.k) best = { k, x0, y0 };
          });
          cards.push({ x0: best.x0, y0: best.y0, cw, ch, lanes: b.step.lanes });
          names.push({ id: null, x0: best.x0, y0: best.y0, x1: best.x0 + w, y1: best.y0 + ch, card: true }); // later cards keep off it
        });
      }

      this.layoutCache = { key, z, pxU, ik, kSize, roadHalf, g, onRoute, roads, stubs, line, badges, van, names: names.filter((n) => !n.card), streets, cards };
      return this.layoutCache;
    },

    /* ---------- Drawing ---------- */
    draw() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const c = this.canvas;
      const S = State();
      // the backing store matches the board's size on screen at the screen's pixel density
      const cssW = c.clientWidth || MW;
      const dpr = Math.min(3, root.devicePixelRatio || 1);
      const bw = clamp(Math.round(cssW * dpr), MW, 4200);
      const bh = Math.round((bw * MH) / MW);
      if (c.width !== bw || c.height !== bh) {
        c.width = bw;
        c.height = bh;
      }
      this.clampView();
      const L = this.layout();
      const v = this.view;
      const k = (bw / MW) * v.z;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, bw, bh);
      ctx.setTransform(k, 0, 0, k, bw / 2 - v.cx * k, bh / 2 - v.cy * k);
      const vx0 = v.cx - MW / 2 / v.z;
      const vy0 = v.cy - MH / 2 / v.z;
      const vx1 = v.cx + MW / 2 / v.z;
      const vy1 = v.cy + MH / 2 / v.z;
      const ik = L.ik;
      const pos = {};
      W().LOCATIONS.forEach((l) => (pos[l.id] = l));

      // paper grain (only what is in view), river on the west, hills on the north
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.beginPath();
      for (let y = 4 + Math.max(0, Math.floor((vy0 - 4) / 8)) * 8; y < Math.min(MH, vy1 + 8); y += 8)
        for (let x = 4 + ((y / 8) % 2) * 4 + Math.max(0, Math.floor((vx0 - 8) / 8)) * 8; x < Math.min(MW, vx1 + 8); x += 8) ctx.rect(x - 0.8 * ik, y - 0.8 * ik, 1.6 * ik, 1.6 * ik);
      ctx.fill();
      const river = () => {
        ctx.beginPath();
        ctx.moveTo(40, 120);
        ctx.quadraticCurveTo(90, 330, 60, 520);
        ctx.quadraticCurveTo(50, 620, 120, 690);
        ctx.stroke();
      };
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#8fb0c0";
      ctx.lineWidth = 26;
      river();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2 * ik;
      ctx.setLineDash([6 * ik, 6 * ik]);
      river();
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
      // district names: background, so they shrink back as the board zooms in
      ctx.fillStyle = "rgba(15,16,18," + (0.3 * ik).toFixed(3) + ")";
      ctx.font = FONT(22 * ik);
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      DISTRICTS.forEach(([t, x, y]) => ctx.fillText(t, x, y));

      // roads: the known ones (and the route's), faded where a place is still unknown
      W().ROADS.forEach(([a, b]) => {
        if (L.roads.some((rd) => rd.a === a && rd.b === b)) return;
        ctx.strokeStyle = "rgba(75,80,87,0.18)";
        ctx.lineWidth = 6 * ik;
        ctx.beginPath();
        ctx.moveTo(pos[a].x, pos[a].y);
        ctx.lineTo(pos[b].x, pos[b].y);
        ctx.stroke();
      });
      // an ink edge, the asphalt, the center line: drawn in passes so crossings read as one surface
      const roadPass = (color, w, dash) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = w;
        ctx.setLineDash(dash || []);
        L.roads.forEach((rd) => {
          ctx.beginPath();
          ctx.moveTo(rd.x0, rd.y0);
          ctx.lineTo(rd.x1, rd.y1);
          ctx.stroke();
        });
        ctx.setLineDash([]);
      };
      roadPass("rgba(15,16,18,0.55)", L.roadHalf * 2 + 2 * ik);
      roadPass("#4b5057", L.roadHalf * 2);
      roadPass("rgba(230,223,204,0.7)", 1.6 * ik, [8 * ik, 8 * ik]);
      // side streets: short stubs that go nowhere, drawn like the roads they leave
      if (ZSR.Streets) {
        const St = ZSR.Streets;
        St.SIDE_STREETS.forEach((ss) => {
          const kn = L.stubs.some((st) => st.ss === ss);
          const st = St.sideStub(ss);
          ctx.strokeStyle = kn ? "#5d636b" : "rgba(75,80,87,0.16)";
          ctx.lineWidth = (kn ? 6 : 4) * ik;
          ctx.lineCap = "butt";
          ctx.beginPath();
          ctx.moveTo(st.x0, st.y0);
          ctx.lineTo(st.x1, st.y1);
          ctx.stroke();
          ctx.lineCap = "round";
          if (!kn) return;
          // the end: a bar for a dead end or a gate, a red cross for a closed road
          const ux = (st.x1 - st.x0) / St.GEOM.sideLen;
          const uy = (st.y1 - st.y0) / St.GEOM.sideLen;
          const e = 6 * ik;
          ctx.strokeStyle = ss.kind === "closed" ? "#b3261e" : INK;
          ctx.lineWidth = 3 * ik;
          ctx.beginPath();
          if (ss.kind === "closed") {
            ctx.moveTo(st.x1 - e, st.y1 - e);
            ctx.lineTo(st.x1 + e, st.y1 + e);
            ctx.moveTo(st.x1 + e, st.y1 - e);
            ctx.lineTo(st.x1 - e, st.y1 + e);
          } else {
            ctx.moveTo(st.x1 - uy * e * 1.2, st.y1 + ux * e * 1.2);
            ctx.lineTo(st.x1 + uy * e * 1.2, st.y1 - ux * e * 1.2);
          }
          ctx.stroke();
        });
      }
      // the route: the way the van goes, arrows along it
      if (L.line) this.drawRoute(ctx, L);
      // street names, then the places over them
      const street = (s) => {
        ctx.save();
        ctx.font = FONT(s.size);
        ctx.translate(s.x, s.y);
        ctx.rotate(s.ang);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";
        ctx.lineWidth = s.size * 0.3;
        ctx.strokeStyle = "rgba(230,223,204,0.95)";
        ctx.strokeText(s.text, 0, 0);
        ctx.fillStyle = "#3a3d42";
        ctx.fillText(s.text, 0, 0);
        ctx.restore();
      };
      L.streets.forEach((s) => !s.late && street(s));
      const fx = S.effects();
      W().LOCATIONS.forEach((l) => {
        if (!S.isKnown(l.id)) return;
        this.drawIcon(ctx, l, l.id === this.selected, l.id === this.hover, fx, ik);
      });
      // you are here: the van, on its own drive facing in when a route is picked
      ctx.save();
      ctx.translate(L.van.x, L.van.y);
      ctx.rotate(L.van.ang);
      ZSR.Draw.van(ctx, 0, 0, { upgrades: S.save.upgrades, scale: 0.34 * ik, moving: false, aim: -Math.PI / 2 });
      ctx.restore();
      L.streets.forEach((s) => s.late && street(s));
      L.names.forEach((n) => this.drawName(ctx, n, L));
      if (L.g) this.drawBadges(ctx, L);
      // compass, fixed in the corner whatever the zoom
      const dk = bw / MW;
      ctx.setTransform(dk, 0, 0, dk, 0, 0);
      ctx.save();
      ctx.translate(950, 62);
      ZSR.Draw.star(ctx, 0, 0, 4, 26, 8, -Math.PI / 2);
      ZSR.Draw.fillStroke(ctx, PAPER3, 3);
      ctx.fillStyle = INK;
      ctx.font = FONT(14);
      ctx.textAlign = "center";
      ctx.fillText("N", 0, -32);
      ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    },

    /** The picked route: in on the first place's own drive, along each road, off into the lot. */
    drawRoute(ctx, L) {
      const pts = L.line;
      const ik = L.ik;
      const path = () => {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length - 1; i++) {
          const a = pts[i - 1];
          const b = pts[i];
          const c = pts[i + 1];
          const r = Math.min(12 * ik, 0.45 * Math.hypot(b[0] - a[0], b[1] - a[1]), 0.45 * Math.hypot(c[0] - b[0], c[1] - b[1]));
          ctx.arcTo(b[0], b[1], c[0], c[1], r);
        }
        ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      };
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      path();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 10 * ik;
      ctx.stroke();
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 7 * ik;
      ctx.stroke();
      // chevrons the way the van drives, about every 34 screen px
      const step = 34 * L.pxU;
      const h = 2.6 * ik;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.8 * ik;
      let carry = step * 0.5;
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i];
        const [x1, y1] = pts[i + 1];
        const len = Math.hypot(x1 - x0, y1 - y0);
        const ux = (x1 - x0) / len;
        const uy = (y1 - y0) / len;
        let s = carry;
        for (; s < len - h; s += step) {
          const x = x0 + ux * s;
          const y = y0 + uy * s;
          ctx.beginPath();
          ctx.moveTo(x - ux * h - uy * h, y - uy * h + ux * h);
          ctx.lineTo(x, y);
          ctx.lineTo(x - ux * h + uy * h, y - uy * h - ux * h);
          ctx.stroke();
        }
        carry = Math.max(h, s - len);
      }
      // the lot: a parking square on its side of the road
      const lot = pts[pts.length - 1];
      const s = 9 * ik;
      ctx.fillStyle = "#3f5a8a";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2 * ik;
      ZSR.Draw.rr(ctx, lot[0] - s, lot[1] - s, s * 2, s * 2, 2 * ik);
      ctx.fill();
      ctx.stroke();
    },
    /** Numbered badges at each turn (the list on the side shows the same numbers), the lanes beside them up close. */
    drawBadges(ctx, L) {
      L.cards.forEach((cd) => {
        ctx.fillStyle = INK; // a comic drop shadow, like the board's buttons
        ctx.fillRect(cd.x0 + 2.5 * L.pxU, cd.y0 + 2.5 * L.pxU, cd.cw * cd.lanes.length, cd.ch);
        this.drawLanes(ctx, cd.x0, cd.y0, cd.cw, cd.ch, cd.lanes);
      });
      L.badges.forEach((b) => {
        const focus = this.focus === b.i;
        if (focus) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r * 1.9, 0, TAU);
          ctx.fillStyle = "rgba(217,162,27,0.45)";
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, TAU);
        ctx.fillStyle = b.step.lot ? "#3f5a8a" : INK;
        ctx.fill();
        ctx.lineWidth = b.r * 0.22;
        ctx.strokeStyle = b.step.lot ? INK : AMBER;
        ctx.stroke();
        ctx.fillStyle = b.step.lot ? PAPER3 : AMBER;
        ctx.font = FONT(b.r * 1.3);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(b.i + 1), b.x, b.y + b.r * 0.06);
      });
    },

    drawIcon(ctx, l, selected, hover, fx, k) {
      const S = State();
      const size = iconSize(l);
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.scale(k || 1, k || 1);
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
      ctx.fillStyle = PAPER3;
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
          ctx.fillStyle = i < l.danger ? (l.danger >= 4 ? "#b3261e" : AMBER) : PAPER3;
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
      ctx.restore();
    },
    /** A place's name on a paper tag where the layout put it (amber for the picked place). */
    drawName(ctx, n, L) {
      const p = L.pxU;
      ctx.save();
      ZSR.Draw.rr(ctx, n.x0, n.y0, n.x1 - n.x0, n.y1 - n.y0, 2.5 * p);
      ctx.fillStyle = n.id === this.selected ? "rgba(240,194,71,0.96)" : n.id === this.hover ? "rgba(246,236,205,0.97)" : "rgba(243,238,224,0.92)";
      ctx.fill();
      ctx.lineWidth = 1.2 * p;
      ctx.strokeStyle = "rgba(15,16,18,0.6)";
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.font = FONT(n.fs);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const cx = (n.x0 + n.x1) / 2;
      const top = (n.y0 + n.y1) / 2 - ((n.lines.length - 1) * n.lh) / 2;
      n.lines.forEach((t, i) => ctx.fillText(t, cx, top + i * n.lh + n.fs * 0.04));
      ctx.restore();
    },
  };

  ZSR.Map = Map;
})(typeof globalThis !== "undefined" ? globalThis : this);
