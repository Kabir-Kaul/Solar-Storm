"use strict";
/* =====================================================================
   SCRAMBLE WORLD: walk around the station, find supplies, play a
   mini-game for each one. Replaces the old "tap items" scramble screen.
   Load AFTER app.js. It overrides ACTIONS.scramble and reuses S, ITEMS,
   seal(), Sound, show(), $, esc, etc. from app.js.
   ===================================================================== */

/* How much longer the timer is than the real-data scramble time.
   Walking + mini-games need more than 20-60 s. Set to 1 for the original timing. */
const SCRAMBLE_TIME_MULT = 4;

const ScrambleWorld = (() => {
  const W = 960, H = 600;
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- MAP ---------- */
  const ROOMS = [
    { id: "storage",  name: "STORAGE CLOSET", x: 20,  y: 20,  w: 280, h: 200, top: true,  floor: "#1a2547" },
    { id: "galley",   name: "GALLEY",         x: 340, y: 20,  w: 280, h: 200, top: true,  floor: "#1d2a4a" },
    { id: "lab",      name: "SCIENCE LAB",    x: 660, y: 20,  w: 280, h: 200, top: true,  floor: "#172a40" },
    { id: "eng",      name: "ENGINEERING",    x: 20,  y: 380, w: 280, h: 200, top: false, floor: "#1f2442" },
    { id: "quarters", name: "CREW QUARTERS",  x: 340, y: 380, w: 280, h: 200, top: false, floor: "#232547" },
    { id: "med",      name: "MED BAY",        x: 660, y: 380, w: 280, h: 200, top: false, floor: "#1a2d45" }
  ];
  ROOMS.forEach(r => { r.wy0 = r.top ? r.y + 40 : r.y; r.wy1 = r.top ? r.y + r.h : r.y + r.h - 40; });
  const CORRIDOR = { x: 20, y: 250, w: 920, h: 100 };
  const WALK = [];
  ROOMS.forEach(r => {
    WALK.push({ x: r.x + 12, y: r.wy0, w: r.w - 24, h: r.wy1 - r.wy0 });
    const cx = r.x + r.w / 2;
    r.door = r.top ? { x: cx - 35, y: 218, w: 70, h: 34 } : { x: cx - 35, y: 348, w: 70, h: 34 };
    WALK.push(r.door);
  });
  WALK.push(CORRIDOR);
  const inWalk = (px, py) => WALK.some(r => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
  const HATCH = { x: 920, y: 300 };

  /* Where each item lives. ids match ITEMS in app.js */
  const SPOTS = {
    water1:     { x: 70,  y: 150, label: "Supply cabinet" },
    co2:        { x: 240, y: 150, label: "Filter locker" },
    food1:      { x: 390, y: 150, label: "Food shelf" },
    water2:     { x: 480, y: 150, label: "Galley closet" },
    food2:      { x: 570, y: 150, label: "Food shelf" },
    science:    { x: 800, y: 150, label: "Sample locker" },
    dosimeters: { x: 70,  y: 505, label: "Broken dosimeter" },
    batteries:  { x: 240, y: 505, label: "Battery bin" },
    blankets:   { x: 480, y: 505, label: "Blanket locker" },
    medkit:     { x: 800, y: 505, label: "Medical cabinet" }
  };
  const TITLES = {
    water1: "Which bottles are water?", water2: "Which bottles are water?",
    food1: "Sort the food packs", food2: "Sort the food packs",
    dosimeters: "Fix the dosimeter", blankets: "Fold the thermal blanket",
    co2: "Dust off the air filters", batteries: "Sort the batteries",
    medkit: "Pack the medkit", science: "Pack Mei's sample kit"
  };

  /* ---------- STATE ---------- */
  let cv, g, raf = null, keys = new Set(), player, start, total, lost, mg = null, lastT = 0, promptText = "", toastT = null;
  let keyDown = null, keyUp = null, blur = null;

  const inBag = (id) => S.bag.includes(id);
  const itemOf = (id) => ITEMS.find(x => x.id === id);
  const canCarry = (id) => SR() ? cartKg() + itemOf(id).kg <= CART_KG : S.bag.length < BAG_SLOTS;
  const alive = () => S && !S.inShelter && cv && cv.isConnected;

  /* =====================================================================
     START / STOP
     ===================================================================== */
  function begin() {
    stop();
    total = S.d.scrambleSeconds * SCRAMBLE_TIME_MULT;
    S.timeLeft = total; lost = 0; mg = null;
    show(`
    <section class="sw">
      <div class="sw-top">
        <div>
          <h2>${SR() ? "Load the airlock cart" : "Grab supplies!"}</h2>
          <div class="muted small">Move with <b>WASD</b> or the <b>arrow keys</b>. Press <b>E</b> or <b>Space</b> next to a glowing item to start its mini-game. ${SR() ? `The cart carries <b class="mono">${CART_KG} kg</b>.` : `You can carry <b>${BAG_SLOTS}</b> things.`} Whatever you leave behind is out of reach until the storm ends.</div>
        </div>
        <div class="sw-timer" id="sw-timer" aria-live="off">${Math.ceil(total)}</div>
      </div>
      <div class="sw-grid">
        <div class="sw-stage">
          <canvas id="sw-canvas" width="${W}" height="${H}" aria-label="Space station map. Walk to the glowing items."></canvas>
          <div id="sw-prompt" class="sw-prompt" hidden></div>
          <div id="sw-toast" class="sw-toast"></div>
          <div id="sw-mg" class="sw-mg" hidden></div>
        </div>
        <aside class="panel bag">
          <h3>${SR() ? "🛒 Airlock cart" : "🎒 Your bag"}</h3>
          <div id="sw-bag"></div>
          <div id="sw-stats"></div>
          <button class="btn big primary" data-act="seal">🚪 Seal the shelter!</button>
          <div class="muted small">Or walk to the <b>bunker hatch</b> at the right end of the hallway. Tap an item in your bag to put it back.</div>
        </aside>
      </div>
    </section>`);
    cv = $("#sw-canvas"); g = cv.getContext("2d");
    player = { x: 480, y: 300, face: "d", moving: false };
    start = performance.now(); lastT = start;
    keyDown = (e) => {
      const k = e.code;
      const mv = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"];
      if (!alive() || mg || !$("#modal").hidden) return;
      if (mv.includes(k)) { keys.add(k); e.preventDefault(); }
      else if (k === "KeyE" || k === "Space" || k === "Enter") { e.preventDefault(); if (!e.repeat) interact(); }
    };
    keyUp = (e) => keys.delete(e.code);
    blur = () => keys.clear();
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    window.addEventListener("blur", blur);
    $("#sw-bag").addEventListener("click", (e) => {
      const b = e.target.closest("[data-drop]"); if (!b || mg) return;
      const id = b.dataset.drop, i = S.bag.indexOf(id);
      if (i >= 0) { S.bag.splice(i, 1); Sound.drop(); toast(`Put ${itemOf(id).name} back`); refreshBag(); }
    });
    refreshBag();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf); raf = null;
    if (keyDown) { document.removeEventListener("keydown", keyDown); keyDown = null; }
    if (keyUp) { document.removeEventListener("keyup", keyUp); keyUp = null; }
    if (blur) { window.removeEventListener("blur", blur); blur = null; }
    keys.clear();
    if (mg) { mg.timers.forEach(clearTimeout); mg.clean.forEach(f => { try { f(); } catch (e) {} }); mg = null; }
  }

  /* =====================================================================
     LOOP
     ===================================================================== */
  function frame(now) {
    if (!alive()) { stop(); return; }
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    const remaining = total - (now - start) / 1000 - lost;
    S.timeLeft = Math.max(0, remaining);
    if (remaining <= 0) { stop(); seal(true); return; }
    if (!mg) move(dt);
    draw(now / 1000);
    const tn = $("#sw-timer");
    if (tn) { tn.textContent = Math.ceil(remaining); tn.classList.toggle("low", remaining <= 10); }
    raf = requestAnimationFrame(frame);
  }
  function move(dt) {
    let dx = 0, dy = 0;
    if (keys.has("ArrowLeft") || keys.has("KeyA")) dx -= 1;
    if (keys.has("ArrowRight") || keys.has("KeyD")) dx += 1;
    if (keys.has("ArrowUp") || keys.has("KeyW")) dy -= 1;
    if (keys.has("ArrowDown") || keys.has("KeyS")) dy += 1;
    player.moving = !!(dx || dy);
    if (player.moving) {
      const len = Math.hypot(dx, dy), sp = 175 * dt;
      const nx = player.x + dx / len * sp, ny = player.y + dy / len * sp;
      const free = (x, y) => inWalk(x - 9, y + 2) && inWalk(x + 9, y + 2) && inWalk(x - 9, y + 14) && inWalk(x + 9, y + 14);
      if (free(nx, player.y)) player.x = nx;
      if (free(player.x, ny)) player.y = ny;
      player.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "r" : "l") : (dy > 0 ? "d" : "u");
    }
    // prompt
    const n = nearTarget();
    const txt = n ? (n.hatch ? "Press E: seal the shelter" : `Press E: ${n.label}`) : "";
    const p = $("#sw-prompt");
    if (p && txt !== promptText) { promptText = txt; p.textContent = txt; p.hidden = !txt; }
  }
  function nearTarget() {
    let best = null, bd = 50;
    for (const id in SPOTS) {
      if (inBag(id)) continue;
      const s = SPOTS[id], d = Math.hypot(player.x - s.x, player.y - s.y);
      if (d < bd) { bd = d; best = { id, label: s.label + " · " + itemOf(id).name }; }
    }
    if (Math.hypot(player.x - HATCH.x, player.y - HATCH.y) < 46) return { hatch: true };
    return best;
  }
  function interact() {
    const n = nearTarget(); if (!n) return;
    if (n.hatch) { stop(); seal(false); return; }
    if (!canCarry(n.id)) {
      toast(SR() ? "The cart is too heavy! Put something back." : "Your bag is full! Tap an item in your bag to put it back.");
      Sound.bad(); return;
    }
    Sound.click();
    openMG(n.id);
  }

  /* =====================================================================
     DRAWING
     ===================================================================== */
  function rr(c, x, y, w, h, r) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); c.fill(); c.stroke && 0; }
  function draw(t) {
    g.clearRect(0, 0, W, H);
    g.fillStyle = "#070b1a"; g.fillRect(0, 0, W, H);
    // corridor
    g.fillStyle = "#121a38"; g.fillRect(CORRIDOR.x, CORRIDOR.y, CORRIDOR.w, CORRIDOR.h);
    g.strokeStyle = "#ffb020"; g.setLineDash([14, 12]); g.lineWidth = 3;
    g.beginPath(); g.moveTo(40, 300); g.lineTo(900, 300); g.stroke(); g.setLineDash([]);
    // rooms
    ROOMS.forEach(r => {
      g.fillStyle = r.floor; g.fillRect(r.x, r.y, r.w, r.h);
      decor(r, t);
      g.strokeStyle = "#2f3f7a"; g.lineWidth = 5; g.strokeRect(r.x, r.y, r.w, r.h);
      g.fillStyle = "#8fa0c8"; g.font = "9px 'Press Start 2P', monospace"; g.textAlign = "left"; g.textBaseline = "alphabetic";
      g.fillText(r.name, r.x + 12, r.top ? r.y + 17 : r.y + r.h - 12);
    });
    // doors (cover the wall outline)
    ROOMS.forEach(r => { g.fillStyle = "#121a38"; g.fillRect(r.door.x, r.top ? r.door.y : r.door.y + 4, r.door.w, r.door.h - 4); });
    // hatch
    g.fillStyle = "#2a3768"; g.fillRect(HATCH.x - 18, 258, 36, 84);
    g.fillStyle = "#ffb020"; g.fillRect(HATCH.x - 18, 258, 6, 84);
    g.beginPath(); g.arc(HATCH.x + 2, 300, 22, 0, 6.3); g.fillStyle = "#18234d"; g.fill(); g.strokeStyle = "#ffb020"; g.lineWidth = 4; g.stroke();
    g.fillStyle = "#ffb020"; g.font = "8px 'Press Start 2P', monospace"; g.textAlign = "center"; g.fillText("BUNKER", HATCH.x, 252);
    // items + indicators
    let target = null, td = 1e9;
    for (const id in SPOTS) {
      if (inBag(id)) continue;
      const s = SPOTS[id], it = itemOf(id), d = Math.hypot(player.x - s.x, player.y - s.y);
      if (d < td) { td = d; target = s; }
      const pulse = Math.sin(t * 4 + s.x), near = d < 50;
      g.beginPath(); g.arc(s.x, s.y, 24 + pulse * 4 + (near ? 5 : 0), 0, 6.3);
      g.fillStyle = near ? "rgba(255,210,63,.45)" : "rgba(255,176,32,.22)"; g.fill();
      g.strokeStyle = near ? "#ffd23f" : "rgba(255,176,32,.7)"; g.lineWidth = 2; g.stroke();
      g.font = "28px 'Segoe UI Emoji','Apple Color Emoji',serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#fff";
      g.fillText(it.icon, s.x, s.y + Math.sin(t * 3 + s.y) * 2);
      // bouncing arrow
      const by = s.y - 40 + Math.sin(t * 5 + s.x) * 4;
      g.fillStyle = "#ffd23f"; g.beginPath(); g.moveTo(s.x - 8, by - 8); g.lineTo(s.x + 8, by - 8); g.lineTo(s.x, by + 4); g.closePath(); g.fill();
      // name tag
      g.font = "8px 'Press Start 2P', monospace"; g.textBaseline = "alphabetic";
      const label = it.name, tw = g.measureText(label).width + 12;
      g.fillStyle = "rgba(6,10,24,.85)"; g.fillRect(s.x - tw / 2, s.y + 28, tw, 16);
      g.fillStyle = "#ffe2a3"; g.fillText(label, s.x, s.y + 40);
    }
    // player + compass arrow to nearest item
    if (target && td > 90) {
      const a = Math.atan2(target.y - player.y, target.x - player.x);
      g.save(); g.translate(player.x + Math.cos(a) * 34, player.y + Math.sin(a) * 34); g.rotate(a);
      g.fillStyle = "#3fd9c4"; g.beginPath(); g.moveTo(10, 0); g.lineTo(-6, -7); g.lineTo(-6, 7); g.closePath(); g.fill(); g.restore();
    }
    drawAstro(player.x, player.y, player.face, player.moving, t);
  }
  function decor(r, t) {
    const x = r.x, y = r.y, w = r.w, h = r.h;
    const box = (a, b, cw, ch, c) => { g.fillStyle = c; g.fillRect(a, b, cw, ch); };
    if (r.id === "storage") { for (let i = 0; i < 4; i++) { box(x + 12 + i * 68, y + 24, 60, 14, "#2d3a66"); box(x + 18 + i * 68, y + 26, 14, 10, "#7a5a3a"); box(x + 38 + i * 68, y + 28, 12, 8, "#5a7a9a"); } }
    if (r.id === "galley") { box(x + 12, y + 24, w - 24, 14, "#3a4a78"); for (let i = 0; i < 3; i++) { g.fillStyle = "#1a2040"; g.beginPath(); g.arc(x + 50 + i * 36, y + 31, 6, 0, 6.3); g.fill(); } box(x + 180, y + 26, 70, 10, "#8a93ad"); }
    if (r.id === "lab") { box(x + 12, y + 24, w - 24, 14, "#2f5470"); [["#3fd9c4", 40], ["#ff8ad8", 90], ["#ffd23f", 140], ["#6aa8ff", 200]].forEach(([c, o]) => box(x + o, y + 12, 10, 14, c)); }
    if (r.id === "eng") { box(x + 12, y + h - 36, w - 24, 22, "#2a3262"); for (let i = 0; i < 9; i++) { g.fillStyle = Math.sin(t * 3 + i) > 0 ? "#4fdc7c" : "#ff5a5f"; g.beginPath(); g.arc(x + 30 + i * 28, y + h - 25, 4, 0, 6.3); g.fill(); } }
    if (r.id === "quarters") { for (let i = 0; i < 3; i++) { box(x + 16 + i * 88, y + h - 36, 76, 22, "#3a3f78"); box(x + 20 + i * 88, y + h - 34, 24, 18, "#c86b9b"); } }
    if (r.id === "med") { for (let i = 0; i < 2; i++) box(x + 16 + i * 100, y + h - 36, 86, 22, "#3a5a78"); box(x + w - 56, y + h - 40, 36, 28, "#e6ecfa"); box(x + w - 42, y + h - 36, 8, 20, "#e0383e"); box(x + w - 48, y + h - 30, 20, 8, "#e0383e"); }
  }
  function drawAstro(x, y, face, moving, t) {
    const bob = moving ? Math.sin(t * 14) * 1.6 : 0, step = moving ? Math.sin(t * 14) * 4 : 0;
    g.save(); g.translate(x, y + bob);
    g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.ellipse(0, 17 - bob, 13, 5, 0, 0, 6.3); g.fill();
    g.strokeStyle = "#8c98ba"; g.lineWidth = 1.5;
    // backpack
    g.fillStyle = "#aeb8d4";
    if (face === "r") rr(g, -18, -9, 11, 22, 4); else if (face === "l") rr(g, 7, -9, 11, 22, 4); else if (face === "d") rr(g, -13, -7, 26, 22, 5);
    // legs + boots
    g.fillStyle = "#dfe5f5"; rr(g, -8, 7, 7, 9 + step / 2, 3); rr(g, 1, 7, 7, 9 - step / 2, 3);
    g.fillStyle = "#ff8a3d"; rr(g, -9, 14 + step / 2, 9, 4, 2); rr(g, 0, 14 - step / 2, 9, 4, 2);
    // body
    g.fillStyle = "#f1f5ff"; rr(g, -10, -9, 20, 20, 6);
    if (face === "u") { g.fillStyle = "#aeb8d4"; rr(g, -8, -6, 16, 15, 4); }
    else { g.fillStyle = "#3fd9c4"; rr(g, -5, -3, 10, 6, 2); g.fillStyle = "#ff8a3d"; g.fillRect(-10, 6, 20, 3); }
    // arms
    g.fillStyle = "#f1f5ff"; rr(g, -15, -6 + step / 3, 6, 13, 3); rr(g, 9, -6 - step / 3, 6, 13, 3);
    // helmet
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(0, -17, 12, 0, 6.3); g.fill(); g.stroke();
    if (face !== "u") {
      const fx = face === "r" ? 3 : face === "l" ? -3 : 0, fy = face === "d" ? 1 : 0;
      g.fillStyle = "#1c2f63"; g.beginPath(); g.ellipse(fx, -17 + fy, face === "d" ? 8 : 6, 6.5, 0, 0, 6.3); g.fill();
      g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.ellipse(fx - 2, -19 + fy, 2.4, 1.6, 0, 0, 6.3); g.fill();
    }
    g.restore();
  }

  /* =====================================================================
     HUD
     ===================================================================== */
  function toast(msg) {
    const el = $("#sw-toast"); if (!el) return;
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 1700);
  }
  function refreshBag() {
    const box = $("#sw-bag"); if (!box) return;
    const btn = (id) => { const it = itemOf(id); return `<button class="slot full" data-drop="${id}" title="Put ${esc(it.name)} back" aria-label="Put ${esc(it.name)} back">${it.icon}</button>`; };
    if (SR()) {
      const kg = cartKg();
      box.innerHTML = `<div class="sys mono" style="margin-bottom:6px"><span>Load</span><span class="w">${kg} / ${CART_KG} kg</span></div>
        <div class="cart ${kg >= CART_KG ? "full" : ""}"><i style="width:${Math.min(100, kg / CART_KG * 100)}%"></i></div>
        <div class="bagicons" style="margin-top:8px">${S.bag.map(btn).join("") || '<span class="muted small">Empty</span>'}</div>`;
    } else {
      let s = ""; for (let i = 0; i < BAG_SLOTS; i++) s += S.bag[i] ? btn(S.bag[i]) : `<div class="slot" aria-hidden="true"></div>`;
      box.innerHTML = `<div class="slots">${s}</div>`;
    }
    const sup = 2 + S.bag.reduce((a, id) => a + (itemOf(id).supplies || 0), 0);
    const shield = S.bag.reduce((a, id) => a + itemOf(id).shield, 0);
    $("#sw-stats").innerHTML = `<div class="bagstat"><span>📦 Food & water</span><b>${sup} units (${Math.floor(sup / SUPPLY_USE_PER_DAY)} days)</b></div>
      <div class="bagstat"><span>🛡️ Shielding</span><b>${"▮".repeat(shield) || "none"}</b></div>
      <div class="muted small">The shelter already has a small emergency stash (2 units).</div>`;
  }
  function collect(id) {
    if (inBag(id) || !canCarry(id)) return;
    S.bag.push(id); Sound.grab(); refreshBag(); toast(`Got the ${itemOf(id).name}!`);
  }

  /* =====================================================================
     MINI-GAME FRAMEWORK
     ===================================================================== */
  function openMG(id) {
    if (mg) return;
    const it = itemOf(id), root = $("#sw-mg");
    keys.clear();
    root.hidden = false;
    root.innerHTML = `<div class="mgpanel" id="mgpanel"><div class="mghead"><h3>${it.icon} ${esc(TITLES[id])}</h3><button class="btn" id="mg-x">✕ Leave</button></div>
      <div class="mgbody" id="mg-body"></div><div class="mgfoot muted small">⏱ The clock keeps ticking. Mistakes cost time!</div></div>`;
    mg = { id, timers: [], clean: [], done: false };
    const c = {
      later(fn, ms) { const t = setTimeout(fn, ms); mg && mg.timers.push(t); return t; },
      cleanup(fn) { mg && mg.clean.push(fn); },
      toast,
      penalty(sec, msg) {
        lost += sec; Sound.bad(); toast(`${msg} −${sec}s`);
        const p = $("#mgpanel"); if (p) { p.classList.remove("hit"); void p.offsetWidth; p.classList.add("hit"); }
      },
      win() {
        if (!mg || mg.done) return; mg.done = true; Sound.good();
        const p = $("#mgpanel"); if (p) p.insertAdjacentHTML("beforeend", `<div class="mgwin">✅ Done!</div>`);
        c.later(() => { closeMG(); collect(id); }, 800);
      }
    };
    $("#mg-x").onclick = closeMG;
    const builder = GAMES[id];
    builder($("#mg-body"), c);
  }
  function closeMG() {
    if (!mg) return;
    mg.timers.forEach(clearTimeout); mg.clean.forEach(f => { try { f(); } catch (e) {} });
    mg = null;
    const root = $("#sw-mg"); if (root) { root.hidden = true; root.innerHTML = ""; }
    keys.clear();
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && mg && $("#modal").hidden) closeMG(); });

  /* ---------- generic click-to-sort game (food, batteries) ---------- */
  function gameSort(box, c, cfg) {
    const items = shuffle(cfg.items.map((x, i) => ({ ...x, i })));
    let sel = null, left = items.length;
    box.innerHTML = `<p class="mgp">${cfg.intro}</p>
      <div class="tray">${items.map(it => `<button class="pack" data-i="${it.i}">${it.html}</button>`).join("")}</div>
      <div class="bins">${cfg.bins.map(b => `<button class="bin" data-b="${b.id}"><span class="bi">${b.icon}</span><b>${b.label}</b><span class="bc">0 / ${cfg.items.filter(x => x.bin === b.id).length}</span></button>`).join("")}</div>`;
    const packs = () => box.querySelectorAll(".pack");
    packs().forEach(p => p.onclick = () => { packs().forEach(q => q.classList.remove("sel")); p.classList.add("sel"); sel = p; Sound.click(); });
    box.querySelectorAll(".bin").forEach(b => b.onclick = () => {
      if (!sel) { c.toast("Pick an item first"); return; }
      const it = items.find(x => String(x.i) === sel.dataset.i);
      if (it.bin === b.dataset.b) {
        sel.remove(); sel = null; left--; Sound.grab();
        const bc = b.querySelector(".bc"), [n, m] = bc.textContent.split(" / "); bc.textContent = `${+n + 1} / ${m}`;
        if (!left) c.win();
      } else {
        c.penalty(3, "Wrong bin!");
        b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
      }
    });
  }

  /* ---------- generic drag-to-kit game (medkit, samples) ---------- */
  function gameCollect(box, c, cfg) {
    const pos = shuffle([[4, 6], [28, 6], [52, 6], [76, 6], [4, 52], [28, 52], [52, 52], [76, 52]]);
    const items = shuffle(cfg.items);
    const need = items.filter(x => x.hl).length;
    let got = 0;
    box.innerHTML = `<p class="mgp" id="cintro">${cfg.door ? cfg.doorIntro : cfg.intro}</p>
      <div class="cwrap"><div class="shelf" id="shelf">
        ${items.map((it, i) => `<div class="it ${it.hl ? "hl" : ""}" style="left:${pos[i][0]}%;top:${pos[i][1]}%"><span class="ie">${it.e}</span><span class="in">${it.n}</span></div>`).join("")}
        ${cfg.door ? `<div class="doors" id="doors"><div class="door dl">⚕</div><div class="door dr">⚕</div><div class="dhint">Click to open</div></div>` : ""}
      </div><div class="kit" id="kit"><div class="ke">${cfg.kitIcon}</div><b>${cfg.kitName}</b><div class="kc" id="kc">0 / ${need}</div><div class="kin" id="kin"></div></div></div>`;
    const shelf = $("#shelf", box), kit = $("#kit", box);
    if (cfg.door) {
      const d = $("#doors", box);
      d.onclick = () => { d.classList.add("open"); Sound.blip(); $("#cintro", box).innerHTML = cfg.intro; c.later(() => d.remove(), 600); };
    }
    const put = (el) => {
      el.dataset.done = 1; el.classList.add("gone"); got++; Sound.grab();
      $("#kin", box).insertAdjacentHTML("beforeend", `<span>${el.querySelector(".ie").textContent}</span>`);
      $("#kc", box).textContent = `${got} / ${need}`;
      if (got >= need) c.win();
    };
    shelf.querySelectorAll(".it").forEach(el => el.addEventListener("pointerdown", (e) => {
      if (el.dataset.done || shelf.querySelector(".doors")) return;
      if (!el.classList.contains("hl")) { c.penalty(2, "Not that one!"); el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); return; }
      e.preventDefault();
      const ghost = el.cloneNode(true); ghost.classList.add("ghost"); document.body.appendChild(ghost);
      const mv = (ev) => { ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px"; };
      mv(e); el.style.opacity = ".25";
      const sx = e.clientX, sy = e.clientY;
      c.cleanup(() => { ghost.remove(); window.removeEventListener("pointermove", mv); });
      const up = (ev) => {
        window.removeEventListener("pointermove", mv); ghost.remove(); el.style.opacity = "";
        const k = kit.getBoundingClientRect();
        const over = ev.clientX >= k.left && ev.clientX <= k.right && ev.clientY >= k.top && ev.clientY <= k.bottom;
        const click = Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6;
        if (over || click) put(el);
      };
      window.addEventListener("pointermove", mv);
      window.addEventListener("pointerup", up, { once: true });
    }));
  }

  /* =====================================================================
     THE EIGHT MINI-GAMES
     ===================================================================== */
  /* WATER: 6 silver bottles, 3 water, 3 toxic. Only the label tells you. */
  function gameWater(box, c) {
    const good = ["DRINKING WATER", "POTABLE H₂O", "PURIFIED WATER"], bad = ["COOLANT · TOXIC", "HYDRAZINE · TOXIC", "WASTE FLUID · TOXIC"];
    const bottles = shuffle([...good.map(t => ({ t, ok: true })), ...bad.map(t => ({ t, ok: false }))]);
    let found = 0;
    box.innerHTML = `<p class="mgp">All the bottles are silver! <b>Read the labels</b> and tap the <b>3 bottles of water</b>. Toxic liquid costs you time.</p>
      <div class="bottles">${bottles.map((b, i) => `<button class="bottle" data-i="${i}"><span class="cap"></span><span class="neck"></span><span class="bbody"><span class="lbl">${b.t}</span></span></button>`).join("")}</div>
      <div class="mgs" id="ws">Water found: 0 / 3</div>`;
    box.querySelectorAll(".bottle").forEach(el => el.onclick = () => {
      const b = bottles[+el.dataset.i]; el.disabled = true;
      if (b.ok) { el.classList.add("picked"); found++; Sound.grab(); $("#ws", box).textContent = `Water found: ${found} / 3`; if (found === 3) c.win(); }
      else { el.classList.add("bad"); c.penalty(4, "Toxic!"); }
    });
  }

  /* FOOD: sort 6 packs into Chicken / Beef / Pork (2 each) */
  function gameFood(box, c) {
    const P = (e, n, bin) => ({ bin, html: `<span class="pe">${e}</span><span class="pn">${n}</span>` });
    gameSort(box, c, {
      intro: "Tap a food pack, then tap the bin it belongs in. Each bin gets <b>2 packs</b>.",
      bins: [{ id: "chicken", icon: "🍗", label: "CHICKEN" }, { id: "beef", icon: "🥩", label: "BEEF" }, { id: "pork", icon: "🥓", label: "PORK" }],
      items: [P("🍗", "Chicken Curry", "chicken"), P("🍗", "Roast Chicken", "chicken"), P("🥩", "Beef Chili", "beef"), P("🥩", "Beef Stew", "beef"), P("🥓", "Pork Ribs", "pork"), P("🥓", "Pork Stew", "pork")]
    });
  }

  /* BATTERIES: AA vs solar-panel batteries */
  function gameBatteries(box, c) {
    const AA = (n) => ({ bin: "aa", html: `<span class="aa"><i></i><b>AA</b></span><span class="pn">${n}</span>` });
    const SO = (n) => ({ bin: "solar", html: `<span class="solar">☀<b>12V</b></span><span class="pn">${n}</span>` });
    gameSort(box, c, {
      intro: "Small <b>double-A</b> batteries go to the handheld tools. Big flat <b>solar-panel batteries</b> go to the power bin.",
      bins: [{ id: "aa", icon: "🔦", label: "DOUBLE-A (tools)" }, { id: "solar", icon: "☀️", label: "SOLAR PANEL" }],
      items: [AA("Double-A"), AA("AA Cell"), AA("Double-A"), SO("Panel Pack"), SO("Solar Cell"), SO("Panel Pack")]
    });
  }

  /* DOSIMETER: Among-Us-style wires. 3 colors, 6 ends, 3 pairs. */
  function gameWires(box, c) {
    const cols = [{ n: "red", c: "#ef4444" }, { n: "blue", c: "#3b82f6" }, { n: "yellow", c: "#facc15" }];
    const L = shuffle(cols), R = shuffle(cols), ys = [50, 130, 210];
    let svg = `<svg viewBox="0 0 480 260" class="wires" id="wsvg"><rect x="0" y="0" width="480" height="260" rx="10" fill="#0b1226" stroke="#2a3768" stroke-width="3"/><g id="wl"></g>`;
    L.forEach((w, i) => svg += `<rect x="14" y="${ys[i] - 15}" width="30" height="30" fill="#555d78"/><rect class="conn" data-side="L" data-c="${w.n}" data-col="${w.c}" x="40" y="${ys[i] - 10}" width="22" height="20" rx="3" fill="${w.c}"/>`);
    R.forEach((w, i) => svg += `<rect x="436" y="${ys[i] - 15}" width="30" height="30" fill="#555d78"/><rect class="conn" data-side="R" data-c="${w.n}" data-col="${w.c}" x="418" y="${ys[i] - 10}" width="22" height="20" rx="3" fill="${w.c}"/>`);
    svg += `</svg>`;
    box.innerHTML = `<p class="mgp">The dosimeter is broken! Drag from a wire end to the <b>matching color</b> on the other side to reconnect all <b>3 pairs</b>.</p>
      <div class="dsm" id="dsm">📟 ERR</div>${svg}`;
    const el = $("#wsvg", box), lines = $("#wl", box);
    let cur = null, done = 0;
    const pt = (e) => { const p = el.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(el.getScreenCTM().inverse()); };
    const ctr = (n) => [+n.getAttribute("x") + 11, +n.getAttribute("y") + 10];
    const mk = (col) => { const gx = document.createElementNS("http://www.w3.org/2000/svg", "g"); gx.style.pointerEvents = "none";
      gx.innerHTML = `<line stroke="#000" stroke-width="15" stroke-linecap="round"/><line stroke="${col}" stroke-width="9" stroke-linecap="round"/>`; lines.appendChild(gx); return gx; };
    const setL = (gx, x1, y1, x2, y2) => gx.querySelectorAll("line").forEach(l => { l.setAttribute("x1", x1); l.setAttribute("y1", y1); l.setAttribute("x2", x2); l.setAttribute("y2", y2); });
    el.addEventListener("pointerdown", (e) => {
      const n = e.target.closest(".conn"); if (!n || n.dataset.on) return;
      e.preventDefault(); el.setPointerCapture(e.pointerId);
      const [x, y] = ctr(n); cur = { n, g: mk(n.dataset.col), x, y }; setL(cur.g, x, y, x, y); Sound.click();
    });
    el.addEventListener("pointermove", (e) => { if (!cur) return; const p = pt(e); setL(cur.g, cur.x, cur.y, p.x, p.y); });
    el.addEventListener("pointerup", (e) => {
      if (!cur) return;
      const t = document.elementFromPoint(e.clientX, e.clientY), n = t && t.closest && t.closest(".conn");
      if (n && n !== cur.n && n.dataset.side !== cur.n.dataset.side && !n.dataset.on) {
        if (n.dataset.c === cur.n.dataset.c) {
          const [x2, y2] = ctr(n); setL(cur.g, cur.x, cur.y, x2, y2); n.dataset.on = cur.n.dataset.on = 1; Sound.grab();
          if (++done === 3) { $("#dsm", box).textContent = "📟 ONLINE · 0.00 µSv"; $("#dsm", box).classList.add("ok"); c.win(); }
        } else { c.penalty(2, "Wrong color!"); cur.g.remove(); }
      } else cur.g.remove();
      cur = null;
    });
  }

  /* BLANKET: watch the fold order, then press the squares in that order */
  function gameBlanket(box, c) {
    const seq = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 5);
    let pos = 0, ok = false;
    box.innerHTML = `<p class="mgp">Watch which squares fold, in order. Then press the same squares in the <b>same order</b>.</p>
      <div class="blanket" id="bl">${Array.from({ length: 9 }, (_, i) => `<button class="sq" data-i="${i}"></button>`).join("")}</div>
      <div class="mgs" id="bs"></div><div class="btn-row"><button class="btn" id="replay">↻ Show again (−2s)</button></div>`;
    const sq = () => [...box.querySelectorAll(".sq")];
    const status = (t) => { const s = $("#bs", box); if (s) s.textContent = t; };
    const play = () => {
      ok = false; pos = 0; sq().forEach(b => { b.classList.remove("done", "flash"); b.textContent = ""; }); status("👀 Watch the fold order…");
      seq.forEach((s, i) => {
        c.later(() => { const b = sq()[s]; b.classList.add("flash"); b.textContent = i + 1; Sound.blip(); }, 700 + i * 750);
        c.later(() => { const b = sq()[s]; b.classList.remove("flash"); b.textContent = ""; }, 700 + i * 750 + 520);
      });
      c.later(() => { ok = true; status(`Your turn! Fold square 1 of ${seq.length}`); }, 700 + seq.length * 750);
    };
    sq().forEach(b => b.onclick = () => {
      if (!ok) return;
      const i = +b.dataset.i;
      if (i === seq[pos]) { b.classList.add("done"); b.textContent = pos + 1; pos++; Sound.grab(); if (pos === seq.length) { ok = false; status("Folded neatly!"); c.win(); } else status(`Fold square ${pos + 1} of ${seq.length}`); }
      else { ok = false; c.penalty(3, "Wrong fold!"); c.later(play, 700); }
    });
    $("#replay", box).onclick = () => { c.penalty(2, "Peeked"); play(); };
    play();
  }

  /* AIR FILTERS: brush the dust off two filters */
  function gameFilters(box, c) {
    const CW = 560, CH = 240, R = [{ x: 20, y: 20, w: 250, h: 200 }, { x: 290, y: 20, w: 250, h: 200 }];
    box.innerHTML = `<p class="mgp">Hold the mouse button (or your finger) and <b>brush the dust</b> off both filters until they are clean.</p>
      <div class="fwrap" id="fw"><canvas id="fbase" width="${CW}" height="${CH}"></canvas><canvas id="fdust" width="${CW}" height="${CH}"></canvas><div class="brush" id="brush">🖌️</div></div>
      <div class="fbars"><div>Filter 1<div class="progressbar"><i id="fp0" style="width:0"></i></div></div><div>Filter 2<div class="progressbar"><i id="fp1" style="width:0"></i></div></div></div>`;
    const base = $("#fbase", box).getContext("2d"), dc = $("#fdust", box), d = dc.getContext("2d", { willReadFrequently: true });
    base.fillStyle = "#0d1530"; base.fillRect(0, 0, CW, CH);
    R.forEach((r, k) => {
      base.fillStyle = "#4a5578"; base.fillRect(r.x - 6, r.y - 6, r.w + 12, r.h + 12);
      for (let i = 0; i < r.w; i += 10) { base.fillStyle = (i / 10) % 2 ? "#cfd6e8" : "#aab3cc"; base.fillRect(r.x + i, r.y, 10, r.h); }
      d.fillStyle = "rgba(125,105,85,.93)"; d.fillRect(r.x - 6, r.y - 6, r.w + 12, r.h + 12);
      for (let i = 0; i < 400; i++) { d.fillStyle = `rgba(${70 + Math.random() * 90},${60 + Math.random() * 70},${45 + Math.random() * 60},${0.4 + Math.random() * 0.6})`; d.beginPath(); d.arc(r.x + Math.random() * r.w, r.y + Math.random() * r.h, 1 + Math.random() * 5, 0, 6.3); d.fill(); }
    });
    const pct = [0, 0];
    const measure = () => {
      R.forEach((r, k) => {
        const dat = d.getImageData(r.x, r.y, r.w, r.h).data; let dirty = 0, n = 0;
        for (let j = 0; j < r.h; j += 4) for (let i = 0; i < r.w; i += 4) { n++; if (dat[(j * r.w + i) * 4 + 3] > 30) dirty++; }
        pct[k] = 1 - dirty / n; $("#fp" + k, box).style.width = Math.round(pct[k] * 100) + "%";
      });
      if (pct[0] >= 0.95 && pct[1] >= 0.95) { down = false; c.win(); }
    };
    let down = false, last = null, lastM = 0;
    const pos = (e) => { const r = dc.getBoundingClientRect(); return [(e.clientX - r.left) * CW / r.width, (e.clientY - r.top) * CH / r.height, e.clientX - r.left, e.clientY - r.top]; };
    const brush = $("#brush", box);
    dc.addEventListener("pointerdown", (e) => { e.preventDefault(); dc.setPointerCapture(e.pointerId); down = true; last = null; stroke(e); });
    dc.addEventListener("pointermove", (e) => { const p = pos(e); brush.style.left = p[2] + "px"; brush.style.top = p[3] + "px"; if (down) stroke(e); });
    dc.addEventListener("pointerup", () => { down = false; last = null; measure(); });
    function stroke(e) {
      const [x, y] = pos(e);
      d.globalCompositeOperation = "destination-out"; d.lineWidth = 38; d.lineCap = "round";
      d.beginPath(); if (last) d.moveTo(last[0], last[1]); else d.moveTo(x, y); d.lineTo(x + 0.01, y); d.stroke();
      d.globalCompositeOperation = "source-over"; last = [x, y];
      const now = performance.now(); if (now - lastM > 140) { lastM = now; measure(); }
    }
  }

  /* MEDKIT: open the cabinet, drag the glowing items into the kit */
  function gameMedkit(box, c) {
    gameCollect(box, c, {
      door: true, kitIcon: "🧰", kitName: "MEDKIT",
      doorIntro: "Click the medical cabinet to open it.",
      intro: "Drag the <b>glowing</b> medical items into the medkit. (You can also just click them.)",
      items: [
        { e: "🩹", n: "Bandages", hl: true }, { e: "💊", n: "Pain pills", hl: true }, { e: "💉", n: "Syringe", hl: true }, { e: "🧴", n: "Antiseptic", hl: true },
        { e: "🧃", n: "Juice" }, { e: "🪥", n: "Toothbrush" }, { e: "🔦", n: "Flashlight" }, { e: "📎", n: "Paper clips" }
      ]
    });
  }

  /* MEI'S SAMPLE KIT: collect the glowing samples */
  function gameSamples(box, c) {
    gameCollect(box, c, {
      door: false, kitIcon: "🧪", kitName: "SAMPLE KIT",
      intro: "Drag the <b>glowing</b> Moon-dust samples into Mei's kit. (You can also just click them.)",
      items: [
        { e: "🪨", n: "Moon rock", hl: true }, { e: "🧪", n: "Dust vial", hl: true }, { e: "🧊", n: "Ice core", hl: true }, { e: "🔬", n: "Dust slide", hl: true },
        { e: "☕", n: "Coffee mug" }, { e: "🥄", n: "Spoon" }, { e: "🧦", n: "Sock" }, { e: "📎", n: "Paper clips" }
      ]
    });
  }

  const GAMES = {
    water1: gameWater, water2: gameWater, food1: gameFood, food2: gameFood,
    dosimeters: gameWires, blankets: gameBlanket, co2: gameFilters,
    batteries: gameBatteries, medkit: gameMedkit, science: gameSamples
  };

  return { begin, stop };
})();

/* Replace the old tap-to-grab scramble withthe walkable one */
ACTIONS.scramble = ScrambleWorld.begin;