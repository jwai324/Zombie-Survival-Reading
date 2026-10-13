/* The city map: a hand-drawn board of streets, side streets and known locations, with
   street names. Pick a destination, see the route, drive (the road itself shows no route:
   plan it here, then read the signs). Names and side streets come from js/streets.js. */
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
      if (this.at === id && id !== "base" && S.trip) {
        const again = S.trip.rooms && S.trip.rooms[id];
        info.appendChild(el("p", "small muted", again ? "You are parked outside. Inside is just as you left it." : "You are parked at the door."));
        const go = el("button", "btn big go", again ? "Go back in" : "Go in");
        go.addEventListener("click", () => this.hooks.onEnter && this.hooks.onEnter(id));
        info.appendChild(go);
      } else if (this.at === id) info.appendChild(el("p", "small muted", "You are here."));
      else if (r) {
        // long routes are never squeezed below the road's minimum scale (lanes need time to read), so they can run past tripMaxSeconds
        const secs0 = Math.min(W().SETTINGS.tripMaxSeconds, Math.max(W().SETTINGS.tripMinSeconds, r.dist * W().SETTINGS.tripSecondsPerUnit));
        const secs = Math.round(ZSR.Streets ? Math.max(secs0, (r.dist * ZSR.Streets.GEOM.minScale) / ZSR.Streets.GEOM.baseSpeed) : secs0);
        info.appendChild(el("p", "small muted", "Drive: about " + secs + " seconds by road" + (loc.id === "base" ? ". Cargo is unloaded and the day ends." : ".")));
        // the way in words: the road shows no route, so the player reads this here, then the signs out there
        if (ZSR.Streets) {
          const St = ZSR.Streets;
          const name = (pid) => W().LOCATIONS.find((l) => l.id === pid).name;
          info.appendChild(el("h4", "route-head", esc(St.text("routeHead"))));
          const ol = el("ol", "route-steps");
          const steps = St.directions(r.path, (pid) => S.isKnown(pid), name);
          steps.forEach((line, i) => ol.appendChild(el("li", i === steps.length - 1 ? "last" : null, esc(line))));
          info.appendChild(ol);
        }
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
      // side streets: short stubs that go nowhere, drawn like the roads they leave. The roads of the
      // picked route are drawn and named whether the player knows their places or not (the signs name them).
      const St = ZSR.Streets;
      const route = this.selected && this.selected !== this.at ? this.route(this.at, this.selected) : null;
      const onRoute = new Set();
      if (route && St) for (let i = 0; i < route.path.length - 1; i++) onRoute.add(St.roadKey(route.path[i], route.path[i + 1]));
      const known = (a, b) => (S.isKnown(a) && S.isKnown(b)) || onRoute.has(a + "|" + b);
      if (St) {
        St.SIDE_STREETS.forEach((ss) => {
          const [a, b] = ss.road.split("|");
          const st = St.sideStub(ss);
          const kn = known(a, b);
          ctx.strokeStyle = kn ? "#5d636b" : "rgba(75,80,87,0.16)";
          ctx.lineWidth = kn ? 6 : 4;
          ctx.lineCap = "butt";
          ctx.beginPath();
          ctx.moveTo(st.x0, st.y0);
          ctx.lineTo(st.x1, st.y1);
          ctx.stroke();
          if (!kn) return;
          // the end: a bar for a dead end or a gate, a red cross for a closed road
          const ux = (st.x1 - st.x0) / St.GEOM.sideLen;
          const uy = (st.y1 - st.y0) / St.GEOM.sideLen;
          ctx.strokeStyle = ss.kind === "closed" ? "#b3261e" : INK;
          ctx.lineWidth = 3;
          ctx.beginPath();
          if (ss.kind === "closed") {
            ctx.moveTo(st.x1 - 5, st.y1 - 5);
            ctx.lineTo(st.x1 + 5, st.y1 + 5);
            ctx.moveTo(st.x1 + 5, st.y1 - 5);
            ctx.lineTo(st.x1 - 5, st.y1 + 5);
          } else {
            ctx.moveTo(st.x1 - uy * 7, st.y1 + ux * 7);
            ctx.lineTo(st.x1 + uy * 7, st.y1 - ux * 7);
          }
          ctx.stroke();
        });
        ctx.lineCap = "round";
      }
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
      // street names along the known roads and side streets, upright, on a paper halo,
      // each where it overlaps the fewest place icons, place names and other street names
      if (St) {
        const boxes = [];
        ctx.font = "700 15px Oswald, Impact, sans-serif";
        W().LOCATIONS.forEach((l) => {
          if (!S.isKnown(l.id)) return;
          const nw = ctx.measureText(l.name.toUpperCase()).width / 2 + 4;
          boxes.push([l.x - 28, l.y - 28, l.x + 28, l.y + 24], [l.x - nw, l.y + 28, l.x + nw, l.y + 48]);
        });
        const vanAt = pos[this.at];
        boxes.push([vanAt.x + 8, vanAt.y - 50, vanAt.x + 52, vanAt.y - 2]); // the van on the map
        const placed = [];
        const pts = (x, y, ang, w) => {
          const out = [];
          for (let i = 0; i <= 6; i++) out.push([x + Math.cos(ang) * (-w / 2 + (w * i) / 6), y + Math.sin(ang) * (-w / 2 + (w * i) / 6)]);
          return out;
        };
        const stubs = [];
        const segD = (x, y, s0) => {
          const dx = s0.x1 - s0.x0;
          const dy = s0.y1 - s0.y0;
          const t = Math.max(0, Math.min(1, ((x - s0.x0) * dx + (y - s0.y0) * dy) / (dx * dx + dy * dy)));
          return Math.hypot(x - s0.x0 - dx * t, y - s0.y0 - dy * t);
        };
        const cost = (ps, r, own) => {
          let c = 0;
          ps.forEach(([x, y]) => {
            boxes.forEach(([x0, y0, x1, y1]) => {
              if (x > x0 - r && x < x1 + r && y > y0 - r && y < y1 + r) c += 1;
            });
            stubs.forEach((st) => {
              if (st !== own && segD(x, y, st) < r + 3) c += 1;
            });
            placed.forEach(([px, py]) => {
              if (Math.hypot(px - x, py - y) < r * 2 + 2) c += 1;
            });
          });
          return c;
        };
        // label sizes follow the text size setting and how big the board is on screen (about 12 CSS px at normal)
        const kSize = { large: 1.3, huge: 2 }[document.documentElement.getAttribute("data-size")] || 1;
        const shown = this.canvas.getBoundingClientRect().width / 1000 || 0.8;
        const roadFs = Math.round(Math.max(13, Math.min(26, (12 * kSize) / shown)));
        const sideFs = Math.round(Math.max(12, Math.min(24, (11 * kSize) / shown)));
        const label = (text, cands, size, own, must) => {
          ctx.font = "700 " + size + "px Oswald, Impact, sans-serif";
          const w = ctx.measureText(text).width;
          let best = null;
          cands.forEach((c, i) => {
            const k = cost(pts(c.x, c.y, c.ang, w), size * 0.45, own) + i * 0.01;
            if (!best || k < best.k) best = { k, c };
          });
          if (!best || (best.k >= 3 && !must)) return false; // nowhere clear: leave it to the minimap and the signs (never for the route)
          let { x, y, ang } = best.c;
          placed.push(...pts(x, y, ang, w));
          if (ang > Math.PI / 2) ang -= Math.PI;
          if (ang < -Math.PI / 2) ang += Math.PI;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(ang);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.lineJoin = "round";
          ctx.lineWidth = 4;
          ctx.strokeStyle = "rgba(230,223,204,0.95)";
          ctx.strokeText(text, 0, 0);
          ctx.fillStyle = "#3a3d42";
          ctx.fillText(text, 0, 0);
          ctx.restore();
          return true;
        };
        St.SIDE_STREETS.forEach((ss) => {
          const [a, b] = ss.road.split("|");
          if (!known(a, b)) return;
          stubs.push(Object.assign(St.sideStub(ss), { ss }));
        });
        // the route's names first (always drawn), then the rest where they fit
        const roads = W().ROADS.filter(([a, b]) => known(a, b));
        const sides = stubs;
        const roadLabel = ([a, b]) => {
          const ang = Math.atan2(pos[b].y - pos[a].y, pos[b].x - pos[a].x);
          // where it fits along the road, a size smaller if it fits nowhere
          for (const size of [roadFs, roadFs - 2, roadFs - 4]) {
            const off0 = size * 0.6 + 6;
            const cands = [];
            [0.5, 0.44, 0.56, 0.38, 0.62, 0.32, 0.68, 0.26, 0.74, 0.2, 0.8].forEach((t) =>
              [off0, -off0, off0 + 6, -off0 - 6].forEach((off) => {
                const mx = pos[a].x + (pos[b].x - pos[a].x) * t;
                const my = pos[a].y + (pos[b].y - pos[a].y) * t;
                cands.push({ x: mx - Math.sin(ang) * off, y: my + Math.cos(ang) * off, ang });
              })
            );
            if (label(St.STREET_NAMES[a + "|" + b], cands, size, null, onRoute.has(a + "|" + b) && size === roadFs - 4)) return;
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
          for (const size of [sideFs, sideFs - 2, sideFs - 3]) {
            ctx.font = "700 " + size + "px Oswald, Impact, sans-serif";
            const w = ctx.measureText(ss.name).width;
            const off = size * 0.55 + 4;
            // beside the stub, then running on past its end, then along the road it leaves on that side
            const cands = [off, -off].map((o) => ({ x: (st.x0 + st.x1) / 2 - uy * o, y: (st.y0 + st.y1) / 2 + ux * o, ang }));
            cands.push({ x: st.x1 + ux * (w / 2 + 6), y: st.y1 + uy * (w / 2 + 6), ang });
            [1, -1].forEach((dir) => {
              const along = dir * (w / 2 + 8);
              cands.push({ x: st.x0 + (rx / rl) * along + ux * (off + 4), y: st.y0 + (ry / rl) * along + uy * (off + 4), ang: rang });
            });
            if (label(ss.name, cands, size, st, onRoute.has(ss.road) && size === sideFs - 3)) return;
          }
        };
        roads.filter(([a, b]) => onRoute.has(a + "|" + b)).forEach(roadLabel);
        sides.filter((st) => onRoute.has(st.ss.road)).forEach(sideLabel);
        roads.filter(([a, b]) => !onRoute.has(a + "|" + b)).forEach(roadLabel);
        sides.filter((st) => !onRoute.has(st.ss.road)).forEach(sideLabel);
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
