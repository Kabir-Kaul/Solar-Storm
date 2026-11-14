"use strict";
/* =====================================================================
   SOLAR STORM: MOON BASE SURVIVAL
   Team Lychee · NASA Space Apps Challenge 2026
   Challenge: Build a Junior Astronaut Mission Trainer
   ===================================================================== */

/* ---------- CONFIG ---------- */
// Free key from https://api.nasa.gov (DEMO_KEY works but has tight limits).
const NASA_API_KEY = "JQrBKNDbh8HhNk7nfzNDqRTrzcrhdf8BCgG89PQC";
const LIGHT_DELAY_MS = 1300;          // real Earth–Moon light time, about 1.3 s
const SUPPLY_USE_PER_DAY = 2;
const BAG_SLOTS = 6;

/* ---------- REAL STORMS (saved from NASA DONKI and partner records) ---------- */
const STORMS = [
  {
    id: "sep-2023",
    name: "The Glancing Blow",
    dateText: "September 14, 2023",
    teaser: "A fast cloud from the Sun that mostly misses. A good first mission.",
    cmeSpeed: 915, cmeHalfAngle: 33,
    flareClass: null,
    hasSEP: false, sepText: "No particle storm was linked to this record",
    maxKp: 3, kpText: "NASA's model predicted only Kp 2–3 at Earth (a weak storm)",
    travelHours: 61, travelText: "NASA's model predicted a glancing blow about 2½ days after it left the Sun",
    record: "DONKI CME 2023-09-14T07:24:00-CME-001",
    realStory: [
      "On September 14, 2023, NASA's Moon to Mars Space Weather Analysis Office measured a cloud from the Sun (a CME) moving at about 915 km/s.",
      "Their computer model predicted it would only clip Earth: a “glancing blow” with a weak geomagnetic storm (Kp 2–3).",
      "Not every storm is a monster. Good crews match their response to the real danger instead of panicking."
    ],
    sources: [
      { label: "NASA DONKI: CME analysis for this storm", url: "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CMEAnalysis/26916/1" }
    ]
  },
  {
    id: "oct-2024",
    name: "The Bullseye Storm",
    dateText: "October 9, 2024",
    teaser: "A fast cloud aimed right at Earth and the Moon, with a radiation storm.",
    cmeSpeed: 1509, cmeHalfAngle: 45,
    flareClass: "X1.8", flarePeak: "01:56 UTC, October 9, 2024",
    hasSEP: true, sepText: "NASA's DONKI linked a solar particle event (a radiation storm)",
    maxKp: 8.67, kpText: "Kp 8.67: a severe geomagnetic storm on Earth",
    travelHours: 36.6, travelText: "It hit Earth on October 10 at 14:46 UTC, about 36½ hours after leaving the Sun (measured)",
    record: "DONKI CME 2024-10-09T02:12:00-CME-001 · Flare 2024-10-09T01:25:00-FLR-001",
    realStory: [
      "On October 9, 2024, the Sun fired an X1.8 flare from sunspot region 3848, peaking at 01:56 UTC.",
      "It launched a cloud (CME) at about 1,509 km/s, aimed almost straight at Earth. NASA's DONKI also linked a solar particle event to it.",
      "The cloud arrived on October 10 at 14:46 UTC, about 36½ hours later, and caused a severe geomagnetic storm (Kp 8.67)."
    ],
    sources: [
      { label: "NASA CCMC CME Scoreboard: speed, arrival time and Kp for this storm", url: "https://webtools.ccmc.gsfc.nasa.gov/CMEscoreboard/prediction/detail/3658" },
      { label: "NASA DONKI: CME record", url: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/CME/33873/-1" }
    ]
  },
  {
    id: "may-2024",
    name: "The May 2024 Superstorm",
    dateText: "May 10–11, 2024",
    teaser: "The strongest geomagnetic storm in over 20 years. Only for expert commanders.",
    cmeSpeed: 1512, cmeHalfAngle: null,
    flareClass: "X5.8", flarePeak: "01:23 UTC, May 11, 2024 (9:23 p.m. EDT on May 10)",
    hasSEP: true, sepText: "Radiation storm levels S1, with spikes to S2",
    maxKp: 9, kpText: "Kp 9 (G5 “extreme”): the strongest geomagnetic storm since 2003",
    travelHours: 28, travelText: "At about 1,500 km/s it would cross from the Sun to Earth in roughly 28 hours (estimate)",
    record: "Sunspot region 3664 · X5.8 flare · halo CME",
    realStory: [
      "In May 2024, sunspot region 3664 fired a series of huge flares. The X5.8 flare peaked at 01:23 UTC on May 11 (9:23 p.m. EDT on May 10).",
      "Its cloud (CME) left at about 1,500 km/s, joining earlier clouds already racing toward Earth.",
      "Together they caused a G5 (Kp 9) storm, the strongest since 2003, with auroras seen far from the poles and a radiation storm (S1 with spikes to S2)."
    ],
    sources: [
      { label: "NASA: How NASA Tracked the Most Intense Solar Storm in Decades", url: "https://science.nasa.gov/science-research/heliophysics/how-nasa-tracked-the-most-intense-solar-storm-in-decades" },
      { label: "Space Weather & Space Climate journal: CME speeds for May 2024 (Table 3)", url: "https://www.swsc-journal.org/articles/swsc/full_html/2025/01/swsc240088/T3.html" },
      { label: "SpaceWeatherLive: X5.8 flare and G5 storm report", url: "https://www.spaceweather.live/en/news/view/538/20240511-strongest-geomagnetic-storm-since-2003-x58-solar-flare.html" }
    ]
  }
];

const DONKI_URL = "https://ccmc.gsfc.nasa.gov/tools/DONKI";
const LINKS = {
  orion: { label: "NASA: How Orion crews build a radiation shelter", url: "https://www.nasa.gov/missions/artemis/orion/scientists-and-engineers-evaluate-orion-radiation-protection-plan/" },
  apollo13: { label: "NASA Apollo Flight Journal: building the Apollo 13 CO₂ adapter", url: "https://www.nasa.gov/history/afj/ap13fj/15day4-mailbox.html" },
  donki: { label: "NASA DONKI space weather database", url: DONKI_URL },
  may2024: { label: "NASA: the May 2024 solar storm", url: "https://science.nasa.gov/science-research/heliophysics/how-nasa-tracked-the-most-intense-solar-storm-in-decades" },
  doseRules: { label: "Space.com: how Artemis II crews would shelter from a solar storm", url: "https://www.space.com/space-exploration/artemis/how-the-artemis-2-astronauts-could-weather-a-solar-storm-during-their-moon-mission" }
};

/* ---------- CREW ---------- */
const CREW = [
  { id: "you",   name: "You",           role: "Commander",         color: "#ffb347", trait: "Everyone looks to you to make the call." },
  { id: "amara", name: "Amara Okafor",  role: "Base engineer",     color: "#3fd9c4", trait: "Fixes broken things twice as fast." },
  { id: "jonas", name: "Jonas Reyes",   role: "Lander pilot",      color: "#6aa8ff", trait: "Stays calm under pressure." },
  { id: "mei",   name: "Mei Lindqvist", role: "Scientist & medic", color: "#ff8ad8", trait: "Her Moon-dust experiment is the mission's big science goal." }
];

/* ---------- SCRAMBLE ITEMS ---------- */
const ITEMS = [
  { id: "water1", kg: 20, kind: "water", icon: "💧", name: "Water bags", desc: "4 days' worth of drinking water.", supplies: 4, shield: 3 },
  { id: "food1", kg: 12,  kind: "food",  icon: "🥫", name: "Food packs", desc: "3 days' worth of meals.", supplies: 3, shield: 2 },
  { id: "dosimeters", kg: 1, icon: "📟", name: "Dosimeters", desc: "Badges that measure each person's radiation dose.", shield: 0 },
  { id: "blankets", kg: 6, icon: "🧣", name: "Blankets", desc: "Warm and cozy.", shield: 2, extra: "+ a little shielding" },
  { id: "water2", kg: 20, kind: "water", icon: "💧", name: "Water bags", desc: "4 days' worth of drinking water.", supplies: 4, shield: 3 },
  { id: "co2", kg: 5, icon: "🌀", name: "Spare air filters", desc: "Fresh filters for the CO₂ scrubber.", shield: 0 },
  { id: "batteries", kg: 15, icon: "🔋", name: "Spare batteries", desc: "Extra power for the shelter.", shield: 1 },
  { id: "food2", kg: 12,  kind: "food",  icon: "🥫", name: "Food packs", desc: "3 days' worth of meals.", supplies: 3, shield: 2 },
  { id: "medkit", kg: 3, icon: "⛑️", name: "Medkit", desc: "Medicine and first aid. One use.", shield: 0 },
  { id: "science", kg: 8, icon: "🧪", name: "Mei's sample kit", desc: "Her Moon-dust experiment. Pure science!", shield: 0 }
];

/* ---------- GLOSSARY ---------- */
const TERMS = {
  flare: {
    j: ["Solar flare", "A bright burst on the Sun. Big flares can send extra energy and particles our way."],
    s: ["Solar flare", "A sudden burst of magnetic energy on the Sun. It releases light, X-rays and charged particles. Big flares can be followed by fast particle storms and CMEs."]
  },
  cme: {
    j: ["CME", "A huge cloud of hot gas and magnetic field from the Sun. It can reach the Moon in a day or a few days."],
    s: ["CME (coronal mass ejection)", "A huge cloud of magnetized plasma blasted from the Sun. Fast ones can reach Earth or the Moon in about 1 to 4 days."]
  },
  sep: {
    j: ["Solar particle event", "A stream of fast particles from the Sun. These can arrive before the big cloud and can be dangerous."],
    s: ["Solar particle event", "A burst of energetic protons and other particles accelerated by a flare or CME shock. They can arrive in minutes to hours and are a major radiation hazard."]
  },
  dose: {
    j: ["Radiation dose", "How much radiation your body gets. In the game, more dose means more risk."],
    s: ["Radiation dose", "How much ionizing radiation a person's body absorbs. In the game, it is shown as a dose score from 0 to 100 for easier play."]
  },
  shielding: {
    j: ["Shielding", "Anything between you and the particles. Water and food are good shields."],
    s: ["Shielding", "Material between you and the radiation. Hydrogen-rich materials like water, food and polyethylene slow particles down best."]
  },
  kp: {
    j: ["Kp index", "A number that tells how strong a geomagnetic storm is at Earth."],
    s: ["Kp index", "A 0–9 scale for how strongly Earth's magnetic field is disturbed by a storm. A high Kp means a bigger geomagnetic storm."]
  },
  dosimeter: {
    j: ["Dosimeter", "A small tool that measures radiation."],
    s: ["Dosimeter", "A sensor worn to measure how much radiation a person receives."]
  },
  co2: {
    j: ["CO₂ scrubber", "A filter that removes carbon dioxide from the air in a closed base."],
    s: ["CO₂ scrubber", "A device that removes carbon dioxide from the air. In a closed habitat, it keeps the air breathable and prevents CO₂ buildup."]
  },
  delay: {
    j: ["Signal delay", "Messages take time to travel through space. The Moon is about 1.3 seconds away."],
    s: ["Signal delay", "Radio signals travel at the speed of light. The Moon is about 1.3 seconds away, while Mars can be 3 to 22 minutes away one way."]
  },
  moon: {
    j: ["Why the Moon is risky", "The Moon has no air and no big magnetic field, so solar particles hit the surface directly."],
    s: ["Why the Moon is risky", "Earth has an atmosphere and a magnetic field that help protect it. The Moon has neither, so the surface is directly exposed to solar flares, CMEs and particle storms."]
  }
};
const T = (key, text) => `<button class="term" data-act="term" data-arg="${key}">${text}</button>`;

/* ---------- RANKS ---------- */
const ENDINGS = {
  commander: { title: "Mission Accomplished!", rank: "Mission Commander", icon: "🏆", medal: "", order: 4,
    line: "Your crew rode out the storm safely and finished the science. That's exactly what NASA trains for." },
  complete:  { title: "Mission Complete", rank: "Flight Lead", icon: "🚀", medal: "silver", order: 3,
    line: "You finished the mission, but some choices cost your crew more than they needed to." },
  safe:      { title: "Safe Return", rank: "Flight Lead", icon: "🛬", medal: "blue", order: 3,
    line: "You brought everyone home safely. The science will have to wait for another crew." },
  close:     { title: "Close Call", rank: "Junior Astronaut", icon: "⚠️", medal: "bronze", order: 2,
    line: "Someone got into danger, so Mission Control ordered an emergency return. Everyone made it home, but it was too close." },
  hard:      { title: "Hard Lesson", rank: "Cadet", icon: "📘", medal: "bronze", order: 1,
    line: "The crew ran out of what they needed and had to be rescued. Every expert started somewhere. Try a different plan!" }
};

/* =====================================================================
   HELPERS
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (x, x0, x1, y0, y1) => y0 + clamp((x - x0) / (x1 - x0), 0, 1) * (y1 - y0);
const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => Math.round(n).toLocaleString("en-US");
const store = {
  get(k, d) { try { const v = localStorage.getItem("solarstorm:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("solarstorm:" + k, JSON.stringify(v)); } catch (e) {} }
};
/* ---------- AGE MODE: Junior Astronaut (7-12) or Flight Director (13+) ---------- */
let MODE = store.get("mode", "junior");
const SR = () => MODE === "senior";
const CART_KG = 60;
function applyMode() {
  document.body.classList.toggle("mode-senior", SR());
  document.title = SR() ? "Solar Storm: Flight Director" : "Solar Storm: Moon Base Survival";
}
const doseLabel = (d) => SR() ? `${Math.round(d)}% of limit` : `${Math.round(d)}`;
let timers = [];
function later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
function clearTimers() { timers.forEach(clearTimeout); timers = []; if (scrambleTick) { clearInterval(scrambleTick); scrambleTick = null; } }

/* ---------- difficulty from real data ---------- */
function flareStrength(c) {
  if (!c) return { letter: "", mag: 0 };
  return { letter: c[0].toUpperCase(), mag: parseFloat(c.slice(1)) || 1 };
}
function derive(e) {
  const f = flareStrength(e.flareClass);
  const xMag = f.letter === "X" ? f.mag : 0;
  const kp = e.maxKp || 0;
  const d = {
    scrambleSeconds: Math.round(lerp(e.cmeSpeed || 500, 500, 2000, 60, 20)),
    radiationPerDay: xMag >= 5 ? 15 : xMag > 0 ? 10 : 5,
    shelterDays: e.hasSEP ? 5 : 3,
    doseMultiplier: e.hasSEP ? 1.5 : 1,
    commsEvents: kp >= 7 ? 2 : kp >= 5 ? 1 : 0,
    nearMissChance: (e.cmeHalfAngle != null && e.cmeHalfAngle < 30) ? 0.3 : 0
  };
  if (SR()) { d.scrambleSeconds = Math.round(d.scrambleSeconds * 0.75); d.radiationPerDay *= 1.1; }
  d.label = (xMag >= 5 || (e.hasSEP && kp >= 9)) ? "Extreme"
          : (xMag > 0 || (e.cmeSpeed || 0) >= 1000 || e.hasSEP) ? "Mission" : "Training";
  return d;
}
const tagClass = (label) => ({ Training: "tag-training", Mission: "tag-mission", Extreme: "tag-extreme" }[label] || "");

function band(dose) {
  if (dose >= 100) return { k: "crit", t: "Critical" };
  if (dose >= 70) return { k: "high", t: "High" };
  if (dose >= 40) return { k: "mid", t: "Rising" };
  return { k: "low", t: "Low" };
}

/* =====================================================================
   SOUND (made with the Web Audio API, no files needed)
   ===================================================================== */
const Sound = {
  on: store.get("sound", true), ctx: null,
  init() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
  },
  tone(f, d, type = "sine", v = 0.07, delay = 0) {
    if (!this.on) return; this.init(); if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(this.ctx.destination); o.start(t); o.stop(t + d + 0.05);
    } catch (e) {}
  },
  click() { this.tone(640, 0.06, "triangle", 0.05); },
  grab() { this.tone(520, 0.07, "triangle", 0.06); this.tone(780, 0.08, "triangle", 0.05, 0.06); },
  drop() { this.tone(400, 0.08, "triangle", 0.05); },
  good() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.18, "triangle", 0.06, i * 0.08)); },
  bad() { [330, 247].forEach((f, i) => this.tone(f, 0.28, "sawtooth", 0.035, i * 0.16)); },
  alarm() { for (let i = 0; i < 3; i++) { this.tone(880, 0.17, "square", 0.035, i * 0.4); this.tone(620, 0.17, "square", 0.035, i * 0.4 + 0.2); } },
  tick() { this.tone(1250, 0.03, "square", 0.02); },
  blip() { this.tone(1500, 0.05, "sine", 0.035); },
  seal() { this.tone(160, 0.35, "sawtooth", 0.05); this.tone(90, 0.4, "sine", 0.08, 0.05); }
};
function speakerSvg(on) {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 10h3l5-4v12l-5-4H5v-4Z" fill="${on ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M17.5 8.5a5 5 0 0 1 0 7M19.8 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      ${on ? "" : "<path d=\"M7 7l10 10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\"/>"}
    </svg>`;
}
function syncSoundBtn() {
  const b = $("#sound-toggle");
  if (!b) return;
  b.innerHTML = speakerSvg(Sound.on);
  b.setAttribute("aria-label", Sound.on ? "Turn sound off" : "Turn sound on");
}

/* =====================================================================
   BACKGROUND STARS
   ===================================================================== */
(function stars() {
  const c = $("#sky"), g = c.getContext("2d"); let pts = [];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function size() {
    c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio;
    c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
    pts = Array.from({ length: Math.round(innerWidth * innerHeight / 5000) }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height, r: (Math.random() * 1.3 + 0.3) * devicePixelRatio,
      p: Math.random() * 6.28, s: 0.3 + Math.random() * 1.2 }));
  }
  function draw(t) {
    g.clearRect(0, 0, c.width, c.height);
    const grd = g.createRadialGradient(c.width * 0.85, c.height * 0.1, 0, c.width * 0.85, c.height * 0.1, c.width * 0.6);
    grd.addColorStop(0, "rgba(60,40,120,.35)"); grd.addColorStop(1, "rgba(6,10,24,0)");
    g.fillStyle = grd; g.fillRect(0, 0, c.width, c.height);
    for (const s of pts) {
      const a = reduce ? 0.8 : 0.45 + 0.45 * Math.sin(s.p + t / 1000 * s.s);
      g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.28); g.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  addEventListener("resize", () => { size(); if (reduce) draw(0); });
  size(); reduce ? draw(0) : requestAnimationFrame(draw);
})();

/* =====================================================================
   ART
   ===================================================================== */
function avatar(c, size = 52, ringClass = "ring-unk", pct = 0) {
  const r = 29, circ = 2 * Math.PI * r;
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true" style="flex:none">
    <circle cx="32" cy="32" r="${r}" fill="none" stroke="#0a1028" stroke-width="5"/>
    <circle cx="32" cy="32" r="${r}" fill="none" class="${ringClass}" stroke-width="5" stroke-linecap="round"
      stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - clamp(pct, 0, 1))}" transform="rotate(-90 32 32)"/>
    <circle cx="32" cy="33" r="21" fill="#e6ecfa"/>
    <rect x="17" y="23" width="30" height="20" rx="10" fill="${c.color}"/>
    <rect x="21" y="26" width="10" height="5" rx="2.5" fill="#fff" opacity=".6"/>
    <rect x="28" y="12" width="8" height="5" rx="2" fill="#b8c3df"/>
  </svg>`;
}
function moonscape() {
  return `<svg class="moonscape" viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a90a6"/><stop offset="1" stop-color="#3a3f55"/></linearGradient></defs>
    <circle cx="980" cy="70" r="46" fill="#2f6fd6"/><path d="M955 55c15-8 30 5 22 18s-26 10-30 2 0-16 8-20zm40 25c10-3 22 6 16 15s-20 4-16-15z" fill="#4fbf6a"/>
    <path d="M940 60a46 46 0 0 0 80 30" stroke="#fff" stroke-opacity=".35" stroke-width="5" fill="none"/>
    <path d="M0 170 Q150 120 300 150 T600 140 T900 160 T1200 130 V260 H0Z" fill="url(#mg)"/>
    <ellipse cx="220" cy="205" rx="60" ry="12" fill="#2d3146" opacity=".7"/><ellipse cx="760" cy="215" rx="90" ry="16" fill="#2d3146" opacity=".6"/>
    <ellipse cx="1040" cy="190" rx="40" ry="8" fill="#2d3146" opacity=".7"/>
    <g transform="translate(470 118)"><rect x="0" y="22" width="120" height="34" rx="17" fill="#d8deef"/><rect x="18" y="6" width="56" height="30" rx="15" fill="#e9eefb"/>
    <rect x="96" y="-10" width="6" height="34" fill="#9aa6c4"/><rect x="78" y="-22" width="44" height="14" fill="#2b4a8a" stroke="#9aa6c4"/>
    <circle cx="30" cy="38" r="5" fill="#ffb347"/><circle cx="48" cy="38" r="5" fill="#ffb347"/></g>
  </svg>`;
}
/* The storm shelter picture: wall height shows how much shielding you built */
function shelterScene() {
  const wallUnits = S.locked + (S.wallBlankets ? 2 : 0);
  const blocks = [];
  for (let i = 0; i < Math.min(wallUnits, 12); i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const isBlanket = S.wallBlankets && i >= S.locked;
    blocks.push(`<rect x="${48 + col * 30}" y="${190 - row * 22}" width="27" height="19" rx="5" fill="${isBlanket ? "#c86b9b" : (i % 3 === 0 ? "#e2b26b" : "#4f9df0")}" stroke="#0a1028" stroke-width="2"/>`);
  }
  const rate = currentDoseRate();
  const rays = Array.from({ length: 9 }, (_, i) => {
    const y = 40 + i * 20, len = 18 + (i % 3) * 8;
    return `<line x1="${4}" y1="${y}" x2="${4 + len}" y2="${y + 3}" stroke="#ffb020" stroke-width="3" stroke-linecap="round" opacity="${clamp(rate / 12, 0.15, 1)}">
      <animate attributeName="x1" values="-30;40" dur="${1 + (i % 3) * 0.3}s" repeatCount="indefinite"/><animate attributeName="x2" values="-10;60" dur="${1 + (i % 3) * 0.3}s" repeatCount="indefinite"/></line>`;
  }).join("");
  const people = S.crew.map((c, i) => {
    const b = S.has.dosimeters ? band(c.dose) : { k: "unk" };
    return `<g transform="translate(${170 + i * 95} 120)">${avatarRaw(c, b.k)}<text x="32" y="98" text-anchor="middle" fill="#cfd7ef" font-size="14" font-family="Fredoka, sans-serif">${esc(c.id === "you" ? "You" : c.name.split(" ")[0])}</text></g>`;
  }).join("");
  const heatGlow = S.heat ? `<rect x="560" y="200" width="26" height="30" rx="4" fill="#ff7a1a" opacity=".85"/><text x="573" y="196" text-anchor="middle" font-size="12" fill="#ffb347">heat</text>`
                          : `<rect x="560" y="200" width="26" height="30" rx="4" fill="#33405f"/><text x="573" y="196" text-anchor="middle" font-size="12" fill="#8fa0c8">off</text>`;
  const radio = S.comms ? `<circle cx="600" cy="40" r="5" fill="#3fd9c4"><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle>`
                        : `<circle cx="600" cy="40" r="5" fill="#5a2a3a"/>`;
  return `<svg class="scene" viewBox="0 0 640 260" role="img" aria-label="Your crew inside the storm shelter. The wall of supplies on the left blocks radiation.">
    <rect x="0" y="0" width="640" height="260" fill="#0a1028"/>
    <rect x="36" y="20" width="590" height="225" rx="26" fill="#18234d" stroke="#2a3768" stroke-width="4"/>
    <rect x="36" y="232" width="590" height="13" fill="#232f5e"/>
    ${rays}
    ${blocks.join("")}
    ${people}
    ${heatGlow}
    <text x="588" y="44" font-size="12" fill="#8fa0c8" text-anchor="end">radio</text>${radio}
    <text x="50" y="40" font-size="13" fill="#ffb347" font-family="Fredoka, sans-serif">☀ Sun's particles →</text>
  </svg>`;
}
function avatarRaw(c, k) {
  const color = { low: "#4fdc7c", mid: "#ffd23f", high: "#ff7a1a", crit: "#ff5a5f", unk: "#56608a" }[k];
  return `<circle cx="32" cy="40" r="30" fill="none" stroke="${color}" stroke-width="5"/>
    <circle cx="32" cy="40" r="23" fill="#e6ecfa"/><rect x="15" y="29" width="34" height="22" rx="11" fill="${c.color}"/>
    <rect x="20" y="32" width="11" height="5" rx="2.5" fill="#fff" opacity=".6"/>`;
}

/* =====================================================================
   SCREEN + EVENTS
   ===================================================================== */
const screenEl = $("#screen");
let suppressShowFade = false;
let modeSwitchTransitioning = false;
function show(html) {
  clearTimers();
  screenEl.innerHTML = `<div class="${suppressShowFade ? "" : "fade-in"}">${html}</div>`;
  window.scrollTo({ top: 0 });
  const h = screenEl.querySelector("h1, h2");
  if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  updateHud();
  if (!screenEl.querySelector('.title-screen')) $("#home-btn").hidden = false;
}
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-act]");
  if (!t || t.disabled) return;
  const fn = ACTIONS[t.dataset.act];
  if (!fn) return;
  if (!["grab", "sound"].includes(t.dataset.act)) Sound.click();
  fn(t.dataset.arg, t);
});
document.addEventListener("input", (e) => {
  const t = e.target;
  if (t.id === "wallN") { $("#wn").textContent = t.value; $("#wproj").innerHTML = wallProjHTML(+t.value); }
  if (t.closest && t.closest(".eng") && t.type === "checkbox") { const pp = $("#pproj"); if (pp) pp.innerHTML = powerProjHTML(); }
  if (t.dataset && t.dataset.w && typeof WIDGETS !== "undefined" && WIDGETS[t.dataset.w]) WIDGETS[t.dataset.w].update(t.closest(".widget"));
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#modal").hidden) closeModal(); });
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });

let lastFocus = null;
function openModal(html) {
  lastFocus = document.activeElement;
  $("#modal-box").innerHTML = html + `<div class="btn-row"><button class="btn" data-act="closeModal">Close</button></div>`;
  $("#modal").hidden = false; $("#modal-box button:last-of-type").focus();
}
function closeModal() { $("#modal").hidden = true; if (lastFocus) lastFocus.focus(); }

/* ---------- Mission Control message with real light delay ---------- */
function missionControl(el, text, opts = {}) {
  if (!el) return;
  if (opts.off) {
    el.className = "mc off";
    el.innerHTML = `<div class="ant">📵</div><div><div class="who">Radio to Earth: OFF</div><div class="txt">${text}</div></div>`;
    return;
  }
  el.className = "mc";
  el.innerHTML = `<div class="ant">📡</div><div style="flex:1"><div class="who">Mission Control, Houston</div>
    <div class="txt muted small">Signal crossing 384,400 km… (${T("delay", "1.3 s light delay")})</div><div class="sig"><i></i></div></div>`;
  const bar = $(".sig i", el); const txt = $(".txt", el);
  requestAnimationFrame(() => { bar.style.transition = `width ${LIGHT_DELAY_MS}ms linear`; bar.style.width = "100%"; });
  later(() => {
    Sound.blip();
    $(".sig", el).remove(); txt.className = "txt"; txt.textContent = "";
    let i = 0;
    const type = () => { if (!txt.isConnected) return; txt.textContent = text.slice(0, ++i); if (i < text.length) later(type, 16); };
    type();
  }, LIGHT_DELAY_MS);
}

/* =====================================================================
   GAME STATE
   ===================================================================== */
let S = null;
let scrambleTick = null;
let lastStorm = null;

function newGame(storm) {
  lastStorm = storm;
  S = {
    storm, d: derive(storm),
    bag: [], timeLeft: 0, late: false,
    power: 100, supplies: 2, locked: 0, health: 100,
    crew: CREW.map(c => ({ ...c, dose: 0, pos: 1 })),
    has: {}, comms: true, heat: true, freezer: true, medkitUsed: false, batteriesUsed: false,
    wall: null, wallFactor: 1, wallBlankets: false,
    days: [], dayIdx: 0, interludes: {}, hintBlocked: 0, exposed: null,
    log: {}, decision: null, ending: null, lines: [], hist: []
  };
}
function avail() { return Math.max(0, S.supplies - S.locked); }
function currentDoseRate() { return S ? S.d.radiationPerDay * S.d.doseMultiplier * S.wallFactor : 0; }
function experimentSaved() { return !!(S.has.science && S.freezer); }
function maxDose() { return Math.max(...S.crew.map(c => c.dose)); }
function crew(id) { return S.crew.find(c => c.id === id); }

/* ---------- HUD ---------- */
function hudVisible(v) { $("#hud").hidden = !v; }
function meter(label, val, max, color, txt) {
  const pct = clamp(val / max * 100, 0, 100);
  return `<div class="meter"><div class="lbl"><span>${label}</span><span>${txt}</span></div><div class="bar"><i style="width:${pct}%;background:${color}"></i></div></div>`;
}
function updateHud() {
  if (!S || !S.inShelter) { hudVisible(false); return; }
  hudVisible(true);
  const pColor = S.power > 50 ? "var(--blue)" : S.power > 20 ? "var(--warn)" : "var(--bad)";
  const hColor = S.health > 60 ? "var(--good)" : S.health > 30 ? "var(--warn)" : "var(--bad)";
  const need = SUPPLY_USE_PER_DAY * Math.max(1, S.days.length - S.dayIdx);
  const sColor = avail() >= need ? "var(--good)" : avail() >= SUPPLY_USE_PER_DAY ? "var(--warn)" : "var(--bad)";
  const stars = experimentSaved() ? "🧪" : "";
  $("#hud-inner").innerHTML =
    meter("⚡ Power", S.power, 100, pColor, Math.round(S.power) + "%") +
    meter("📦 Food & water", avail(), 16, sColor, `${avail()}${S.locked ? ` <span class="muted small">(+${S.locked} in wall)</span>` : ""}`) +
    meter("❤️ Crew health", S.health, 100, hColor, Math.round(S.health)) +
    `<div class="hud-stars" title="Science experiment">${stars ? "🧪 alive" : '<span class="muted small">no experiment</span>'}</div>`;
}

/* =====================================================================
   SCREENS
   ===================================================================== */
function titleScreen() {
  S = null; hudVisible(false); closeModal(); $("#home-btn").hidden = true;
  const sr = SR();
  show(`
  ${moonscape()}
  <section class="title-screen">
    <div class="badge">NASA Space Apps 2026 · Mission Trainer</div>
    <h1 class="logo">SOLAR<span>STORM</span></h1>
    <p class="tag">${sr ? "Flight Director · Lunar surface ops" : "Moon Base Survival"}</p>
    <div class="mode-switch" role="radiogroup" aria-label="Choose your level">
      <button role="radio" aria-checked="${!sr}" data-act="setMode" data-arg="junior" ${!sr ? "disabled" : ""}>Junior Astronaut<small>Ages 7–12</small></button>
      <button role="radio" aria-checked="${sr}" data-act="setMode" data-arg="senior" ${sr ? "disabled" : ""}>Flight Director<small>Ages 13+</small></button>
    </div>
    <p class="lede">${sr
      ? "A real solar storm, measured by NASA, is inbound for your lunar base. Load a 60 kg cart against the clock, design your shield wall, budget your power and make the go / no-go call. Real data. Real trade-offs. No safe options."
      : "A <b>real</b> storm from the Sun is heading for your Moon base. You have seconds to grab supplies and days to keep your crew safe. <b>Every choice costs something.</b>"}</p>
    <div class="btn-row">
      <button class="btn big primary" data-act="intro">${sr ? "Start mission" : "Start Mission"}</button>
      <button class="btn big" data-act="academy">Space Academy</button>
    </div>
    <div class="btn-row">
      <button class="btn" data-act="sources">Data & sources</button>
      <button class="btn" data-act="glossary">${sr ? "Space vocab" : "Space words"}</button>
    </div>
    <p class="credit">Made by Team Lychee · Storm data from NASA's DONKI space weather database</p>
  </section>`);
}
function introScreen() {
  show(`
  <section>
    <h1>${SR() ? "Shackleton Station: crew brief" : "Welcome to Shackleton Station"}</h1>
    ${SR() ? `<p class="story">You are commander and acting flight director for a four-person crew at a base near the lunar south pole. ${T("moon", "The Moon has no atmosphere and no global magnetic field")}, so a solar particle event hits the surface at full strength. Your tools: a storm shelter, whatever you can haul into it, and your judgment. Dose is shown as a percentage of the mission's radiation budget.</p>` : ""}
    <p class="story" ${SR() ? 'hidden' : ''}>You're the <b>commander</b> of a small base near the Moon's south pole. ${T("moon", "The Moon has no thick air and no magnetic field")}, so when the Sun throws a tantrum, nothing out there protects you. Only your choices do.</p>
    <h2>Meet your crew</h2>
    <div class="intro-grid">
      ${CREW.map(c => `<div class="panel crew-card">${avatar(c, 64, "ring-low", 0)}<div><b>${esc(c.name)}</b><div class="muted small">${esc(c.role)}</div><div class="small">${esc(c.trait)}</div></div></div>`).join("")}
    </div>
    <h2>How to play</h2>
    <div class="howto">
      <div class="step"><div class="num">1 · Scramble</div>${SR() ? `Load the airlock cart (max <b>${CART_KG} kg</b>) before the timer runs out. Water is the best shield but it's heavy.` : `An alarm sounds! Grab up to <b>${BAG_SLOTS} things</b> before the timer runs out. Anything you leave behind is out of reach until the storm ends.`}</div>
      <div class="step"><div class="num">2 · Shelter</div>${SR() ? "Each day brings an engineering problem: shield wall design, a power budget, dose distribution, life support, then the go / no-go call. <b>The numbers are live, so use them.</b>" : "Each day brings a problem. Pick a choice. <b>No choice is free</b>: protecting one thing always costs another."}</div>
      <div class="step"><div class="num">3 · Debrief</div>See how you did, learn about the <b>real storm</b> you just survived, and compare your choices with what NASA really does.</div>
    </div>
    <p class="muted small" style="margin-top:12px">Tip: tap any <span style="color:var(--teal);font-weight:800;border-bottom:2px dotted var(--teal)">dotted word</span> to learn what it means.</p>
    <div class="btn-row"><button class="btn big primary" data-act="select">Choose a storm ▶</button><button class="btn" data-act="title">Back</button></div>
  </section>`);
}

function stormCard(s) {
  const d = derive(s), best = store.get("best:" + s.id, null);
  return `<button class="storm-card" data-act="pick" data-arg="${s.id}">
    <div><span class="pill ${tagClass(d.label)}">${d.label}</span> <span class="pill">${esc(s.dateText)}</span></div>
    <h3>${esc(s.name)}</h3>
    <div class="small">${esc(s.teaser)}</div>
    <div class="stats">
      <span class="chip">☀ Flare: ${esc(s.flareClass || "none listed")}</span>
      <span class="chip">💨 ${fmt(s.cmeSpeed)} km/s</span>
      <span class="chip">☢ Radiation storm: ${s.hasSEP ? "yes" : "no"}</span>
      <span class="chip">⏱ ${d.scrambleSeconds}s scramble</span>
      ${SR() ? `<span class="chip">Kp ${s.maxKp ?? "?"}</span><span class="chip">½-angle ${s.cmeHalfAngle ?? "n/a"}°</span><span class="chip">${d.shelterDays} days · ${(d.radiationPerDay * d.doseMultiplier).toFixed(0)}%/day raw</span>` : ""}
    </div>
    ${best ? `<div class="best">Best rank: ${esc(best)}</div>` : ""}
  </button>`;
}
function selectScreen() {
  S = null; hudVisible(false);
  show(`
  <section>
    <h1>Pick a real solar storm</h1>
    <p class="story">Each mission uses a storm that <b>really happened</b>. NASA scientists measured it, and the game turns their numbers into your challenge: faster ${T("cme", "clouds")} mean less warning, bigger ${T("flare", "flares")} mean more radiation, and a ${T("sep", "radiation storm")} means longer in the shelter.</p>
    <div class="storm-grid">
      ${STORMS.map(stormCard).join("")}
      <button class="storm-card" data-act="live">
        <div><span class="pill tag-live">Live</span> <span class="pill">The Sun right now</span></div>
        <h3>Today's Sun</h3>
        <div class="small">Loads the biggest storm from the last 30 days, straight from NASA's DONKI database. Some weeks are quiet.</div>
        <div class="stats"><span class="chip">Live stats</span><span class="chip">Changes every week</span></div>
      </button>
    </div>
    <div class="btn-row"><button class="btn" data-act="title">Back to title</button></div>
  </section>`);
}

function alertScreen() {
  const s = S.storm, d = S.d;
  Sound.alarm();
  const lapSeconds = Math.round(40075 / s.cmeSpeed);
  show(`
  <section class="alert-screen">
    <div class="siren">⚠ SOLAR STORM ALERT</div>
    <div class="sunburst" aria-hidden="true"></div>
    <h2>${esc(s.name)} <span class="pill ${s.live ? "tag-live" : tagClass(d.label)}">${s.live ? "LIVE" : d.label}</span></h2>
    <div class="mc" id="mc"></div>
    <div class="facts">
      <div class="fact"><div class="k">${T("flare", "Solar flare")}</div><div class="v">${esc(s.flareClass || "None listed")}</div><div class="x">${s.flareClass ? "Bigger flare = more radiation per day" : "Lower radiation per day"}</div></div>
      <div class="fact"><div class="k">${T("cme", "Storm cloud speed")}</div><div class="v">${fmt(s.cmeSpeed)} km/s</div><div class="x">Fast enough to circle Earth in ${lapSeconds} seconds!</div></div>
      <div class="fact"><div class="k">${T("sep", "Radiation storm")}</div><div class="v">${s.hasSEP ? "Yes" : "No"}</div><div class="x">${s.hasSEP ? `Shelter for ${d.shelterDays} days, extra dose` : `Shelter for ${d.shelterDays} days`}</div></div>
      <div class="fact"><div class="k">${T("kp", "Effect on Earth")}</div><div class="v">${s.maxKp ? "Kp " + (Math.round(s.maxKp * 10) / 10) : "Unknown"}</div><div class="x">${s.maxKp >= 5 ? "Big enough to cause trouble on Earth" : "A small storm at Earth"}</div></div>
    </div>
    ${SR() ? `<table class="telemetry"><tr><td>Record</td><td>${esc(s.record || "")}</td></tr>
      <tr><td>CME speed / half-angle</td><td>${fmt(s.cmeSpeed)} km/s / ${s.cmeHalfAngle ?? "n/a"}°</td></tr>
      <tr><td>Flare peak</td><td>${esc(s.flarePeak || "n/a")}</td></tr>
      <tr><td>Particle event</td><td>${esc(s.sepText)}</td></tr>
      <tr><td>Geomagnetic</td><td>${esc(s.kpText)}</td></tr>
      <tr><td>Sun → Earth transit</td><td>${esc(s.travelText)}</td></tr>
      <tr><td>Derived: scramble / raw dose / shelter</td><td>${d.scrambleSeconds} s / ${(d.radiationPerDay * d.doseMultiplier).toFixed(1)}% per day / ${d.shelterDays} days</td></tr></table>` : ""}
    <p class="story" style="margin:0 auto">Get to the storm shelter! In real life a crew might get hours of warning. Here you get <b>${d.scrambleSeconds} seconds</b> because this storm cloud is ${s.cmeSpeed >= 1200 ? "<b>very fast</b>" : "fairly fast"}.</p>
    <div class="btn-row"><button class="btn big danger" data-act="scramble">🏃 Start the scramble!</button></div>
    <p class="muted small">${s.live ? "Live data from NASA DONKI" : "Saved data from a real storm (not live)"} · ${esc(s.record || "")}</p>
  </section>`);
  missionControl($("#mc"), `Shackleton, this is Houston. Our space weather team just spotted ${s.flareClass ? "an " + s.flareClass + " flare and " : ""}a storm cloud heading your way at ${fmt(s.cmeSpeed)} km/s. Grab what you need and get into the shelter. Now!`);
}

/* ---------- SCRAMBLE ---------- */
function scrambleScreen() {
  S.timeLeft = S.d.scrambleSeconds;
  const total = S.d.scrambleSeconds;
  show(`
  <section>
    <div class="scr-head">
      <div><h2>${SR() ? "Load the airlock cart" : "Grab supplies!"}</h2><div class="muted">${SR() ? `The cart carries <b class="mono">${CART_KG} kg</b>. Load it, then seal the shelter. Anything left behind is out of reach until the storm ends.` : `Tap up to <b>${BAG_SLOTS}</b> things, then seal the shelter. Whatever you leave behind is out of reach until the storm ends.`}</div></div>
      <div class="timer" id="timer"><svg viewBox="0 0 100 100" width="96" height="96"><circle cx="50" cy="50" r="44" stroke="#18234d" stroke-width="10" fill="none"/>
        <circle id="tring" cx="50" cy="50" r="44" stroke="var(--sun)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="276.5" stroke-dashoffset="0"/></svg>
        <div class="t" id="tnum" aria-live="off">${total}</div></div>
    </div>
    <div class="scr-grid">
      <div class="items" id="items">${ITEMS.map(itemTile).join("")}</div>
      <div class="panel bag">
        <h3>${SR() ? "🛒 Airlock cart" : "🎒 Your bag"}</h3>
        <div class="slots" id="slots"></div>
        <div id="bagstats"></div>
        <button class="btn big primary" data-act="seal" id="sealbtn">🚪 Seal the shelter!</button>
        <div class="muted small">Hint: water and food keep you alive <i>and</i> make great ${T("shielding", "shielding")}.</div>
      </div>
    </div>
  </section>`);
  renderBag();
  const start = performance.now();
  let lastWhole = total;
  scrambleTick = setInterval(() => {
    const left = Math.max(0, total - (performance.now() - start) / 1000);
    S.timeLeft = left;
    const whole = Math.ceil(left);
    const tn = $("#tnum"), ring = $("#tring");
    if (!tn) return;
    tn.textContent = whole;
    ring.setAttribute("stroke-dashoffset", 276.5 * (1 - left / total));
    if (left <= 10) { $("#timer").classList.add("low"); ring.setAttribute("stroke", "var(--bad)"); }
    if (whole !== lastWhole) { lastWhole = whole; if (left <= 10) Sound.tick(); }
    if (left <= 0) { seal(true); }
  }, 100);
}
function itemTile(it) {
  const inBag = S.bag.includes(it.id);
  const shield = it.shield >= 3 ? "🛡️🛡️🛡️ great shielding" : it.shield === 2 ? "🛡️🛡️ good shielding" : it.shield === 1 ? "🛡️ a little shielding" : "";
  return `<button class="item" data-act="grab" data-arg="${it.id}" aria-pressed="${inBag}">
    <span class="ic">${it.icon}</span><span class="nm">${esc(it.name)}</span><span class="ds">${esc(it.desc)}</span>${shield ? `<span class="sh">${shield}</span>` : ""}${SR() ? `<span class="sh mono" style="color:var(--warn)">${it.kg} kg</span>` : ""}</button>`;
}
const cartKg = () => S.bag.reduce((a, id) => a + ITEMS.find(x => x.id === id).kg, 0);
function renderCart() {
  const kg = cartKg();
  const box = $("#slots"); box.className = "";
  box.innerHTML = `<div class="sys mono" style="margin-bottom:6px"><span>Load</span><span class="w">${kg} / ${CART_KG} kg</span></div>
    <div class="cart ${kg >= CART_KG ? "full" : ""}"><i style="width:${Math.min(100, kg / CART_KG * 100)}%"></i></div>
    <div class="bagicons" style="margin-top:8px">${S.bag.map(id => { const it = ITEMS.find(x => x.id === id); return `<button data-act="grab" data-arg="${it.id}" title="Unload ${esc(it.name)}" aria-label="Unload ${esc(it.name)}">${it.icon}</button>`; }).join("") || '<span class="muted small">Empty. Tap items to load them.</span>'}</div>`;
  const sup = 2 + S.bag.reduce((a, id) => a + (ITEMS.find(x => x.id === id).supplies || 0), 0);
  const shield = S.bag.reduce((a, id) => a + ITEMS.find(x => x.id === id).shield, 0);
  $("#bagstats").innerHTML = `<div class="bagstat mono"><span>Consumables</span><b>${sup} units (${Math.floor(sup / SUPPLY_USE_PER_DAY)} days)</b></div>
    <div class="bagstat mono"><span>Shield mass</span><b>${shield ? "▮".repeat(shield) : "none"}</b></div>
    <div class="muted small">Shelter stash: 2 units. Water is the best shield per item, but it's heavy.</div>`;
  ITEMS.forEach(it => { const b = $(`.item[data-arg="${it.id}"]`); if (b) b.setAttribute("aria-pressed", S.bag.includes(it.id)); });
}
function renderBag() {
  if (SR()) return renderCart();
  const slots = [];
  for (let i = 0; i < BAG_SLOTS; i++) {
    const id = S.bag[i], it = ITEMS.find(x => x.id === id);
    slots.push(it ? `<button class="slot full" data-act="grab" data-arg="${it.id}" title="Take out ${esc(it.name)}" aria-label="Take ${esc(it.name)} out of the bag">${it.icon}</button>` : `<div class="slot" aria-hidden="true"></div>`);
  }
  $("#slots").innerHTML = slots.join("");
  const sup = 2 + S.bag.reduce((a, id) => a + (ITEMS.find(x => x.id === id).supplies || 0), 0);
  const shield = S.bag.reduce((a, id) => a + ITEMS.find(x => x.id === id).shield, 0);
  $("#bagstats").innerHTML = `<div class="bagstat"><span>📦 Food & water</span><b>${sup} units (${Math.floor(sup / SUPPLY_USE_PER_DAY)} days)</b></div>
    <div class="bagstat"><span>🛡️ Shielding power</span><b>${"▮".repeat(shield) || "none"}</b></div>
    <div class="bagstat"><span>🎒 Space left</span><b>${BAG_SLOTS - S.bag.length} of ${BAG_SLOTS}</b></div>
    <div class="muted small">The shelter already has a small emergency stash (2 units).</div>`;
  ITEMS.forEach(it => { const b = $(`.item[data-arg="${it.id}"]`); if (b) b.setAttribute("aria-pressed", S.bag.includes(it.id)); });
}
function grab(id) {
  if (!S || S.inShelter) return;
  const i = S.bag.indexOf(id);
  if (i >= 0) { S.bag.splice(i, 1); Sound.drop(); }
  else if (SR() ? cartKg() + ITEMS.find(x => x.id === id).kg <= CART_KG : S.bag.length < BAG_SLOTS) { S.bag.push(id); Sound.grab(); }
  else { Sound.bad(); const sb = $("#slots"); if (sb) { sb.animate([{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }], { duration: 250 }); } return; }
  renderBag();
}
function seal(late) {
  if (S.inShelter) return;
  clearTimers();
  S.inShelter = true; S.late = !!late;
  Sound.seal();
  S.bag.forEach(id => {
    const it = ITEMS.find(x => x.id === id);
    if (it.supplies) S.supplies += it.supplies;
    const key = it.kind ? it.kind : it.id;
    S.has[key] = true;
  });
  S.log.bag = S.bag.slice();
  // someone was last into the shelter and picked up extra dose
  S.exposed = rnd(["amara", "jonas", "mei"]);
  crew(S.exposed).dose += 6;
  if (S.late) S.crew.forEach(c => c.dose += 8);
  if (S.has.blankets) S.health = clamp(S.health + 5, 0, 100);
  buildPlan();
  recordHist("Sealed");
  sealedScreen();
}
function sealedScreen() {
  const ex = crew(S.exposed);
  const missing = ITEMS.filter(it => !S.bag.includes(it.id) && !it.kind).map(it => it.icon + " " + it.name);
  show(`
  <section class="interlude">
    <div class="big-ic">${S.late ? "⏰" : "🚪"}</div>
    <h2>${S.late ? "Time's up! Hatch sealed." : "Shelter sealed!"}</h2>
    <p class="story">${S.late
      ? "The crew dove in as the first particles arrived. <b>Everyone picked up some extra radiation dose.</b>"
      : `Great hustle! You sealed the hatch with <b>${Math.ceil(S.timeLeft)} seconds</b> to spare.`}
      ${esc(ex.name)} was the last one in and got a little extra ${T("dose", "dose")}.</p>
    <div class="panel" style="text-align:left">
      <b>In the shelter:</b> ${S.bag.length ? S.bag.map(id => ITEMS.find(x => x.id === id).icon).join(" ") : "nothing but the emergency stash!"}<br>
      <b>Food & water:</b> ${avail()} units · enough for about ${Math.floor(avail() / SUPPLY_USE_PER_DAY)} days<br>
      ${missing.length ? `<span class="muted small">Left behind: ${missing.join(", ")}</span>` : ""}
    </div>
    <p class="muted" style="margin-top:12px">The storm will keep you in here for <b>${S.days.length} days</b>.</p>
    <div class="btn-row"><button class="btn big primary" data-act="nextDay">Day 1 ▶</button></div>
  </section>`);
}

/* ---------- PLAN: which days and surprise cards happen ---------- */
function buildPlan() {
  S.days = S.d.shelterDays === 5 ? ["wall", "power", "uneven", "co2", "decide"] : ["wall", "power", "decide"];
  S.dayIdx = 0;
  S.interludes = {};
  const add = (afterDay, card) => { (S.interludes[afterDay] = S.interludes[afterDay] || []).push(card); };
  // Near miss: narrow storm clouds sometimes only clip you
  if (Math.random() < S.d.nearMissChance) {
    add(0, "nearMiss");
    S.days.splice(S.days.indexOf(S.days.length === 5 ? "uneven" : "power"), 1);
  }
  // Short storms: the CO2 problem shows up as a surprise card instead of a full day
  if (!S.days.includes("co2")) add(Math.min(1, S.days.length - 2), S.has.co2 ? "co2swap" : "co2crisis");
  // Geomagnetic storm on Earth (Kp) creates Earth-side events
  if (SR() && S.storm.hasSEP && (S.storm.maxKp || 0) >= 8 && S.days.length >= 3) add(0, "secondWave");
  const cards = S.d.commsEvents >= 2 ? ["home", "earth"] : S.d.commsEvents === 1 ? [rnd(["home", "earth"])] : [];
  const slots = Array.from({ length: Math.max(1, S.days.length - 1) }, (_, i) => i);
  cards.forEach((c, i) => add(slots[(i + 1) % slots.length], c));
}

/* ---------- end of each day: use up supplies, power, and take dose ---------- */
function upkeep(fade = 1) {
  const lines = [];
  const a = avail();
  if (a >= SUPPLY_USE_PER_DAY) S.supplies -= SUPPLY_USE_PER_DAY;
  else { const pen = Math.round(7.5 * (SUPPLY_USE_PER_DAY - a)); S.supplies -= a; S.health -= pen; lines.push(["bad", `There wasn't enough food and water. Everyone is hungry and thirsty. (Crew health −${pen})`]); }
  const drain = 6 + (S.heat ? 4 : 0) + (S.comms ? 3 : 0) + (S.freezer && S.has.science ? 3 : 0);
  S.power -= drain;
  if (S.power <= 0) { S.power = 0; S.health -= 20; lines.push(["bad", "The power ran out! The air and heat struggled all night. (Crew health −20)"]); }
  if (!S.heat) { const p = S.has.blankets ? 2 : 5; S.health -= p; lines.push(["warn", `A cold night without heaters${S.has.blankets ? ", but the blankets helped" : ""}. (Crew health −${p})`]); }
  const rate = currentDoseRate() * fade;
  S.crew.forEach(c => { c.dose = clamp(c.dose + rate * c.pos, 0, 100); });
  S.health = clamp(S.health, 0, 100);
  return lines;
}
function recordHist(label) { S.hist.push({ label, doses: S.crew.map(c => c.dose) }); }
function snapshot() { return { power: S.power, food: avail(), health: S.health, doses: S.crew.map(c => c.dose) }; }

/* ---------- day screen ---------- */
function crewRow() {
  return `<div class="crewrow">${S.crew.map(c => {
    const b = S.has.dosimeters ? band(c.dose) : { k: "unk", t: "?" };
    const doseTxt = S.has.dosimeters ? `${doseLabel(c.dose)} · ${b.t}` : "No dosimeter";
    return `<div class="crewbox">${avatar(c, 46, "ring-" + b.k, S.has.dosimeters ? c.dose / 100 : 0)}<div><div class="nm">${esc(c.id === "you" ? "You" : c.name.split(" ")[0])}</div><div class="rl">${esc(c.role)}</div><div class="dose band-${b.k}">☢ ${doseTxt}</div></div></div>`;
  }).join("")}</div>`;
}
function stormLevel() {
  const r = S.d.radiationPerDay * S.d.doseMultiplier;
  return r >= 20 ? "Extreme" : r >= 12 ? "Strong" : r >= 7 ? "Moderate" : "Mild";
}
function choiceBtn(id, letter, title, text, chips = [], disabledWhy = "") {
  return `<button class="choice" data-act="choose" data-arg="${id}" ${disabledWhy ? "disabled" : ""}>
    <span class="ct"><span class="letter">${letter}</span>${title}</span>
    <span class="cx">${text}</span>
    ${chips.length ? `<span class="chips">${chips.map(c => `<span class="chip ${c[0]}">${c[1]}</span>`).join("")}</span>` : ""}
    ${disabledWhy ? `<span class="why">🔒 ${disabledWhy}</span>` : ""}
  </button>`;
}
function dayScreen() {
  const type = S.days[S.dayIdx];
  const n = S.days.length, k = S.dayIdx + 1;
  const D = DAYS[type]();
  show(`
  <section>
    <div class="day-head"><span class="pill">Day ${k} of ${n}</span><span class="pill">☀ Storm: ${type === "decide" ? "fading" : stormLevel()}</span></div>
    ${shelterScene()}
    ${crewRow()}
    <h2>${D.title}</h2>
    <p class="story">${D.text}</p>
    <div class="mc" id="mc"></div>
    <div class="choices">${D.choices}</div>
  </section>`);
  const pp = $("#pproj"); if (pp) pp.innerHTML = powerProjHTML();
  const mc = $("#mc");
  if (!S.comms) missionControl(mc, "You switched the radio off to save power, so there's no advice from Earth. You're on your own, Commander.", { off: true });
  else if (S.hintBlocked > 0) { S.hintBlocked--; missionControl(mc, "Static… Mission Control is swamped dealing with the storm on Earth. No message got through today.", { off: true }); $("#mc .who").textContent = "Mission Control: busy"; }
  else missionControl(mc, D.hint);
}

/* ---------- Flight Director engineering helpers ---------- */
function wallFactorFor(n) { const eff = n * (S.has.dosimeters ? 1.8 : 1) + (S.has.blankets ? 1.5 : 0); return Math.exp(-0.16 * eff); }
function remainingDoseDays() { let t = 0; for (let i = S.dayIdx; i < S.days.length; i++) t += S.days[i] === "decide" ? 0.5 : 1; return t; }
function wallProjHTML(n) {
  const f = wallFactorFor(n), rate = S.d.radiationPerDay * S.d.doseMultiplier * f;
  const peak = Math.max(...S.crew.map(c => c.dose + rate * remainingDoseDays() * c.pos));
  const food = avail() - n, daysFood = Math.floor(food / SUPPLY_USE_PER_DAY), need = S.days.length;
  const pc = peak < 40 ? "ok" : peak < 70 ? "meh" : "no", fc = daysFood >= need ? "ok" : daysFood >= need - 1 ? "meh" : "no";
  return `<div>Transmission<b>${Math.round(f * 100)}%</b><span class="muted small">of particles get through</span></div>
    <div>Dose rate<b>${(rate).toFixed(1)}%/day</b><span class="muted small">of mission limit</span></div>
    <div>Projected peak dose<b class="${pc}">${Math.round(peak)}%</b><span class="muted small">${S.has.dosimeters ? "highest crew member" : "estimate (no dosimeters)"}</span></div>
    <div>Food & water<b class="${fc}">${daysFood} / ${need} days</b><span class="muted small">${food} units left to eat</span></div>`;
}
function powerProjHTML() {
  const g = (id) => { const el = document.getElementById(id); return el ? el.checked : false; };
  const cap = 50 + (g("sysBatt") ? 30 : 0);
  const drain = 6 + (g("sysHeat") ? 4 : 0) + (g("sysRadio") ? 3 : 0) + (g("sysFreezer") ? 3 : 0);
  const days = S.days.length - S.dayIdx;
  const end = cap - drain * days;
  const lastDay = end >= 0 ? null : Math.floor(cap / drain) + 1;
  return `<div>Available<b>${cap}%</b></div><div>Draw<b>${drain}%/day</b></div>
    <div>Days to cover<b>${days}</b></div>
    <div>Reserve at storm end<b class="${end >= 10 ? "ok" : end >= 0 ? "meh" : "no"}">${end}%</b><span class="muted small">${end < 0 ? `Blackout on day ${S.dayIdx + lastDay}!` : "No blackout"}</span></div>`;
}

/* ---------- the five kinds of day ---------- */
const DAYS = {
  wall() {
    const a = avail(), big = S.d.label !== "Training";
    if (SR()) {
      const n0 = Math.min(a, 4);
      return {
        title: "Shelter configuration: build the shield wall",
        text: `Particle flux is rising. Stack hydrogen-rich consumables (water, food) along the shelter's sun-facing wall to cut the dose rate. Every unit you lock in the wall is a unit you can't consume until the storm ends. Available: <b class="mono">${a}</b> units. Crew burn rate: <b class="mono">${SUPPLY_USE_PER_DAY}/day</b> for <b class="mono">${S.days.length}</b> days. ${S.has.dosimeters ? "Dosimeter mapping is available." : "<span class='no'>No dosimeters: you are placing units blind.</span>"}${S.has.blankets ? " Blankets are added to the wall." : ""}`,
        hint: big ? `Flight rule for this event: get the dose rate under ${(S.d.radiationPerDay * S.d.doseMultiplier * 0.45).toFixed(1)}%/day, but don't starve yourselves doing it.`
                  : "Low-energy event. Light shielding is acceptable. Conserve consumables.",
        choices: `<div class="panel eng" style="grid-column:1/-1">
          <div class="sys"><b>Units locked in wall</b><span class="w"><output id="wn">${n0}</output> / ${a}</span></div>
          <input type="range" id="wallN" min="0" max="${a}" value="${n0}" aria-label="Units of food and water to put in the wall">
          <div class="proj" id="wproj">${wallProjHTML(n0)}</div>
          <div class="muted small">Model: each unit removes a fixed fraction of incoming particles (simplified exponential shielding, transmission = e<sup>−0.16·n</sup>). ${S.has.dosimeters ? "Dosimeter mapping makes each unit 1.8× as effective." : ""}</div>
          <button class="btn primary" data-act="wallCommit">Build wall ▶</button></div>`
      };
    }
    return {
      title: "Build the storm wall",
      text: `The particles are here! Your shelter is the safest room, but it needs more stuff between you and the Sun. Water and food are full of hydrogen, which makes them great ${T("shielding", "shielding")}. <b>But anything you put in the wall stays locked until the storm ends. You can't eat or drink it.</b> You have <b>${a}</b> units of food and water, and the crew needs ${SUPPLY_USE_PER_DAY} a day for ${S.days.length} days.${S.has.blankets ? " Your blankets will go in the wall too for a little extra protection." : ""}`,
      hint: big ? "This is a big storm. Build the thickest wall you can, but keep enough to eat and drink."
                : "This one looks mild. A light wall should be okay. Save your food and water!",
      choices:
        choiceBtn("heavy", "A", "Heavy wall", "Stack 6 units of food and water into the wall.", [["plus", "🛡️ Blocks a lot"], ["minus", "📦 6 locked away"]], a < 6 ? "You need at least 6 units of food and water." : "") +
        choiceBtn("light", "B", "Light wall", "Use just 1 unit. Keep the rest to eat and drink.", [["minus", "🛡️ Blocks a little"], ["plus", "📦 Only 1 locked"]], a < 1 ? "You have nothing left to build with!" : "") +
        choiceBtn("smart", "C", "Smart wall", "Use the dosimeters to find the weak spots. Only 3 units needed!", [["plus", "🛡️ Blocks a lot"], ["plus", "📦 Only 3 locked"]],
          !S.has.dosimeters ? "Needs dosimeters (you didn't pack them)." : a < 3 ? "You need at least 3 units." : "")
    };
  },
  power() {
    const kit = S.has.science;
    if (SR()) {
      return {
        title: "Power budget: the solar array is degraded",
        text: `Energetic particles are degrading the solar array and upsetting electronics, so the base has switched to protected batteries. <b>Usable reserve: 50%.</b> Configure which systems run for the rest of the storm. Life support is non-negotiable. If the reserve hits 0%, the air and heat fail and the crew's health drops sharply.`,
        hint: "Run the numbers before you commit. And remember: if the radio link goes down, so does our advice.",
        choices: `<div class="panel eng" style="grid-column:1/-1">
          <label class="sys"><input type="checkbox" checked disabled> Life support (air recycling)<span class="w">6%/day · locked</span></label>
          <label class="sys"><input type="checkbox" id="sysHeat" checked> Cabin heaters<span class="w">4%/day</span></label>
          <label class="sys"><input type="checkbox" id="sysRadio" checked> Radio link to Earth<span class="w">3%/day</span></label>
          ${kit ? `<label class="sys"><input type="checkbox" id="sysFreezer" checked> Sample freezer (Mei's experiment)<span class="w">3%/day</span></label>` : `<div class="sys muted">No experiment aboard (sample kit not packed)</div>`}
          ${S.has.batteries ? `<label class="sys"><input type="checkbox" id="sysBatt" checked> Connect spare batteries<span class="w">+30%</span></label>` : `<div class="sys muted">No spare batteries packed</div>`}
          <div class="proj" id="pproj"></div>
          <button class="btn primary" data-act="powerCommit">Commit power plan ▶</button></div>`
      };
    }
    return {
      title: "Power crunch!",
      text: `Solar particles can damage solar panels and electronics, so the base switches to its protected backup power. <b>You're down to 60% power.</b> Something has to be switched off to make it last. (The air system always stays on. You need to breathe!)`,
      hint: "Your call, Commander. Just remember: if you switch off the radio, we can't help you later.",
      choices:
        choiceBtn("radio", "A", "Switch off the radio", "Saves power, but no more advice from Mission Control, and the crew feels cut off.", [["minus", "📡 No more hints"], ["minus", "❤️ −5"]]) +
        choiceBtn("heat", "B", "Switch off the heaters", "Saves power, but the crew gets cold every night.", [["minus", "❤️ Cold nights"]]) +
        choiceBtn("freezer", "C", "Switch off Mei's freezer", "Saves power, but her Moon-dust samples will spoil.", [["minus", "🧪 Science lost"]], kit ? "" : "You didn't pack Mei's sample kit, so there's no experiment to switch off.") +
        (S.has.batteries ? choiceBtn("batteries", "D", "Plug in the spare batteries", "You packed them! +30 power and nothing needs to be switched off.", [["plus", "⚡ +30 power"]]) : "")
    };
  },
  uneven() {
    const ex = crew(S.exposed), first = ex.name.split(" ")[0];
    const highest = S.has.dosimeters
      ? (SR() ? `${first}'s dosimeter reads <b class="mono">${Math.round(ex.dose)}%</b> of the mission limit, the crew high.` : `${first}'s dosimeter reads <b>${Math.round(ex.dose)}</b>, the highest on the crew.`)
      : `${first} feels very tired and a bit sick. Is it radiation? Without ${T("dosimeter", "dosimeters")}, you can't tell how much ${first} got.`;
    return {
      title: SR() ? `Dose imbalance: ${esc(first)}` : `${esc(first)} isn't feeling well`,
      text: SR() ? `${esc(first)} was last through the hatch during the scramble. ${highest} Positions near the wall see lower flux than positions near the hatch. How do you distribute the risk?`
                 : `${esc(first)} was last into the shelter during the scramble. ${highest} Spots near the wall are safer than spots near the door.`,
      hint: SR() ? "Flight rules care about each person's dose, not the crew average. Nobody gets left high." : "Try to keep everyone's dose about even. Nobody should take much more than the rest.",
      choices:
        choiceBtn("move", "A", `Give ${esc(first)} the safest spot`, `${esc(first)}'s dose grows much more slowly. Everyone else moves a little closer to the door.`, [["plus", `☢ ${esc(first)} ×0.5`], ["minus", "☢ Others ×1.15"]]) +
        choiceBtn("medkit", "B", `Use the medkit on ${esc(first)}`, "Medicine helps with tiredness and an upset stomach.", [["plus", "❤️ +15"], ["minus", "⛑️ Medkit used up"]], !S.has.medkit ? "You didn't pack the medkit." : "") +
        choiceBtn("keep", "C", "Keep everyone where they are", `Everyone stays comfy, but ${esc(first)} stays in a less-shielded spot.`, [["plus", "❤️ +3"], ["minus", `☢ ${esc(first)} ×1.3`]]) +
        (SR() ? choiceBtn("rotate", "D", "Rotate the safe spot", "Everyone takes shifts in the best-shielded position. The dose gets shared, but nobody sleeps well.", [["plus", `☢ ${esc(first)} ×0.85, others ×1`], ["minus", "❤️ −3"]]) : "")
    };
  },
  co2() {
    if (S.has.co2) return {
      title: SR() ? "CO₂ scrubber: cartridge saturated" : "The air is getting stuffy",
      text: `Every breath you breathe out has carbon dioxide (CO₂) in it. The ${T("co2", "CO₂ scrubber")}'s filter is full. Good thing you packed spare filters!`,
      hint: "Swap in a fresh cartridge and you're nominal. Nice packing, Commander.",
      choices: choiceBtn("swap", "A", "Swap in a fresh filter", "Two minutes and done. The air is fresh again.", [["plus", "🌀 Problem solved"]])
    };
    return co2Crisis();
  },
  decide() {
    const md = maxDose(), lim = 40;
    const hint = !S.has.dosimeters && md >= lim
      ? "Without dosimeter numbers we're guessing too. Play it safe."
      : md < lim ? "Doses look low. You're GO to continue the mission!"
      : md < 70 ? "Doses are getting high. We'd wait one more day before going outside."
      : "Doses are too high. Come home. We'll get you back safely.";
    const a = avail();
    return {
      title: SR() ? "Event decay: go / no-go decision" : "The storm is fading",
      text: SR()
        ? `Particle flux is decaying. Flight needs a call: resume surface operations (EVA dose: +6% each), abort to Earth, or hold in the shelter for one more day. ${S.has.dosimeters ? `Crew high: <b class="mono">${Math.round(md)}%</b> of limit.` : "<span class='no'>No dosimetry: crew dose unknown.</span>"} Consumables: <b class="mono">${a}</b> units. Power: <b class="mono">${Math.round(S.power)}%</b>.`
        : `The particle levels are dropping. Mission Control needs your decision: finish the mission, go home, or wait inside a little longer? ${S.has.dosimeters ? `Highest crew dose: <b>${Math.round(md)}</b>.` : "Without dosimeters, you can only guess how much dose the crew has."} You have <b>${a}</b> units of food and water left.`,
      hint,
      choices:
        choiceBtn("go", "A", SR() ? "GO: resume surface ops" : "Continue the mission", "Head back out on moonwalks and finish the science. The storm isn't quite over, so the crew takes a bit more dose.", [["plus", "⭐ Mission goes on"], ["minus", "☢ +6 each"]]) +
        choiceBtn("home", "B", SR() ? "ABORT: return to Earth" : "Go home early", "The crew launches back to Earth safely. The mission is cancelled.", [["plus", "☢ No more dose"], ["minus", "⭐ Mission scrubbed"]]) +
        choiceBtn("wait", "C", SR() ? "HOLD: one more day, then GO" : "Wait one more day, then continue", "Stay in the shelter until the storm is really over. Costs another day of food, water and power.", [["plus", "☢ Almost no dose"], ["minus", `📦 −${SUPPLY_USE_PER_DAY}`], ["minus", "⚡ −13"]])
    };
  }
};
function co2Crisis() {
  return {
    title: "The air is getting stuffy!",
    text: `Every breath you breathe out has carbon dioxide (CO₂) in it. The ${T("co2", "CO₂ scrubber")}'s filter is full, and <b>you didn't pack spare filters</b>. The spares are back in the main base, outside the shelter. Too much CO₂ causes headaches and makes it hard to think.`,
    hint: "Fix it before the headaches start. And next time, pack spare filters!",
    choices:
      choiceBtn("amara", "A", "Amara runs to get filters", "She's the engineer, so she's fast. But she has to leave the shelter.", [["plus", "🌀 Fixed fast"], ["minus", "☢ Amara +15"]]) +
      choiceBtn("self", "B", "You go yourself", "You're slower, so you're outside longer and the CO₂ stays high a bit longer.", [["minus", "☢ You +10"], ["minus", "❤️ −5"]]) +
      choiceBtn("rig", "C", "Build a homemade fix", "Tape together a fix from what's in the shelter, like the Apollo 13 crew did! Nobody goes outside, but everyone gets a headache.", [["plus", "☢ No extra dose"], ["minus", "❤️ −10"]])
  };
}

/* ---------- apply a choice ---------- */
function choose(id) {
  const type = S.days[S.dayIdx] || S.pendingCrisis;
  const before = snapshot();
  const L = [];
  const good = (t) => L.push(["good", t]), bad = (t) => L.push(["bad", t]), info = (t) => L.push(["", t]);

  if (S.pendingCrisis) { // CO2 surprise card (no day passes)
    applyCo2(id, good, bad, info);
    S.pendingCrisis = null;
    return resultScreen(before, L, false, "Crisis handled");
  }
  switch (type) {
    case "wall": {
      if (id.startsWith("wall:")) {
        const n = parseInt(id.split(":")[1], 10) || 0;
        S.locked = n; S.wallN = n; S.wallFactor = wallFactorFor(n); S.wallBlankets = !!S.has.blankets;
        S.log.wall = n >= 6 ? "heavy" : n <= 1 ? "light" : "medium";
        (S.wallFactor < 0.5 ? good : info)(`Wall built: ${n} units locked. Transmission is now ${Math.round(S.wallFactor * 100)}% of the unshielded rate.`);
      } else {
        if (id === "heavy") { S.locked = 6; S.wallFactor = 0.4; good("You stacked a thick wall of water bags and food packs. The Sun's particles slow down a lot."); }
        if (id === "light") { S.locked = 1; S.wallFactor = 1.0; info("You kept almost everything to eat and drink. The wall is thin, so more radiation gets through."); }
        if (id === "smart") { S.locked = 3; S.wallFactor = 0.4; good("The dosimeters showed exactly where radiation was leaking in. You plugged the weak spots with only 3 units!"); }
        if (S.has.blankets) { S.wallFactor *= 0.85; S.wallBlankets = true; good("The blankets add a little more shielding to the wall."); }
        S.log.wall = id;
      }
      break;
    }
    case "power": {
      if (id.startsWith("power:")) {
        const f = id.split(":")[1];
        const on = (k) => f.includes(k + "1");
        S.power = Math.min(S.power, 50);
        S.heat = on("h"); S.comms = on("r"); if (S.has.science) S.freezer = on("f");
        if (on("b")) { S.power += 30; S.batteriesUsed = true; good("Spare batteries connected: +30% reserve."); }
        const off = [!S.heat && "heaters", !S.comms && "radio link", S.has.science && !S.freezer && "sample freezer"].filter(Boolean);
        off.length ? info(`Power plan locked. Switched off: ${off.join(", ")}.`) : info("Power plan locked. Everything stays on.");
        if (!S.comms) { S.health -= 5; bad("Radio link down. No more support from Earth. (Crew health −5)"); }
        if (S.has.science && !S.freezer) bad("Sample freezer off. Mei's samples will spoil.");
        S.log.power = f;
      } else {
        S.power = Math.min(S.power, 60);
        if (id === "radio") { S.comms = false; S.health -= 5; bad("The radio is off. It's very quiet, and nobody on Earth can help you now. (Crew health −5)"); }
        if (id === "heat") { S.heat = false; info("Heaters off. Better grab a sweater!"); }
        if (id === "freezer") { S.freezer = false; bad("Mei's freezer is off. Her samples will spoil, and the science goal is lost."); }
        if (id === "batteries") { S.power += 30; S.batteriesUsed = true; good("The spare batteries saved the day: +30 power, and nothing had to be switched off!"); }
        S.log.power = id;
      }
      break;
    }
    case "uneven": {
      const ex = crew(S.exposed), first = ex.name.split(" ")[0];
      if (id === "move") { ex.pos = 0.5; S.crew.forEach(c => { if (c !== ex) c.pos = 1.15; }); good(`${first} is in the safest spot now. The dose is shared more fairly.`); }
      if (id === "medkit") { S.health += 15; S.medkitUsed = true; info(`${first} feels better. (Crew health +15) But medicine can't remove radiation dose, so ${first}'s dose stays the same.`); }
      if (id === "rotate") { S.crew.forEach(c => c.pos = 1); ex.pos = 0.85; S.health -= 3; info(`Everyone takes shifts in the safest spot. The dose is shared more evenly, but nobody sleeps well. (Crew health −3)`); }
      if (id === "keep") { ex.pos = 1.3; S.health += 3; info(`Everyone stays comfy (Crew health +3), but ${first}'s dose keeps climbing faster than everyone else's.`); }
      S.log.uneven = id;
      break;
    }
    case "co2": { applyCo2(id, good, bad, info); break; }
    case "decide": {
      S.decision = id; S.log.decide = id;
      const lines = upkeep(0.5); // the last stormy day
      lines.forEach(l => L.push(l));
      if (id === "go") { S.crew.forEach(c => c.dose = clamp(c.dose + 6, 0, 100)); info("The crew suits up and heads back out to finish the science."); }
      if (id === "home") { good("The crew packs up and launches for home. No more dose."); }
      if (id === "wait") {
        info("You waited one more day for the storm to pass completely.");
        const a = avail();
        if (a >= SUPPLY_USE_PER_DAY) S.supplies -= SUPPLY_USE_PER_DAY; else { S.supplies -= a; S.health -= 15; bad("But there wasn't enough food and water for the extra day! (Crew health −15)"); }
        S.power = Math.max(0, S.power - 13);
        S.crew.forEach(c => c.dose = clamp(c.dose + 1, 0, 100));
      }
      S.health = clamp(S.health, 0, 100);
      recordHist("End");
      return resultScreen(before, L, true);
    }
  }
  S.health = clamp(S.health, 0, 100);
  upkeep(1).forEach(l => L.push(l));
  recordHist("Day " + (S.dayIdx + 1));
  resultScreen(before, L, false);
}
function applyCo2(id, good, bad, info) {
  S.log.co2 = id;
  if (id === "swap") good("Fresh filter in. Easy! Packing those spares paid off.");
  if (id === "amara") { crew("amara").dose = clamp(crew("amara").dose + 15, 0, 100); info("Amara dashed out and back in record time. The air is clean, but she picked up extra dose. (Amara ☢ +15)"); }
  if (id === "self") { crew("you").dose = clamp(crew("you").dose + 10, 0, 100); S.health -= 5; info("You made it back with the filters, but it took a while. (You ☢ +10, crew health −5)"); }
  if (id === "rig") { S.health -= 10; good("Your taped-together fix worked, just like the Apollo 13 crew's! Everyone has a headache, but nobody went outside. (Crew health −10)"); }
  S.health = clamp(S.health, 0, 100);
}

/* ---------- result of a day ---------- */
function resultScreen(before, lines, final, customLabel) {
  const after = snapshot();
  const chips = [];
  const d = (label, a, b, unit = "") => { const x = Math.round(b - a); if (x) chips.push(`<span class="delta ${x > 0 ? "up" : "down"}">${label} ${x > 0 ? "+" : ""}${x}${unit}</span>`); };
  d("⚡ Power", before.power, after.power, "%");
  d("📦 Food & water", before.food, after.food);
  d("❤️ Health", before.health, after.health);
  const doseChips = S.crew.map((c, i) => {
    const x = c.dose - before.doses[i];
    if (x < 0.5) return "";
    return `<span class="delta down">☢ ${esc(c.id === "you" ? "You" : c.name.split(" ")[0])} ${S.has.dosimeters ? "+" + Math.round(x) : "+?"}</span>`;
  }).join("");
  const anyBad = lines.some(l => l[0] === "bad");
  anyBad ? Sound.bad() : Sound.good();
  const label = customLabel || (final ? "Mission result" : `End of day ${S.dayIdx + 1}`);
  show(`
  <section class="interlude" style="max-width:780px">
    <h2>${label}</h2>
    <div class="results">${lines.map(l => `<div class="res-line ${l[0]}">${l[1]}</div>`).join("")}</div>
    <div class="deltas">${chips.join("")}${doseChips}</div>
    ${!S.has.dosimeters ? `<p class="muted small">You don't have dosimeters, so you can't see exact dose numbers.</p>` : ""}
    <div class="btn-row"><button class="btn big primary" data-act="${final ? "ending" : "advance"}">${final ? "See what happened ▶" : "Continue ▶"}</button></div>
  </section>`);
}

/* ---------- surprise cards between days ---------- */
const CARDS = {
  earth: () => ({ ic: "🌍", title: "Trouble back on Earth", text: `This storm is hitting Earth too! Strong ${T("kp", "geomagnetic storms")} can mess up radio and GPS signals and keep everyone at Mission Control busy. Their next message may not get through.`,
    apply() { S.hintBlocked = 1; } }),
  home: () => ({ ic: "💌", title: "Message from home", text: "Your families on Earth just saw bright auroras (northern lights) caused by the same storm you're hiding from! Their message cheers everyone up. (Crew health +5)",
    apply() { S.health = clamp(S.health + 5, 0, 100); } }),
  secondWave: () => ({ ic: "☢️", title: "Second particle surge",
    text: "Detectors show a second wave of energetic protons overnight. Real storms often come in waves: May 2024 brought several proton events before, during and after the main storm. Your wall takes the hit, but everyone picks up extra dose.",
    apply() { const r = currentDoseRate() * 0.5; S.crew.forEach(c => c.dose = clamp(c.dose + r * c.pos, 0, 100)); recordHist("Surge"); } }),
  nearMiss: () => ({ ic: "😮", title: "Glancing blow!", text: "Good news: this storm cloud is narrow, and it's only clipping the Moon. The storm will end a day early.", apply() {} }),
  co2swap: () => ({ ic: "🌀", title: "Stuffy air", text: `The ${T("co2", "CO₂ scrubber")}'s filter filled up. You packed spare filters, so it took two minutes to fix. Nice planning!`, apply() { S.log.co2 = "swap"; } })
};
function advance() {
  // show any surprise cards scheduled after this day
  const q = S.interludes[S.dayIdx];
  if (q && q.length) {
    const card = q.shift();
    if (card === "co2crisis") {
      S.pendingCrisis = "co2";
      const D = co2Crisis();
      show(`<section>
        <div class="day-head"><span class="pill">Surprise!</span><span class="pill">Day ${S.dayIdx + 1}, night</span></div>
        ${shelterScene()}${crewRow()}
        <h2>${D.title}</h2><p class="story">${D.text}</p><div class="mc" id="mc"></div><div class="choices">${D.choices}</div></section>`);
      if (S.comms) missionControl($("#mc"), D.hint); else missionControl($("#mc"), "The radio is off. No help from Earth.", { off: true });
      return;
    }
    const c = CARDS[card]();
    c.apply();
    Sound.blip();
    show(`<section class="interlude panel">
      <div class="big-ic">${c.ic}</div><h2>${c.title}</h2><p class="story">${c.text}</p>
      <div class="btn-row"><button class="btn big primary" data-act="advance">Continue ▶</button></div></section>`);
    return;
  }
  S.dayIdx++;
  if (S.dayIdx >= S.days.length) return endingScreen();
  dayScreen();
}

/* =====================================================================
   ENDINGS + DEBRIEF
   ===================================================================== */
function evaluate() {
  const md = maxDose();
  const allHigh = S.crew.every(c => c.dose >= 70);
  if (S.health <= 0 || allHigh) return "hard";
  if (md >= 100 || S.health < 30) return "close";
  if (S.decision === "home") return "safe";
  if (md < 40 && S.health >= 60 && experimentSaved()) return "commander";
  if (md < 70) return "complete";
  return "close";
}
function starsEarned() {
  const continued = S.decision !== "home" && !["hard", "close"].includes(S.ending);
  return [
    { on: experimentSaved() && continued, t: "Science saved" },
    { on: continued, t: "Mission continued" },
    { on: maxDose() < 40, t: "Everyone's dose stayed low" }
  ];
}
function endingScreen() {
  S.ending = evaluate();
  const E = ENDINGS[S.ending];
  const key = "best:" + S.storm.id;
  const prev = store.get(key, null);
  const prevOrder = prev ? Math.max(...Object.values(ENDINGS).filter(x => x.rank === prev).map(x => x.order)) : 0;
  if (!S.storm.live && E.order >= prevOrder) store.set(key, E.rank);
  S.inShelter = false; hudVisible(false);
  ["commander", "complete", "safe"].includes(S.ending) ? Sound.good() : Sound.bad();
  const stars = starsEarned();
  show(`
  <section class="center">
    <div class="pill">${esc(S.storm.name)} · ${esc(S.storm.dateText)}</div>
    <div class="rank ${E.medal}" aria-hidden="true">${E.icon}</div>
    <h1>${E.title}</h1>
    <p class="story" style="margin:0 auto 6px">Rank earned: <b style="color:var(--sun)">${E.rank}</b></p>
    <p class="story" style="margin:0 auto">${E.line}</p>
    <div class="stars" aria-label="${stars.filter(s => s.on).length} of 3 stars">${stars.map(s => `<span class="${s.on ? "" : "star-off"}" title="${s.t}">⭐</span>`).join("")}</div>
    <div class="small muted">${stars.map(s => (s.on ? "✅ " : "⬜ ") + s.t).join(" · ")}</div>
    <div class="crewrow" style="max-width:820px;margin:16px auto">${S.crew.map(c => { const b = band(c.dose); return `<div class="crewbox">${avatar(c, 46, "ring-" + b.k, c.dose / 100)}<div><div class="nm">${esc(c.id === "you" ? "You" : c.name.split(" ")[0])}</div><div class="dose band-${b.k}">☢ ${doseLabel(c.dose)} · ${b.t}</div></div></div>`; }).join("")}</div>
    <p class="muted small">Final dose numbers (from the base's records). ❤️ Crew health: ${Math.round(S.health)} · 📦 Food & water left: ${avail()}</p>
    <div class="btn-row"><button class="btn big primary" data-act="debrief">Mission debrief ▶</button></div>
  </section>`);
}

function realStormCard() {
  const s = S.storm;
  return `<div class="panel" style="margin:14px 0">
    <h2>☀ The real storm you just survived</h2>
    ${s.realStory.map(p => `<p>${esc(p)}</p>`).join("")}
    <div class="facts">
      <div class="fact"><div class="k">Flare</div><div class="v">${esc(s.flareClass || "None listed")}</div>${s.flarePeak ? `<div class="x">Peak: ${esc(s.flarePeak)}</div>` : ""}</div>
      <div class="fact"><div class="k">Storm cloud speed</div><div class="v">${fmt(s.cmeSpeed)} km/s</div></div>
      <div class="fact"><div class="k">Radiation storm</div><div class="v">${s.hasSEP ? "Yes" : "No"}</div><div class="x">${esc(s.sepText)}</div></div>
      <div class="fact"><div class="k">Trip to Earth</div><div class="v">${s.travelHours ? "~" + Math.round(s.travelHours) + " hours" : "Unknown"}</div><div class="x">${esc(s.travelText)}</div></div>
    </div>
    <p class="small muted">In the game, your ${S.d.scrambleSeconds}-second scramble stood in for those hours of warning. Sources: ${s.sources.map(x => `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join(" · ")}</p>
  </div>`;
}
function debriefItems() {
  const L = S.log, out = [];
  const packed = (L.bag || []).map(id => ITEMS.find(x => x.id === id).icon).join(" ") || "nothing";
  const link = (k) => `<a href="${LINKS[k].url}" target="_blank" rel="noopener">${LINKS[k].label}</a>`;
  out.push({ h: "🎒 The scramble", ls: "cmes", you: `You packed: ${packed}. ${S.late ? "The timer ran out before you sealed the hatch, so everyone took extra dose." : "You sealed the hatch in time."}`,
    real: `Real crews get warnings from space weather forecasters. NASA's Moon to Mars Space Weather Analysis Office watches the Sun and records every storm in DONKI. The fastest particles can arrive within hours, so crews practice getting to shelter fast. ${link("donki")}` });
  const wallTxt = { heavy: "You built a heavy wall: great protection, but it locked away 6 units of food and water.",
    light: "You built a light wall: you kept your food and water, but more radiation got through.",
    smart: "You built a smart wall: the dosimeters showed where to put just 3 units for great protection.",
    medium: "You built a medium wall: a balance between protection and food." }[L.wall] || "";
  const wallTxt2 = S.wallN != null ? `You locked ${S.wallN} units in the wall, letting through ${Math.round(S.wallFactor * 100)}% of the unshielded dose rate.` : wallTxt;
  out.push({ h: "🛡️ The storm wall", ls: "shielding", you: wallTxt2,
    real: `This is NASA's real plan! If a solar storm hits, Orion crews build a shelter from stowage bags full of supplies, packed against the spacecraft's least-protected walls. ${link("orion")}` });
  out.push({ h: "📟 Dosimeters", ls: "dose", you: S.has.dosimeters ? "You packed dosimeters, so you could see everyone's real dose and make smart choices." : "You left the dosimeters behind, so you had to guess how much radiation everyone got.",
    real: `Orion carries radiation sensors called HERA that warn the crew, and astronauts wear their own dosimeters. Knowing the numbers is how crews decide when to shelter. ${link("orion")}` });
  const powerTxt = { radio: "You switched off the radio. You saved power, but lost Mission Control's advice.", heat: "You switched off the heaters. You saved power, but cold nights hurt crew health.",
    freezer: "You switched off Mei's freezer. You saved power, but lost the science.", batteries: "You plugged in the spare batteries, so nothing had to be switched off." }[L.power]
    || (L.power ? `Your power plan: heaters ${S.heat ? "on" : "off"}, radio ${S.comms ? "on" : "off"}${S.has.science ? `, freezer ${S.freezer ? "on" : "off"}` : ""}${S.batteriesUsed ? ", spare batteries connected" : ""}. ${S.power > 0 ? `You ended with ${Math.round(S.power)}% in reserve.` : "The reserve ran out."}` : "");
  out.push({ h: "⚡ Power", ls: "power", you: powerTxt,
    real: "Spacecraft and bases have a power budget. Engineers decide ahead of time which systems must always stay on, like air, and which can be switched off in an emergency. Packing spares gives you more options later." });
  if (L.uneven) {
    const t = { move: "You gave the most-exposed crew member the safest spot and shared the dose more fairly.",
      medkit: "You used the medkit. It helped them feel better, but it couldn't take away radiation dose.", keep: "You kept everyone in place, so one person's dose kept climbing faster.",
      rotate: "You rotated the safe spot so everyone shared the dose." }[L.uneven];
    out.push({ h: "🧑‍🚀 Sharing the risk", ls: "dose", you: t,
      real: "Medicine can help people feel better, but no pill removes radiation dose. That's why crews track each person's dose and protect people <i>before</i> they get exposed." });
  }
  if (L.co2) {
    const t = { swap: "You packed spare filters, so the CO₂ problem took two minutes to fix.", amara: "Amara ran outside for filters: fast, but she took extra dose.",
      self: "You went outside for filters yourself: slower, and you took extra dose.", rig: "You built a homemade fix. Everyone got a headache, but nobody went outside." }[L.co2];
    out.push({ h: "🌀 The air problem", ls: "power", you: t,
      real: `This really happened! In 1970, CO₂ built up inside Apollo 13. Mission Control and the crew built an adapter for the air filters out of duct tape, plastic bags and cardboard, and it worked. Spare parts matter. ${link("apollo13")}` });
  }
  const dTxt = { go: "You continued the mission while the storm was fading.", home: "You chose to go home early and keep everyone safe.", wait: "You waited one extra day for the storm to fully pass." }[L.decide] || "";
  out.push({ h: "🚦 The big decision", ls: "dose", you: dTxt,
    real: `NASA sets radiation levels ahead of time that tell crews when to shelter, so the big decisions aren't just guesses under pressure. ${link("doseRules")}` });
  out.push({ h: "📡 Talking to Earth", ls: "comms", you: S.comms ? "Your radio stayed on. Messages took about 1.3 seconds each way, the time light takes to cross 384,400 km." : "You switched off the radio, so you lost contact with Earth.",
    real: "On the Moon, a message takes about 1.3 seconds to reach Earth. On Mars it takes about 3 to 22 minutes! Mars crews will have to make big decisions on their own, without waiting for Mission Control." });
  return out;
}
function doseChart() {
  const H = S.hist; if (!H || H.length < 2) return "";
  const W = 640, Ht = 250, pl = 44, pr = 16, pt = 16, pb = 34;
  const x = (i) => pl + i * (W - pl - pr) / (H.length - 1), y = (v) => pt + (1 - v / 100) * (Ht - pt - pb);
  const lim = 40;
  const lines = S.crew.map((c, ci) => `<polyline fill="none" stroke="${c.color}" stroke-width="3" stroke-linejoin="round" points="${H.map((h, i) => x(i) + "," + y(h.doses[ci])).join(" ")}"/>` +
    `<circle cx="${x(H.length - 1)}" cy="${y(H[H.length - 1].doses[ci])}" r="5" fill="${c.color}"/>`).join("");
  const grid = [0, lim, 70, 100].map(v => `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="${v === lim ? "#4fdc7c" : v === 70 ? "#ff7a1a" : "#2a3768"}" stroke-dasharray="${v ? "5 5" : ""}"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#8fa0c8">${v}</text>`).join("");
  const labels = H.map((h, i) => `<text x="${x(i)}" y="${Ht - 12}" text-anchor="middle" font-size="11" fill="#8fa0c8">${esc(h.label)}</text>`).join("");
  return `<div class="panel" style="margin:14px 0">
    <h2>${SR() ? "Dose history (% of mission limit)" : "Your crew's radiation dose, day by day"}</h2>
    <svg class="chart" viewBox="0 0 ${W} ${Ht}" role="img" aria-label="Line chart of each crew member's radiation dose over the mission">${grid}${labels}${lines}</svg>
    <div class="small" style="display:flex;flex-wrap:wrap;gap:12px;margin-top:6px">${S.crew.map(c => `<span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${c.color}"></span> ${esc(c.id === "you" ? "You" : c.name.split(" ")[0])}</span>`).join("")}
    <span class="muted">Green dashed line: low-dose goal (${lim}). Orange: high (70).</span></div>
    ${!S.has.dosimeters ? `<p class="small muted">You didn't have dosimeters during the mission. These numbers come from the base's records afterwards.</p>` : ""}
  </div>`;
}
function debriefScreen() {
  const E = ENDINGS[S.ending];
  show(`
  <section>
    <h1>Mission debrief</h1>
    <p class="story">Result: <b style="color:var(--sun)">${E.title}</b> · Rank: <b>${E.rank}</b>. Here's how your choices compare with what real astronauts and engineers do.</p>
    ${realStormCard()}
    ${doseChart()}
    <h2>Your choices vs. real life</h2>
    <div class="debrief-list">
      ${debriefItems().map(i => `<div class="db-item"><div><h4>${i.h} · You</h4><div>${i.you}</div></div><div class="real"><h4>Real life</h4><div>${i.real}</div>${i.ls ? `<button class="dlink" data-act="lesson" data-arg="${i.ls}">Learn more in Space Academy</button>` : ""}</div></div>`).join("")}
    </div>
    <div class="panel" style="margin-top:16px">
      <h3>Try it a different way</h3>
      <p>Same storm, different plan? Try packing different items, or build a different wall, and see how the ending changes. That's how real crews train: they practice the same emergency again and again.</p>
      <div class="btn-row">
        <button class="btn big primary" data-act="replay">🔁 Replay this storm</button>
        <button class="btn" data-act="select">Try a different storm</button>
        <button class="btn" data-act="sources">Data & sources</button>
      </div>
    </div>
  </section>`);
}

/* =====================================================================
   SOURCES / GLOSSARY
   ===================================================================== */
function sourcesScreen() {
  S = null; hudVisible(false);
  const ex = derive(STORMS[1]);
  show(`
  <section>
    <h1>The real science</h1>
    <p class="story">Every storm in this game really happened. We use measurements from <b>NASA's DONKI</b> (the Space Weather Database Of Notifications, Knowledge, Information), run at NASA's Community Coordinated Modeling Center. NASA's Moon to Mars Space Weather Analysis Office records storms there.</p>
    <div class="panel">
      <h2>How real data becomes the game</h2>
      <table class="map">
        <tr><th>Real measurement</th><th>What it changes in the game</th><th>Rule we use</th></tr>
        <tr><td>CME speed (km/s)</td><td>Scramble timer: faster storm, less warning</td><td>500 km/s or slower: 60 s. 2,000 km/s or faster: 20 s. In between scales evenly.</td></tr>
        <tr><td>Flare class</td><td>Radiation per day in the shelter</td><td>C or M flare (or none): 5. X1–X4: 10. X5 and up: 15.</td></tr>
        <tr><td>Solar particle event linked?</td><td>Days in the shelter, extra dose</td><td>Yes: 5 days at 1.5× dose. No: 3 days at 1×.</td></tr>
        <tr><td>Geomagnetic storm Kp</td><td>Surprise events from Earth</td><td>Kp 5–6: 1 event. Kp 7 or more: 2 events.</td></tr>
        <tr><td>CME half-angle</td><td>Chance of a glancing blow</td><td>Narrower than 30°: 30% chance the storm ends a day early.</td></tr>
      </table>
      <p class="small muted">Example: the Bullseye Storm (1,509 km/s, X1.8, particle event) gives a ${ex.scrambleSeconds}-second scramble, ${ex.radiationPerDay * ex.doseMultiplier} dose points per day without shielding, and ${ex.shelterDays} days in the shelter.</p>
      <p class="small"><b>Honest notes:</b> Radiation dose in the game is shown as points from 0 to 100. These are game points, not real units like millisieverts. The scramble timer is shrunk from real hours down to seconds. The saved storms are stored inside the game and are not live. Only the "Today's Sun" mission loads live data, and it is labeled LIVE.</p>
    </div>
    <h2 style="margin-top:20px">The storms</h2>
    ${STORMS.map(s => `<div class="panel" style="margin-bottom:12px"><h3>${esc(s.name)} · ${esc(s.dateText)}</h3>
      <div class="small muted">${esc(s.record)}</div>
      <ul class="src-list">${s.sources.map(x => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a></li>`).join("")}</ul></div>`).join("")}
    <h2 style="margin-top:20px">Real-life connections in the debrief</h2>
    <div class="panel"><ul class="src-list">
      ${Object.values(LINKS).map(x => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a></li>`).join("")}
    </ul></div>
    <div class="btn-row"><button class="btn big primary" data-act="academy">Space Academy</button><button class="btn" data-act="title">Back to title</button><button class="btn" data-act="glossary">${SR() ? "Space vocab" : "Space words"}</button></div>
  </section>`);
}
function glossary() {
  const entries = Object.values(TERMS).map(t => SR() ? t.s : t.j);
  openModal(`<h2 id="modal-title">${SR() ? "Space vocab" : "Space words"}</h2><dl class="gl">${entries.map(t => `<dt>${t[0]}</dt><dd>${t[1]}</dd>`).join("")}</dl>`);
}

/* =====================================================================
   LIVE MODE: today's Sun from NASA DONKI (api.nasa.gov)
   ===================================================================== */
async function donki(endpoint, start, end, extra = "") {
  const url = `https://api.nasa.gov/DONKI/${endpoint}?startDate=${start}&endDate=${end}${extra}&api_key=${encodeURIComponent(NASA_API_KEY)}`;
  const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 9000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(endpoint + ": HTTP " + res.status);
    const txt = await res.text();
    return txt.trim() ? JSON.parse(txt) : [];
  } finally { clearTimeout(to); }
}
const flareRank = (c = "") => { const i = "ABCMX".indexOf((c[0] || "").toUpperCase()); return i < 0 ? -1 : i * 100 + (parseFloat(c.slice(1)) || 0); };
async function loadLive() {
  show(`<section class="interlude"><div class="big-ic">NASA</div><h2>Contacting NASA…</h2><p class="story">Downloading the last 30 days of space weather from NASA's DONKI database.</p></section>`);
  try {
    const end = new Date(), start = new Date(end.getTime() - 30 * 86400000);
    const day = (d) => d.toISOString().slice(0, 10);
    const [s, e] = [day(start), day(end)];
    const [analyses, flares, seps, storms] = await Promise.all([
      donki("CMEAnalysis", s, e, "&mostAccurateOnly=true"), donki("FLR", s, e), donki("SEP", s, e), donki("GST", s, e)
    ]);
    const cme = (analyses || []).filter(a => a && a.speed).sort((a, b) => b.speed - a.speed)[0];
    if (!cme) throw new Error("quiet");
    const flare = (flares || []).filter(f => f && f.classType).sort((a, b) => flareRank(b.classType) - flareRank(a.classType))[0];
    const kps = (storms || []).flatMap(g => (g.allKpIndex || []).map(k => k.kpIndex)).filter(x => typeof x === "number");
    const maxKp = kps.length ? Math.max(...kps) : 0;
    const when = (cme.time21_5 || e).slice(0, 10);
    const ev = {
      id: "live", live: true, name: "Today's Sun", dateText: when,
      cmeSpeed: Math.round(cme.speed), cmeHalfAngle: typeof cme.halfAngle === "number" ? cme.halfAngle : null,
      flareClass: flare ? flare.classType : null, flarePeak: flare && flare.peakTime ? flare.peakTime.replace("T", " ").replace("Z", " UTC") : null,
      hasSEP: (seps || []).length > 0, sepText: (seps || []).length ? `${seps.length} solar particle event(s) in DONKI in the last 30 days` : "No solar particle events in DONKI in the last 30 days",
      maxKp, kpText: maxKp ? `Highest Kp in the last 30 days: ${maxKp}` : "No geomagnetic storms in the last 30 days",
      travelHours: 150e6 / cme.speed / 3600, travelText: "Rough estimate from its speed (distance from the Sun ÷ speed)",
      record: "Live from NASA DONKI: " + (cme.associatedCMEID || "CME analysis"),
      realStory: [
        `This is live data: the fastest storm cloud NASA's DONKI recorded in the last 30 days (around ${when}) moved at about ${fmt(cme.speed)} km/s.`,
        flare ? `The strongest flare in that time was ${flare.classType}.` : "There were no flares listed in that time.",
        (seps || []).length ? "DONKI also recorded a solar particle event (a radiation storm) in that time." : "No solar particle events were recorded in that time."
      ],
      sources: [{ label: "NASA DONKI space weather database", url: DONKI_URL }]
    };
    store.set("liveCache", ev);
    newGame(ev); alertScreen();
  } catch (err) {
    const cached = store.get("liveCache", null);
    const quiet = String(err && err.message) === "quiet";
    show(`<section class="interlude panel"><div class="big-ic">${quiet ? "😴" : "📵"}</div>
      <h2>${quiet ? "The Sun has been quiet!" : "Couldn't reach NASA"}</h2>
      <p class="story">${quiet ? "DONKI didn't record any big storm clouds in the last 30 days. That's good news for astronauts! Try one of the saved real storms instead."
        : "The live NASA data didn't load (no internet, too many requests, or this page can't connect to outside sites). The saved storms are real NASA data too!"}</p>
      <div class="btn-row">${cached ? `<button class="btn big primary" data-act="liveCached">Play the last live storm we saved (${esc(cached.dateText)})</button>` : ""}
      <button class="btn ${cached ? "" : "big primary"}" data-act="select">Pick a saved storm</button></div></section>`);
  }
}

/* =====================================================================
   SPACE ACADEMY: lessons, interactive tools and practice for both ages
   Junior Astronaut (7-12) and Flight Director (13+) each get their own
   version of every lesson, styled to match their game.
   ===================================================================== */
const UNITS = [
  { id: "u1", icon: "", title: { j: "The Sun's storms", s: "Unit 1 · Space weather physics" }, lessons: ["flares", "cmes", "seps"] },
  { id: "u2", icon: "", title: { j: "Keeping astronauts safe", s: "Unit 2 · Radiation protection" }, lessons: ["dose", "shielding"] },
  { id: "u3", icon: "", title: { j: "Running a Moon base", s: "Unit 3 · Habitat systems" }, lessons: ["power", "comms"] },
  { id: "u4", icon: "", title: { j: "Watching the Sun", s: "Unit 4 · Forecasting & data" }, lessons: ["donki"] }
];
const ORDER = UNITS.flatMap(u => u.lessons);
const unitOf = (id) => UNITS.find(u => u.lessons.includes(id));
const L_ = (o) => SR() ? o.s : o.j;
const src = (url, label) => `<a href="${url}" target="_blank" rel="noopener">${label}</a>`;

const LESSONS = {
  /* ---------------- UNIT 1 ---------------- */
  flares: {
    icon: "", mins: { j: 3, s: 5 },
    title: { j: "Solar flares: the Sun's flashes", s: "Solar flares and the GOES X-ray scale" },
    learn: {
      j: `<p>A <b>solar flare</b> is a sudden, super-bright flash of energy on the Sun. It happens when twisted magnetic fields near a sunspot snap and release energy all at once.</p>
        <h3>Flares have letter grades</h3>
        <p>Scientists sort flares by letter: <b>A, B, C, M and X</b>. Each letter is <b>10 times stronger</b> than the one before it. X flares are the biggest of all.</p>
        <p>The number after the letter tells you more. An <b>X2</b> flare is twice as strong as an <b>X1</b>.</p>
        [[widget]]
        <div class="callout real"><b>Real storm:</b> On October 3, 2024, the Sun fired an <b>X9.0</b> flare, the strongest of the current solar cycle at that time.</div>
        <h3>Why flares matter to astronauts</h3>
        <p>The light from a flare reaches us in about 8 minutes. Big flares can also launch storm clouds and showers of fast particles. You'll learn about those next!</p>`,
      s: `<p>A <b>solar flare</b> is a rapid release of magnetic energy in the solar atmosphere, usually above an active region (a sunspot group). It brightens across the spectrum, from radio waves to X-rays.</p>
        <h3>The GOES classification</h3>
        <p>Flares are classed by their <b>peak soft X-ray flux</b> (0.1–0.8 nm), measured by NOAA's GOES satellites. The scale is logarithmic:</p>
        <p class="mono">A = 10⁻⁸ · B = 10⁻⁷ · C = 10⁻⁶ · M = 10⁻⁵ · X = 10⁻⁴ W/m²</p>
        <p>The number is a multiplier, so an <b>M5.0</b> flare peaks at 5 × 10⁻⁵ W/m², which is half the flux of an <b>X1.0</b>.</p>
        [[widget]]
        <div class="callout real"><b>Real data:</b> The <b>X9.0</b> flare of October 3, 2024 (region 3842) was the strongest of Solar Cycle 25 at the time. The X1.8 flare of October 9, 2024 had a much smaller peak, but it launched a fast, Earth-directed CME and a particle event. Flare class alone doesn't tell you how dangerous a storm will be.</div>
        <h3>Why the flash itself isn't the threat you dodge</h3>
        <p>Flare photons travel at light speed, so they arrive about 8.3 minutes after the eruption, along with the first image of it. There's no warning window. Crews shelter from what comes <i>after</i>: energetic particles (minutes to hours) and the CME (about 1–4 days).</p>`
    },
    quiz: {
      j: [
        { q: "Which of these flares is the strongest?", o: ["C5", "M2", "X1"], a: 2, why: "X is the biggest letter. Even an X1 is stronger than any C or M flare." },
        { q: "How many times stronger is an M flare than a C flare?", o: ["2 times", "10 times", "100 times"], a: 1, why: "Each letter is 10 times stronger than the one before it." },
        { q: "An X2 flare is ___ as strong as an X1 flare.", o: ["half", "twice", "ten times"], a: 1, why: "The number after the letter multiplies: X2 = 2 × X1." }
      ],
      s: [
        { q: "What is the peak X-ray flux of an M5.0 flare?", o: ["5 × 10⁻⁶ W/m²", "5 × 10⁻⁵ W/m²", "5 × 10⁻⁴ W/m²", "5 × 10⁻³ W/m²"], a: 1, why: "M = 10⁻⁵ W/m², times 5 gives 5 × 10⁻⁵ W/m²." },
        { q: "How many times larger is the peak flux of an X1.8 flare than an M1.8 flare?", o: ["1.8×", "10×", "18×", "100×"], a: 1, why: "Same multiplier, one class apart: exactly 10×." },
        { q: "Why can't a crew use the flare's flash itself as a warning?", o: ["It's invisible", "It travels at light speed, so it arrives with the first image of the eruption", "Flares only happen at night"], a: 1, why: "Light and X-rays arrive about 8.3 minutes after the eruption, the same time we see it. The warning window is for the slower particles and the CME." },
        { q: "The X9.0 flare (Oct 3, 2024) was much stronger than the X1.8 (Oct 9, 2024). Which statement is supported by the data?", o: ["The X9.0 was automatically more dangerous for astronauts", "Flare class alone doesn't set the danger: CME direction, speed and particles matter", "The X1.8 caused no effects"], a: 1, why: "The October 9 event had a fast, Earth-directed CME, a particle event and a Kp 8.67 storm. Danger depends on the whole package." }
      ]
    },
    widget: "flare", play: "Bigger flares mean more dose per day in the shelter."
  },
  cmes: {
    icon: "", mins: { j: 3, s: 6 },
    title: { j: "CMEs: storm clouds from the Sun", s: "CMEs: speed, direction and transit time" },
    learn: {
      j: `<p>Sometimes the Sun blasts a gigantic cloud of hot gas and magnetic field into space. It's called a <b>coronal mass ejection</b>, or <b>CME</b> for short.</p>
        <h3>How fast do they go?</h3>
        <p>CMEs can zoom through space at more than <b>1,000 kilometers every second</b>. Even that fast, it takes them about <b>1 to 4 days</b> to reach the Earth and the Moon, because the Sun is about 150 million km away.</p>
        [[widget]]
        <div class="callout real"><b>Real storm:</b> The CME on October 9, 2024 left the Sun at about 1,509 km/s and hit Earth about 36½ hours later.</div>
        <h3>Faster storm = less warning</h3>
        <p>When a fast CME is headed your way, you have less time to get ready. That's why the scramble in the game is shorter for faster storms!</p>`,
      s: `<p>A <b>coronal mass ejection (CME)</b> is a large eruption of magnetized plasma from the corona. Forecasters at NASA's Moon to Mars Space Weather Analysis Office measure each CME's <b>speed</b>, <b>direction</b> and <b>half-angle</b> (angular width) from coronagraph images and log them in DONKI.</p>
        <h3>First-order transit time</h3>
        <p class="mono">t ≈ d / v,  with d ≈ 1.5 × 10⁸ km (1 AU)</p>
        [[widget]]
        <h3>Reality check: CMEs slow down</h3>
        <p>The October 9, 2024 CME was measured at about 1,509 km/s near the Sun. Constant speed predicts about 27.6 h. It actually arrived after about <b>36.6 h</b>. Drag from the slower solar wind decelerated it. NASA's forecast notes expected it to reach Earth at only 600–700 km/s. Real forecasts use models like WSA-ENLIL for this reason.</p>
        <div class="callout"><b>Halo CMEs</b> look like a ring around the Sun in coronagraph images because they're coming almost straight toward (or away from) the observer. The Oct 9 event was a "bright fast halo CME", which is bad news for anything near Earth and the Moon.</div>
        <p class="small muted">Source: ${src("https://webtools.ccmc.gsfc.nasa.gov/CMEscoreboard/prediction/detail/3670", "NASA CCMC CME Scoreboard notes for 2024-10-09")}</p>`
    },
    quiz: {
      j: [
        { q: "What is a CME?", o: ["A giant cloud of gas blasted from the Sun", "A kind of rocket", "A crater on the Moon"], a: 0, why: "CME stands for coronal mass ejection: a huge cloud of the Sun's gas and magnetic field." },
        { q: "A CME is coming faster than usual. What happens to your warning time?", o: ["It gets longer", "It gets shorter", "It stays the same"], a: 1, why: "A faster cloud covers the distance sooner, so you get less time to prepare." },
        { q: "About how long do CMEs take to reach the Earth and Moon?", o: ["8 minutes", "1 to 4 days", "1 year"], a: 1, why: "They're fast, but the Sun is about 150 million km away, so it takes about 1 to 4 days." }
      ],
      s: [
        { q: "Using t = d / v with d = 1.5 × 10⁸ km, how long does a 1,000 km/s CME take to reach Earth?", o: ["About 4 hours", "About 42 hours", "About 150 hours", "About 10 days"], a: 1, why: "1.5×10⁸ km ÷ 1,000 km/s = 150,000 s ≈ 41.7 hours." },
        { q: "The Oct 9, 2024 CME (≈1,509 km/s) arrived after 36.6 h, not the predicted 27.6 h. Why?", o: ["The measurement was wrong", "It decelerated in the slower solar wind", "It took a longer path around Venus"], a: 1, why: "Fast CMEs are slowed by drag against the ambient solar wind. NASA's notes predicted 600–700 km/s at Earth." },
        { q: "What does a 'halo CME' usually tell forecasters?", o: ["It's moving roughly along the Sun–observer line", "It's very slow", "It has no magnetic field"], a: 0, why: "A halo appears when the CME expands toward or away from the observer, so Earth-facing halos are watched closely." }
      ]
    },
    widget: "cme", play: "The CME speed sets your scramble timer."
  },
  seps: {
    icon: "", mins: { j: 3, s: 5 },
    title: { j: "Particle storms and why the Moon is risky", s: "Solar particle events and the lunar surface" },
    learn: {
      j: `<p>Big solar storms can also fire out a shower of tiny, super-fast particles. This is called a <b>solar particle event</b>. These particles are the main <b>radiation</b> danger for astronauts.</p>
        <h3>They can arrive fast</h3>
        <p>The fastest particles can arrive within <b>hours</b>, way before the slower CME cloud. That's why astronauts need to get to shelter quickly.</p>
        <h3>Earth has bodyguards. The Moon doesn't.</h3>
        [[widget]]
        <p>On Earth, our thick air and our planet's magnetic field protect us. The Moon has <b>no thick air</b> and <b>no magnetic field</b>, so the particles hit the surface directly. That's why a Moon base needs a storm shelter.</p>`,
      s: `<p>A <b>solar particle event (SPE)</b> is a burst of energetic particles (mostly protons) accelerated by flares and by the shock waves in front of fast CMEs. NOAA rates them on the <b>S-scale</b> from S1 (minor) to S5 (extreme).</p>
        <h3>Timeline of a storm</h3>
        <p>Flare photons arrive in about 8 minutes. The most energetic protons can arrive within tens of minutes to hours. The CME itself takes about 1–4 days. In October 2024, proton flux crossed the S1 threshold about 3 hours after the X1.8 flare and reached S2 by 07:30 UTC.</p>
        [[widget]]
        <h3>Shielding on the surface</h3>
        <p>Earth's atmosphere and magnetosphere deflect or absorb most of these particles. The Moon has neither. On the surface, the Moon itself blocks half the sky, which helps, but the other half is wide open. An analysis on NASA's Technical Reports Server estimates a large SPE on the lunar surface at about <b>100 mSv</b> without extra protection.</p>
        <div class="callout real">📈 May 2024 had several proton events before, during and after the main storm. That's why Flight Director mode can throw a "second surge" at you.</div>
        <p class="small muted">Sources: ${src("https://www.spaceweather.live/en/archive/2024/10/09/sidc-ursigram.html", "SIDC bulletin, Oct 9 2024")} · ${src("https://ntrs.nasa.gov/api/citations/20250006168/downloads/ASCEND%20Simonsen%20draft%201.pdf", "NASA NTRS: radiation exposure overview")}</p>`
    },
    quiz: {
      j: [
        { q: "What arrives first after a big solar storm starts?", o: ["The fast particle shower", "The CME cloud", "They arrive together"], a: 0, why: "The particles can arrive in hours. The CME cloud takes days." },
        { q: "Why is the Moon riskier than Earth during a solar storm?", o: ["It's closer to the Sun", "It has no thick air and no magnetic field", "It's always night there"], a: 1, why: "Earth's air and magnetic field protect us. The Moon has neither." }
      ],
      s: [
        { q: "What mainly accelerates the protons in a solar particle event?", o: ["Earth's magnetic field", "Flares and CME-driven shock waves", "Moonquakes"], a: 1, why: "Flare reconnection and the shocks in front of fast CMEs both accelerate particles." },
        { q: "Why does an astronaut on the lunar surface get roughly half the exposure of one in free space, all else equal?", o: ["The Moon has a weak magnetic field", "The Moon's body blocks half the sky", "Lunar dust absorbs protons"], a: 1, why: "Particles from 'below' are blocked by the Moon itself, so only half the sky contributes." },
        { q: "Which order of arrival is correct for a big eruption?", o: ["CME → particles → light", "Light → energetic particles → CME", "Particles → light → CME"], a: 1, why: "Light (8.3 min), then energetic particles (minutes to hours), then the CME (about 1–4 days)." }
      ]
    },
    widget: "moon", play: "If a storm has a particle event, you shelter longer and take more dose."
  },
  /* ---------------- UNIT 2 ---------------- */
  dose: {
    icon: "📟", mins: { j: 3, s: 6 },
    title: { j: "Radiation dose and dosimeters", s: "Dose, sieverts and NASA's limits" },
    learn: {
      j: `<p>Your <b>radiation dose</b> is how much radiation your body has soaked up. It adds up over time, a bit like filling a bucket drop by drop.</p>
        <h3>Dosimeters</h3>
        <p>You can't see or feel radiation, so astronauts wear small devices called <b>dosimeters</b> that measure it. NASA's Orion spacecraft also has radiation sensors that warn the crew when to take shelter.</p>
        [[widget]]
        <h3>Limits keep astronauts safe</h3>
        <p>NASA sets a limit on how much radiation an astronaut can get in their whole career. Mission teams track every person's dose, not just the crew average.</p>
        <div class="callout">💊 Medicine can help someone feel better, but it can't take radiation back out of the body. Protecting people <b>before</b> they're exposed is what works.</div>`,
      s: `<p><b>Effective dose</b> is measured in <b>sieverts (Sv)</b>. It weights the absorbed energy by radiation type and by how sensitive each tissue is. Spaceflight doses are usually given in millisieverts (mSv).</p>
        <h3>NASA's standards (NASA-STD-3001)</h3>
        <p>An astronaut's <b>career</b> effective dose must stay below <b>600 mSv</b>, the same for all ages and sexes. Exposure from a single <b>solar particle event</b> is limited to <b>250 mSv</b>.</p>
        [[widget]]
        <h3>How the game converts this</h3>
        <p>Flight Director mode shows dose as a <b>percentage of the mission's radiation budget</b>. That's a game abstraction. It's not a real mSv reading, because a real dose depends on the exact particle spectrum and shielding geometry.</p>
        <div class="callout real">📟 Orion carries HERA (Hybrid Electronic Radiation Assessor) units to warn the crew, and astronauts wear personal dosimeters. NASA has set dose-rate thresholds ahead of time that trigger building the shelter.</div>
        <p class="small muted">Sources: ${src("https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf", "NASA OCHMO radiation protection technical brief")} · ${src(LINKS.orion.url, "NASA: Orion radiation protection plan")}</p>`
    },
    quiz: {
      j: [
        { q: "What does a dosimeter do?", o: ["Measures how much radiation you've received", "Makes oxygen", "Blocks radiation"], a: 0, why: "A dosimeter measures dose. It doesn't block anything." },
        { q: "Can medicine take radiation dose back out of your body?", o: ["Yes, right away", "No. It can help you feel better, but the dose stays", "Only on the Moon"], a: 1, why: "That's why shielding before exposure matters so much." },
        { q: "Why do teams track each astronaut's dose, not just the average?", o: ["Because one person could get much more than the others", "It's more fun", "They don't"], a: 0, why: "An average can hide one person who's in danger." }
      ],
      s: [
        { q: "What is NASA's career effective dose limit for astronauts?", o: ["50 mSv", "250 mSv", "600 mSv", "1,000 mSv"], a: 2, why: "NASA-STD-3001 sets a universal career limit of 600 mSv." },
        { q: "A chest X-ray is about 0.1 mSv. How many equal NASA's 250 mSv per-SPE limit?", o: ["25", "250", "2,500", "25,000"], a: 2, why: "250 ÷ 0.1 = 2,500." },
        { q: "An estimated large SPE on the lunar surface is ~100 mSv unshielded. What fraction of the 600 mSv career limit is that?", o: ["About 1/60", "About 1/6", "About 1/2"], a: 1, why: "100 / 600 ≈ 0.17, about one sixth of a whole career's budget from one storm." },
        { q: "Why does the game show '% of limit' instead of real mSv?", o: ["Real doses depend on spectrum and shielding geometry the game doesn't model", "mSv is too hard", "NASA doesn't use mSv"], a: 0, why: "Showing fake precision would be dishonest, so the abstraction is labeled clearly." }
      ]
    },
    widget: "dose", play: "Packing dosimeters lets you see each crew member's dose."
  },
  shielding: {
    icon: "🛡️", mins: { j: 3, s: 6 },
    title: { j: "Shielding: why water is a wall", s: "Shielding physics and the storm shelter" },
    learn: {
      j: `<p><b>Shielding</b> means putting stuff between you and the radiation. The more stuff, the fewer particles get through.</p>
        <h3>Why water and food?</h3>
        <p>Water and food are full of <b>hydrogen</b>, which is really good at slowing down the Sun's particles. Astronauts already carry lots of water and food, so they can use them as a wall!</p>
        [[widget]]
        <h3>The catch</h3>
        <p>Every bag you put in the wall is a bag you can't eat or drink until the storm is over. Protection and survival pull in opposite directions. That's a real engineering trade-off.</p>
        <div class="callout real">🚀 <b>NASA does this for real!</b> If a solar storm hits, Orion crews plan to build a shelter from stowage bags full of supplies, packed against the spacecraft's least-protected walls.</div>`,
      s: `<p>Charged particles lose energy as they pass through matter. Shielding is described by <b>areal density</b> (g/cm²): the mass of material per area along the particle's path. Hydrogen-rich materials (water, polyethylene, food) are among the most effective per kilogram, and mass is the most expensive thing in spaceflight.</p>
        <h3>Diminishing returns</h3>
        <p>The game uses a simplified exponential model: each unit removes a fixed fraction of what's left (transmission = e<sup>−0.16n</sup>). The first units do the most work. Later units cost the same consumables but help less.</p>
        [[widget]]
        <h3>Geometry matters</h3>
        <p>On Artemis I, the most shielded areas such as Orion's storm shelter gave about <b>4× more protection</b> than the least shielded spots. For Artemis II, NASA's plan was to bungee supplies to the least-shielded wall. That's why dosimeter mapping makes each unit more effective in the game.</p>
        <div class="callout real">🛰️ Orion can be converted into a storm shelter within about 30 minutes of an alert by moving stowage contents to line its least-shielded walls.</div>
        <p class="small muted">Source: ${src(LINKS.orion.url, "NASA: Orion radiation protection plan")}</p>`
    },
    quiz: {
      j: [
        { q: "Why are water and food good for a storm wall?", o: ["They're full of hydrogen, which slows particles", "They're shiny", "They're cold"], a: 0, why: "Hydrogen is great at slowing down the Sun's particles." },
        { q: "What's the downside of putting all your water in the wall?", o: ["Nothing", "You can't drink it until the storm is over", "It makes the wall weaker"], a: 1, why: "That's the trade-off: protection versus supplies." }
      ],
      s: [
        { q: "With transmission = e^(−0.16n), what fraction gets through with 6 units?", o: ["About 16%", "About 38%", "About 60%", "About 84%"], a: 1, why: "e^(−0.96) ≈ 0.38." },
        { q: "Going from 0→3 units vs 9→12 units: which cuts more dose?", o: ["0→3", "9→12", "Same"], a: 0, why: "Exponential attenuation means the early units remove the most dose. That's diminishing returns." },
        { q: "Why is mapping dose with dosimeters before stacking supplies so valuable?", o: ["Dose varies a lot by position, so mass is best placed at the weakest spots", "Dosimeters add shielding", "It isn't valuable"], a: 0, why: "Artemis I showed about a 4× difference between the most and least shielded spots, so placement multiplies the value of each kilogram." }
      ]
    },
    widget: "shield", play: "Day 1 asks you to build exactly this wall."
  },
  /* ---------------- UNIT 3 ---------------- */
  power: {
    icon: "", mins: { j: 3, s: 5 },
    title: { j: "Power and air: keeping the base alive", s: "Power budgets and life support" },
    learn: {
      j: `<p>A Moon base needs electricity for everything: making clean air, heating, the radio to Earth, and science experiments.</p>
        <h3>The power budget</h3>
        <p>When power runs low, the crew must decide what to switch off. <b>Air always stays on</b>. You can't switch off breathing! Everything else is a choice.</p>
        [[widget]]
        <h3>The air problem: CO₂</h3>
        <p>Every time you breathe out, you add <b>carbon dioxide (CO₂)</b> to the air. In a closed base, a <b>scrubber</b> filter removes it. When the filter fills up, you need a spare.</p>
        <div class="callout real"><b>True story: Apollo 13 (1970).</b> CO₂ built up in the spacecraft. The spare filters were the wrong shape: square ones that didn't fit the round holes! Engineers on Earth invented a fix from duct tape, plastic bags and cardboard, and the crew built it and made it home safely.</div>`,
      s: `<p>Habitats run on a <b>power budget</b>: available energy versus each system's draw. Engineers classify loads ahead of time. Life support is critical. Thermal control, comms and payloads are shed in a set order during an emergency.</p>
        <h3>Endurance math</h3>
        <p class="mono">days of endurance = reserve ÷ total draw per day</p>
        [[widget]]
        <h3>Life support and CO₂</h3>
        <p>Lithium hydroxide (LiOH) canisters absorb CO₂ chemically and become saturated. On <b>Apollo 13</b>, the lunar module's canisters were sized for two people for about 30 hours. Three astronauts needed it as a lifeboat for days. The command module's spares were square and didn't fit the LM's round sockets. Mission Control designed an adapter from a suit hose, plastic bags, cardboard and duct tape.</p>
        <div class="callout">The lesson engineers took from it: standardize interfaces, and carry spares that actually fit. In the game, packing the spare filters turns a crisis into a two-minute swap.</div>
        <p class="small muted">Source: ${src(LINKS.apollo13.url, "NASA Apollo Flight Journal: building the CO₂ adapter")}</p>`
    },
    quiz: {
      j: [
        { q: "Which system must ALWAYS stay on?", o: ["The heaters", "The air system", "The radio"], a: 1, why: "You can survive cold or silence for a while, but not without air." },
        { q: "What did the Apollo 13 crew use to fix their CO₂ problem?", o: ["A brand-new spaceship", "Duct tape, plastic bags and cardboard", "Moon rocks"], a: 1, why: "Engineers on Earth designed a fix from what was on board, and it worked!" }
      ],
      s: [
        { q: "Reserve 50%, draw 13%/day. About how many days of endurance?", o: ["2.6", "3.8", "6.5"], a: 1, why: "50 ÷ 13 ≈ 3.85 days." },
        { q: "Adding a +30% battery to that 50% reserve at 13%/day gives about…", o: ["4.6 days", "6.2 days", "8 days"], a: 1, why: "80 ÷ 13 ≈ 6.15 days." },
        { q: "What was the root cause of Apollo 13's CO₂ problem?", o: ["Incompatible canister shapes between two vehicles", "A broken fan", "Too much oxygen"], a: 0, why: "The CM's square LiOH canisters didn't fit the LM's round sockets, which is an interface-standardization failure." }
      ]
    },
    widget: "power", play: "Day 2 is a power crunch."
  },
  comms: {
    icon: "", mins: { j: 2, s: 4 },
    title: { j: "Talking to Earth", s: "Light-time delay and crew autonomy" },
    learn: {
      j: `<p>Radio messages travel at the <b>speed of light</b>, which is about 300,000 km every second. That's super fast, but space is super big!</p>
        [[widget]]
        <p>A message to the Moon takes about <b>1.3 seconds</b>. A message to Mars takes about <b>3 to 22 minutes</b>, depending on where the planets are.</p>
        <div class="callout">Imagine asking Mission Control for help on Mars, then waiting up to 44 minutes for the answer! Future Mars crews will have to make big decisions on their own.</div>`,
      s: `<p>Signals travel at <i>c</i> ≈ 299,792 km/s. One-way light time is simply distance ÷ <i>c</i>.</p>
        <p class="mono">Moon: 384,400 km → 1.28 s one way · 2.6 s round trip</p>
        [[widget]]
        <h3>Why it matters operationally</h3>
        <p>At lunar distance, Mission Control can talk a crew through a procedure almost in real time. At Mars (about 3–22 minutes one way), a question and answer can take up to about 45 minutes. Crews have to be trained, and given flight rules, to make time-critical decisions on their own. In the game, switching off the radio gives you a taste of that.</p>`
    },
    quiz: {
      j: [
        { q: "About how long does a radio message take to reach the Moon?", o: ["1.3 seconds", "1 hour", "1 day"], a: 0, why: "The Moon is about 384,400 km away, which takes light about 1.3 seconds." },
        { q: "Why will Mars crews need to make more decisions on their own?", o: ["Messages take minutes to arrive", "Mars has no radios", "Mission Control sleeps"], a: 0, why: "Each message takes about 3 to 22 minutes one way, so help can't arrive instantly." }
      ],
      s: [
        { q: "At 225 million km, what is the one-way light time to Mars?", o: ["~1.25 min", "~12.5 min", "~45 min"], a: 1, why: "2.25×10⁸ km ÷ 3×10⁵ km/s = 750 s = 12.5 min." },
        { q: "What's the round-trip delay to the Moon?", o: ["~1.3 s", "~2.6 s", "~13 s"], a: 1, why: "Twice the one-way 1.28 s." }
      ]
    },
    widget: "comms", play: "Mission Control's messages arrive after the real 1.3 s delay."
  },
  /* ---------------- UNIT 4 ---------------- */
  donki: {
    icon: "", mins: { j: 3, s: 6 },
    title: { j: "How NASA watches the Sun", s: "DONKI and how this game uses real data" },
    learn: {
      j: `<p>NASA has a team called the <b>Moon to Mars Space Weather Analysis Office</b>. Their job is to watch the Sun every day and warn missions when a storm is coming.</p>
        <p>They save every flare, CME and particle storm in a big online database called <b>DONKI</b>. That stands for Space Weather Database Of Notifications, Knowledge, Information.</p>
        <h3>Our game uses DONKI's real numbers!</h3>
        [[widget]]
        <p>Every storm in the game really happened. The faster, bigger and stronger the real storm was, the harder your mission is.</p>`,
      s: `<p><b>DONKI</b> (Space Weather Database Of Notifications, Knowledge, Information) is run by NASA's Community Coordinated Modeling Center. Its primary catalog (M2M_CATALOG) holds events analyzed by the <b>Moon to Mars Space Weather Analysis Office</b> from June 2020 to the present. It has a public API with endpoints for flares (FLR), CMEs and CME analyses, solar particle events (SEP) and geomagnetic storms (GST).</p>
        <h3>From record to game rule</h3>
        <p>The game reads a few fields from each storm and maps them to gameplay. Pick a storm to see the mapping:</p>
        [[widget]]
        <h3>Kp and the G-scale</h3>
        <p>The Kp index (0–9) measures how much Earth's magnetic field is disturbed. NOAA's G-scale follows it: G1 = Kp 5 up to <b>G5 = Kp 9</b>, which the May 2024 storm reached. Kp describes effects at <i>Earth</i>, so in the game it drives Earth-side events (busy Mission Control, auroras at home), not radiation at the base.</p>
        <p class="small muted">Sources: ${src(DONKI_URL, "NASA CCMC: DONKI")} · ${src(LINKS.may2024.url, "NASA: the May 2024 storm")}</p>`
    },
    quiz: {
      j: [
        { q: "What is DONKI?", o: ["NASA's database of space weather events", "A Moon rover", "A type of flare"], a: 0, why: "DONKI is where NASA's space weather team records every storm." },
        { q: "In the game, a faster real CME gives you…", o: ["more time to scramble", "less time to scramble", "more food"], a: 1, why: "Faster storm = less warning, just like real life." }
      ],
      s: [
        { q: "Which DONKI field sets the scramble timer in the game?", o: ["Flare class", "CME speed", "Kp index"], a: 1, why: "500 km/s gives 60 s and 2,000 km/s gives 20 s, linear in between (×0.75 in Flight Director)." },
        { q: "Why does Kp drive Earth-side events instead of radiation dose in the game?", o: ["Kp measures disturbance of Earth's magnetic field, not particle dose at the Moon", "Kp is unreliable", "The Moon has a Kp index"], a: 0, why: "Kp is a geomagnetic index for Earth. The Moon has no magnetosphere." },
        { q: "What is the primary DONKI catalog, and when does it start?", o: ["M2M_CATALOG, June 2020", "NOAA_CATALOG, 1859", "SOHO_CATALOG, 2024"], a: 0, why: "The M2M_CATALOG holds events analyzed by the Moon to Mars office since June 2020." }
      ]
    },
    widget: "donki", play: "Every mission uses one of these real storms."
  }
};

/* ---------------- interactive tools ---------------- */
const WIDGETS = {
  flare: {
    html() {
      return SR()
        ? `<div class="widget" data-wid="flare"><h4>Flare class calculator</h4>
            <label>Class letter <input type="range" min="0" max="4" value="3" data-w="flare" class="w-cls" aria-label="Flare class letter"></label>
            <label>Multiplier <input type="range" min="10" max="99" value="50" data-w="flare" class="w-mag" aria-label="Flare multiplier"></label>
            <div class="readout w-out"></div><div class="w-bar"></div></div>`
        : `<div class="widget" data-wid="flare"><h4>Try it: change the flare's letter</h4>
            <input type="range" min="0" max="2" value="0" data-w="flare" class="w-cls" aria-label="Flare letter: C, M or X">
            <div class="readout w-out"></div><div class="w-bar" style="display:flex;flex-wrap:wrap;gap:3px;margin-top:8px"></div></div>`;
    },
    update(r) {
      if (SR()) {
        const L = "ABCMX", i = +$(".w-cls", r).value, m = +$(".w-mag", r).value / 10;
        const flux = m * Math.pow(10, i - 8), ref = 1.8e-4;
        const ratio = flux / ref;
        $(".w-out", r).innerHTML = `${L[i]}${m.toFixed(1)} → peak ${m.toFixed(1)} × 10<sup>${i - 8}</sup> W/m² · ${ratio >= 1 ? ratio.toFixed(1) + "× stronger" : (1 / ratio).toFixed(1) + "× weaker"} than the X1.8 Bullseye flare`;
        const pct = clamp((Math.log10(flux) + 8) / 5 * 100, 2, 100);
        $(".w-bar", r).innerHTML = `<div class="progressbar" style="margin-top:8px"><i style="width:${pct}%"></i></div><div class="small muted mono">log scale: A ← → X10</div>`;
      } else {
        const i = +$(".w-cls", r).value, L = ["C", "M", "X"][i], n = [1, 10, 100][i];
        $(".w-out", r).innerHTML = `An <b>${L}</b> flare is as strong as <b>${n}</b> C flare${n > 1 ? "s" : ""}!`;
        $(".w-bar", r).innerHTML = Array.from({ length: n }, () => `<span style="font-size:${n > 10 ? 12 : 22}px">☀️</span>`).join("");
      }
    }
  },
  cme: {
    html() {
      return `<div class="widget" data-wid="cme"><h4>${SR() ? "Transit time calculator (constant speed)" : "Try it: how fast is the storm cloud?"}</h4>
        <input type="range" min="300" max="3000" step="10" value="1509" data-w="cme" class="w-v" aria-label="CME speed in km per second">
        <div class="readout w-out"></div><div class="small muted w-x"></div></div>`;
    },
    update(r) {
      const v = +$(".w-v", r).value, h = 1.5e8 / v / 3600;
      if (SR()) {
        $(".w-out", r).innerHTML = `v = ${fmt(v)} km/s → t = 1.5×10⁸ / ${fmt(v)} = ${fmt(1.5e8 / v)} s ≈ <b>${h.toFixed(1)} h</b> (${(h / 24).toFixed(2)} d)`;
        $(".w-x", r).textContent = v >= 1400 && v <= 1600 ? "Compare: the Oct 9, 2024 CME really took 36.6 h. It decelerated on the way." : `Game scramble at this speed: ${Math.round(lerp(v, 500, 2000, 60, 20) * 0.75)} s`;
      } else {
        $(".w-out", r).innerHTML = `${fmt(v)} km every second → reaches the Moon in about <b>${Math.round(h)} hours</b> (${(h / 24).toFixed(1)} days)`;
        $(".w-x", r).textContent = `At that speed you could fly across the USA in about ${Math.max(1, Math.round(4500 / v))} seconds! Game scramble: ${Math.round(lerp(v, 500, 2000, 60, 20))} seconds.`;
      }
    }
  },
  moon: {
    html() {
      return `<div class="widget"><h4>${SR() ? "Magnetosphere vs. bare surface" : "Earth vs. Moon"}</h4>
      <svg viewBox="0 0 600 200" style="width:100%;height:auto" role="img" aria-label="Earth's magnetic field deflects particles. The Moon has no field, so particles hit it.">
        <g stroke="#ffb020" stroke-width="3" stroke-linecap="round">${[30, 60, 90, 120, 150, 180].map(y => `<line x1="10" y1="${y}" x2="60" y2="${y}"/>`).join("")}</g>
        <text x="10" y="18" fill="#ffb020" font-size="13">particles →</text>
        <ellipse cx="200" cy="100" rx="95" ry="70" fill="none" stroke="#3fd9c4" stroke-width="2" stroke-dasharray="6 5"/>
        <ellipse cx="200" cy="100" rx="70" ry="50" fill="none" stroke="#3fd9c4" stroke-width="2" stroke-dasharray="6 5"/>
        <circle cx="200" cy="100" r="34" fill="#2f6fd6"/><circle cx="200" cy="100" r="40" fill="none" stroke="#9ad7ff" stroke-width="4" opacity=".5"/>
        <path d="M60 60 Q 120 40 160 20M60 140 Q120 160 160 180" stroke="#ffb020" stroke-width="3" fill="none"/>
        <text x="200" y="190" fill="#cfd7ef" font-size="14" text-anchor="middle">Earth: ${SR() ? "magnetosphere + atmosphere" : "magnetic field + air"}</text>
        <g stroke="#ffb020" stroke-width="3" stroke-linecap="round">${[60, 85, 110, 135].map(y => `<line x1="330" y1="${y}" x2="455" y2="${y}"/>`).join("")}</g>
        <circle cx="490" cy="100" r="34" fill="#9aa0b5"/><circle cx="480" cy="92" r="6" fill="#7d8398"/><circle cx="500" cy="112" r="4" fill="#7d8398"/>
        <text x="490" y="190" fill="#cfd7ef" font-size="14" text-anchor="middle">Moon: ${SR() ? "no shielding" : "no protection"}</text>
      </svg></div>`;
    },
    update() {}
  },
  dose: {
    html() {
      if (!SR()) return `<div class="widget" data-wid="dose"><h4>Try it: fill the dose bucket</h4>
        <label>Days in a storm with a thin wall <input type="range" min="0" max="5" value="1" data-w="dose" class="w-d" aria-label="Days with thin wall"></label>
        <label>Wall: <input type="range" min="0" max="1" value="0" data-w="dose" class="w-t" aria-label="Thin or thick wall"></label>
        <div class="readout w-out"></div><div class="progressbar" style="height:22px;margin-top:8px"><i class="w-fill" style="width:0"></i></div></div>`;
      const rows = [["Chest X-ray", 0.1], ["NY–London round-trip flight", 0.1], ["Large SPE on the lunar surface (est.)", 100], ["NASA per-SPE limit", 250], ["NASA career limit", 600]];
      return `<div class="widget"><h4>Dose comparison (mSv, log scale)</h4>
        ${rows.map(([n, v]) => `<div class="small" style="margin-top:6px">${n} <span class="mono muted">${v} mSv</span></div><div class="progressbar"><i style="width:${clamp((Math.log10(v) + 2) / (Math.log10(600) + 2) * 100, 3, 100)}%"></i></div>`).join("")}
        <p class="small muted" style="margin-top:8px">Sources: NASA OCHMO technical brief (limits); NASA NTRS radiation overview (X-ray, flight and lunar SPE estimates).</p></div>`;
    },
    update(r) {
      const d = +$(".w-d", r).value, thick = +$(".w-t", r).value === 1;
      const v = Math.min(100, d * (thick ? 6 : 15));
      $(".w-out", r).innerHTML = `${thick ? "🧱 Thick wall" : "🧻 Thin wall"} for ${d} day${d === 1 ? "" : "s"} → dose <b>${v}</b> ${v >= 70 ? "😟 too high!" : v >= 40 ? "😐 getting high" : "🙂 low"}`;
      const f = $(".w-fill", r); f.style.width = v + "%"; f.style.background = v >= 70 ? "var(--bad)" : v >= 40 ? "var(--warn)" : "var(--good)";
    }
  },
  shield: {
    html() {
      return `<div class="widget" data-wid="shield"><h4>${SR() ? "Attenuation model: transmission = e^(−0.16n)" : "Try it: stack bags in the wall"}</h4>
        <input type="range" min="0" max="12" value="3" data-w="shield" class="w-n" aria-label="Units in the wall">
        <div class="readout w-out"></div><div class="w-dots" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px"></div></div>`;
    },
    update(r) {
      const n = +$(".w-n", r).value, t = Math.exp(-0.16 * n), through = Math.round(t * 50);
      if (SR()) {
        const next = Math.exp(-0.16 * (n + 1)), gain = (t - next) * 100;
        $(".w-out", r).innerHTML = `n = ${n} (${n * 5} kg of water) → transmission <b>${(t * 100).toFixed(0)}%</b> · next unit removes only ${gain.toFixed(1)} more points`;
      } else {
        $(".w-out", r).innerHTML = `<b>${n}</b> bag${n === 1 ? "" : "s"} in the wall → <b>${through}</b> of 50 particles get through`;
      }
      $(".w-dots", r).innerHTML = Array.from({ length: 50 }, (_, i) => `<span style="width:12px;height:12px;border-radius:50%;display:inline-block;background:${i < through ? "#ffb020" : "#26305a"}"></span>`).join("");
    }
  },
  power: {
    html() {
      const cap = SR() ? 50 : 60;
      return `<div class="widget eng" data-wid="power" data-cap="${cap}"><h4>${SR() ? `Endurance: reserve ${cap}%` : `Try it: you have ${cap}% power`}</h4>
        <label class="sys"><input type="checkbox" checked disabled> Air system <span class="w">6%/day</span></label>
        <label class="sys"><input type="checkbox" checked data-w="power" class="w-h"> Heaters <span class="w">4%/day</span></label>
        <label class="sys"><input type="checkbox" checked data-w="power" class="w-r"> Radio <span class="w">3%/day</span></label>
        <label class="sys"><input type="checkbox" checked data-w="power" class="w-f"> Science freezer <span class="w">3%/day</span></label>
        <div class="readout w-out"></div></div>`;
    },
    update(r) {
      const cap = +r.dataset.cap, draw = 6 + ($(".w-h", r).checked ? 4 : 0) + ($(".w-r", r).checked ? 3 : 0) + ($(".w-f", r).checked ? 3 : 0);
      const days = cap / draw;
      $(".w-out", r).innerHTML = SR() ? `${cap} ÷ ${draw} = <b>${days.toFixed(2)} days</b> of endurance` : `Using ${draw}% a day, your power lasts about <b>${Math.floor(days)} days</b>. ${days >= 4 ? "✅ Enough for a 4-day storm!" : "⚠️ Not enough for a 4-day storm."}`;
    }
  },
  comms: {
    html() {
      return SR()
        ? `<div class="widget" data-wid="comms"><h4>Light-time calculator</h4>
            <input type="range" min="0" max="100" value="0" data-w="comms" class="w-d" aria-label="Distance from Earth"><div class="readout w-out"></div></div>`
        : `<div class="widget" data-wid="comms"><h4>Try it: where are you?</h4>
            <input type="range" min="0" max="2" value="0" data-w="comms" class="w-d" aria-label="Moon, Mars close, or Mars far"><div class="readout w-out"></div></div>`;
    },
    update(r) {
      const v = +$(".w-d", r).value;
      if (SR()) {
        const d = Math.pow(10, lerp(v, 0, 100, Math.log10(384400), Math.log10(4.01e8)));
        const t = d / 299792;
        $(".w-out", r).innerHTML = `${fmt(d)} km → one way <b>${t < 120 ? t.toFixed(2) + " s" : (t / 60).toFixed(1) + " min"}</b> · round trip ${t * 2 < 120 ? (t * 2).toFixed(2) + " s" : (t * 2 / 60).toFixed(1) + " min"}`;
      } else {
        const opts = [["🌕 The Moon", "1.3 seconds"], ["🔴 Mars (closest)", "about 3 minutes"], ["🔴 Mars (farthest)", "about 22 minutes"]][v];
        $(".w-out", r).innerHTML = `${opts[0]}: a message takes <b>${opts[1]}</b> one way`;
      }
    }
  },
  donki: {
    html() {
      return `<div class="widget" data-wid="donki"><h4>${SR() ? "Record → game parameters" : "Try it: pick a real storm"}</h4>
        <input type="range" min="0" max="${STORMS.length - 1}" value="1" data-w="donki" class="w-s" aria-label="Pick a storm"><div class="w-out"></div></div>`;
    },
    update(r) {
      const st = STORMS[+$(".w-s", r).value], d = derive(st);
      $(".w-out", r).innerHTML = SR()
        ? `<table class="telemetry"><tr><td>Storm</td><td>${esc(st.name)} (${esc(st.dateText)})</td></tr>
            <tr><td>CME speed → scramble</td><td>${fmt(st.cmeSpeed)} km/s → ${d.scrambleSeconds} s</td></tr>
            <tr><td>Flare → dose/day</td><td>${esc(st.flareClass || "none")} → ${d.radiationPerDay.toFixed(1)}%</td></tr>
            <tr><td>SEP → shelter, multiplier</td><td>${st.hasSEP ? "yes" : "no"} → ${d.shelterDays} d, ×${d.doseMultiplier}</td></tr>
            <tr><td>Kp → Earth events</td><td>${st.maxKp} → ${d.commsEvents}</td></tr>
            <tr><td>Half-angle → near-miss chance</td><td>${st.cmeHalfAngle ?? "n/a"}° → ${Math.round(d.nearMissChance * 100)}%</td></tr>
            <tr><td>Difficulty</td><td>${d.label}</td></tr></table>`
        : `<div class="facts"><div class="fact"><div class="k">Storm</div><div class="v">${esc(st.name)}</div><div class="x">${esc(st.dateText)}</div></div>
            <div class="fact"><div class="k">Cloud speed</div><div class="v">${fmt(st.cmeSpeed)} km/s</div><div class="x">→ ${d.scrambleSeconds}-second scramble</div></div>
            <div class="fact"><div class="k">Flare</div><div class="v">${esc(st.flareClass || "None")}</div><div class="x">→ ${d.radiationPerDay >= 15 ? "lots of" : d.radiationPerDay >= 10 ? "more" : "a little"} radiation per day</div></div>
            <div class="fact"><div class="k">Particle storm</div><div class="v">${st.hasSEP ? "Yes" : "No"}</div><div class="x">→ ${d.shelterDays} days in the shelter</div></div></div>`;
    }
  }
};
function initWidgets() { document.querySelectorAll(".widget[data-wid]").forEach(r => { const w = WIDGETS[r.dataset.wid]; if (w) w.update(r); }); }

/* ---------------- progress (saved separately for each age group) ---------------- */
const acKey = () => "academy:" + MODE;
const acGet = () => store.get(acKey(), { lessons: {}, last: null });
function acSave(p) { store.set(acKey(), p); }
const lessonState = (id) => acGet().lessons[id] || {};
function lessonStatus(id) { const l = lessonState(id); return l.mastered ? "mastered" : (l.read || l.tried) ? "read" : ""; }
function totalPoints() { const p = acGet(); return Object.values(p.lessons).reduce((a, l) => a + (l.best || 0), 0); }
const ptsLabel = (n) => SR() ? `${n} XP` : `⭐ ${n} star points`;
function statusIcon(id) { const st = lessonStatus(id); return `<span class="status ${st}" aria-label="${st || "not started"}">${st === "mastered" ? "✓" : ""}</span>`; }

/* ---------------- Academy home ---------------- */
function academyScreen() {
  S = null; hudVisible(false);
  const mastered = ORDER.filter(id => lessonStatus(id) === "mastered").length;
  const next = ORDER.find(id => lessonStatus(id) !== "mastered") || ORDER[0];
  show(`
  <section>
    <div class="ac-top"><div class="crumbs"><button data-act="title">Home</button> › Space Academy</div><div class="points">${ptsLabel(totalPoints())}</div></div>
    <div class="panel ac-hero">
      <div>
        <h1>Space Academy</h1>
        <p class="story">${SR()
          ? "The physics, engineering and data behind every decision in the mission. Each lesson has a short article, an interactive model and practice problems. Master all eight to earn your Flight Director certification."
          : "Learn the real science behind the game! Each lesson has a short story, something to try, and practice questions. Master all 8 lessons to earn your Junior Astronaut wings."}</p>
        <div class="btn-row" style="justify-content:flex-start"><button class="btn big primary" data-act="lesson" data-arg="${next}">${mastered ? "Continue" : "Start learning"}: ${esc(L_(LESSONS[next].title))} ▶</button></div>
      </div>
      <div>
        <div class="small muted">Course mastery</div>
        <div class="readout" style="font-family:var(--head);font-size:2rem">${mastered} / ${ORDER.length} <span class="small muted">lessons mastered</span></div>
        <div class="progressbar"><i style="width:${mastered / ORDER.length * 100}%"></i></div>
        <div class="small muted" style="margin-top:8px"><span class="status" style="display:inline-grid;vertical-align:middle;width:16px;height:16px"></span> not started · <span class="status read" style="display:inline-grid;vertical-align:middle;width:16px;height:16px"></span> in progress · <span class="status mastered" style="display:inline-grid;vertical-align:middle;width:16px;height:16px"></span> mastered</div>
        ${mastered === ORDER.length ? `<div class="callout real" style="margin-top:10px">${SR() ? "Flight Director certified. Go fly the Extreme storm." : "You earned your Junior Astronaut wings!"}</div>` : ""}
      </div>
    </div>
    <div class="units">
      ${UNITS.map(u => `<div class="panel unit"><h3>${u.icon} ${esc(L_(u.title))}</h3>
        <div class="small muted">${u.lessons.filter(id => lessonStatus(id) === "mastered").length} of ${u.lessons.length} mastered</div>
        ${u.lessons.map(id => `<button class="lesson-row" data-act="lesson" data-arg="${id}">${statusIcon(id)}<span>${LESSONS[id].icon} ${esc(L_(LESSONS[id].title))}<br><span class="small muted">${L_(LESSONS[id].mins)} min · ${L_(LESSONS[id].quiz).length} practice questions</span></span></button>`).join("")}
      </div>`).join("")}
    </div>
    <div class="btn-row"><button class="btn big primary" data-act="intro">Play the mission</button><button class="btn" data-act="sources">Data & sources</button><button class="btn" data-act="title">Home</button></div>
  </section>`);
}

/* ---------------- Lesson page ---------------- */
let Q = null; // current practice session
function lessonScreen(id, tab = "learn") {
  if (!LESSONS[id]) id = ORDER[0];
  S = null; hudVisible(false);
  const Ls = LESSONS[id], u = unitOf(id), p = acGet();
  p.last = id; acSave(p);
  const side = UNITS.map(uu => `<div class="small muted" style="margin-top:10px;font-family:var(--head)">${uu.icon} ${esc(L_(uu.title))}</div>` +
    uu.lessons.map(l => `<button class="lesson-row ${l === id ? "current" : ""}" data-act="lesson" data-arg="${l}">${statusIcon(l)}<span>${esc(L_(LESSONS[l].title))}</span></button>`).join("")).join("");
  const qs = L_(Ls.quiz);
  let body;
  if (tab === "learn") {
    body = `<div class="article">${L_(Ls.learn).replace("[[widget]]", WIDGETS[Ls.widget].html())}
      <div class="callout"><b>In the game:</b> ${esc(Ls.play)}</div>
      <div class="btn-row" style="justify-content:flex-start"><button class="btn big primary" data-act="startPractice" data-arg="${id}">Practice: ${qs.length} questions ▶</button></div></div>`;
  } else {
    body = `<div class="quiz" id="quiz"></div>`;
  }
  show(`
  <section>
    <div class="ac-top"><div class="crumbs"><button data-act="title">Home</button> › <button data-act="academy">Space Academy</button> › ${esc(L_(u.title))}</div><div class="points">${ptsLabel(totalPoints())}</div></div>
    <div class="lesson-layout">
      <aside class="lesson-side panel" aria-label="Lessons">${side}</aside>
      <div class="panel">
        <h1>${esc(L_(Ls.title))}</h1>
        <div class="small muted">${L_(Ls.mins)} min read · ${qs.length} practice questions · ${lessonStatus(id) === "mastered" ? "Mastered" : lessonStatus(id) ? "In progress" : "Not started"}</div>
        <div class="tabs" role="tablist">
          <button role="tab" aria-selected="${tab === "learn"}" data-act="lesson" data-arg="${id}">Learn</button>
          <button role="tab" aria-selected="${tab === "practice"}" data-act="startPractice" data-arg="${id}">Practice</button>
        </div>
        ${body}
      </div>
    </div>
  </section>`);
  if (tab === "learn") initWidgets(); else renderQuestion();
}
function startPractice(id) {
  const p = acGet(); p.lessons[id] = { ...(p.lessons[id] || {}), read: true }; acSave(p);
  Q = { id, i: 0, pick: null, checked: false, firstTry: [], wrongOnce: false };
  lessonScreen(id, "practice");
}
function renderQuestion() {
  const box = $("#quiz"); if (!box || !Q) return;
  const qs = L_(LESSONS[Q.id].quiz), q = qs[Q.i];
  const dots = qs.map((_, i) => `<i class="${i < Q.i ? "done" : i === Q.i ? "now" : ""}"></i>`).join("");
  let fb = "";
  if (Q.checked) {
    const right = Q.pick === q.a;
    fb = `<div class="feedback ${right ? "right" : "wrong"}"><b>${right ? (SR() ? "Correct." : "Nice job! 🎉") : (SR() ? "Not quite." : "Not quite, try again!")}</b> ${right ? q.why : (SR() ? "Re-check the article above, then try again." : "Read the hint and give it another go.")}</div>`;
  }
  box.innerHTML = `<div class="qdots" aria-label="Question ${Q.i + 1} of ${qs.length}">${dots}</div>
    <h3 style="margin-top:4px">${esc(q.q)}</h3>
    ${q.o.map((o, i) => `<button class="opt ${Q.checked && i === q.a && Q.pick === q.a ? "right" : ""} ${Q.checked && i === Q.pick && Q.pick !== q.a ? "wrong" : ""}" data-act="pickOpt" data-arg="${i}" aria-pressed="${Q.pick === i}" ${Q.checked && Q.pick === q.a ? "disabled" : ""}>${esc(o)}</button>`).join("")}
    ${fb}
    <div class="btn-row" style="justify-content:flex-start">
      ${Q.checked && Q.pick === q.a
        ? `<button class="btn big primary" data-act="nextQ">${Q.i + 1 < qs.length ? "Next question ▶" : "Finish ▶"}</button>`
        : `<button class="btn big primary" data-act="checkAns" ${Q.pick == null ? "disabled" : ""}>Check</button>`}
      ${Q.wrongOnce && !(Q.checked && Q.pick === q.a) ? `<button class="btn" data-act="hintQ">💡 ${SR() ? "Show worked answer" : "Get a hint"}</button>` : ""}
    </div><div id="hintbox"></div>`;
}
function finishPractice() {
  const id = Q.id, qs = L_(LESSONS[id].quiz);
  const first = Q.firstTry.filter(Boolean).length;
  const pts = Q.firstTry.reduce((a, ok) => a + (ok ? 10 : 5), 0);
  const need = Math.max(1, Math.round(qs.length * 0.67)), mastered = first >= need;
  const p = acGet(); const prev = p.lessons[id] || {};
  p.lessons[id] = { ...prev, read: true, tried: true, best: Math.max(prev.best || 0, pts), mastered: prev.mastered || mastered };
  acSave(p);
  const idx = ORDER.indexOf(id), next = ORDER[idx + 1];
  mastered ? Sound.good() : Sound.bad();
  const box = $("#quiz");
  box.innerHTML = `<div class="done-card">
    <div class="big-emoji">${mastered ? "" : ""}</div>
    <h2>${mastered ? (SR() ? "Lesson mastered" : "You mastered it!") : (SR() ? "Practiced: not mastered yet" : "Good practice!")}</h2>
    <p>${first} of ${qs.length} right on the first try · <b>+${pts} ${SR() ? "XP" : "star points"}</b></p>
    <p class="muted">${mastered ? "" : `Get ${need} or more right on the first try to master this lesson.`}</p>
    <div class="btn-row">
      ${!mastered ? `<button class="btn big primary" data-act="startPractice" data-arg="${id}">Try again</button>` : ""}
      ${next ? `<button class="btn big ${mastered ? "primary" : ""}" data-act="lesson" data-arg="${next}">Up next: ${esc(L_(LESSONS[next].title))} ▶</button>` : `<button class="btn big primary" data-act="academy">Back to Space Academy</button>`}
      <button class="btn" data-act="intro">Use it in the mission</button>
    </div></div>`;
}

/* =====================================================================
   ACTIONS
   ===================================================================== */
const ACTIONS = {
  title: titleScreen,
  academy: academyScreen,
  lesson(id) { Q = null; lessonScreen(id, "learn"); },
  startPractice,
  pickOpt(i) { if (!Q) return; Q.pick = +i; Q.checked = false; renderQuestion(); },
  checkAns() {
    if (!Q || Q.pick == null) return;
    const q = L_(LESSONS[Q.id].quiz)[Q.i], right = Q.pick === q.a;
    if (Q.firstTry[Q.i] === undefined) Q.firstTry[Q.i] = right;
    Q.checked = true; if (!right) Q.wrongOnce = true;
    right ? Sound.good() : Sound.bad();
    renderQuestion();
  },
  nextQ() { Q.i++; Q.pick = null; Q.checked = false; Q.wrongOnce = false; if (Q.i >= L_(LESSONS[Q.id].quiz).length) finishPractice(); else renderQuestion(); },
  hintQ() { const q = L_(LESSONS[Q.id].quiz)[Q.i]; $("#hintbox").innerHTML = `<div class="callout">💡 ${esc(q.why)}</div>`; },
  setMode(m) {
    const target = m === "senior" ? "senior" : "junior";
    if (target === MODE || modeSwitchTransitioning) return;
    modeSwitchTransitioning = true;
    const fadeMs = 480;
    let fader = $("#mode-fader");
    if (!fader) {
      fader = document.createElement("div");
      fader.id = "mode-fader";
      fader.setAttribute("aria-hidden", "true");
      document.body.appendChild(fader);
    }
    fader.classList.add("on");
    setTimeout(() => {
      MODE = target;
      store.set("mode", MODE);
      applyMode();
      suppressShowFade = true;
      titleScreen();
      suppressShowFade = false;
      requestAnimationFrame(() => fader.classList.remove("on"));
      setTimeout(() => { modeSwitchTransitioning = false; }, fadeMs + 30);
    }, fadeMs);
  },
  wallCommit() { const n = $("#wallN"); choose("wall:" + (n ? n.value : 0)); },
  powerCommit() { const g = (id) => { const el = document.getElementById(id); return el && el.checked ? 1 : 0; }; choose(`power:h${g("sysHeat")}r${g("sysRadio")}f${g("sysFreezer")}b${g("sysBatt")}`); },
  quit() {
    if (!S || !S.storm || S.ending) return titleScreen();
    openModal(`<h2 id="modal-title">Quit this mission?</h2><p>Your progress in this mission will be lost.</p><div class="btn-row"><button class="btn danger" data-act="title">Yes, quit to title</button><button class="btn" data-act="replay">Restart this storm</button></div>`);
  },
  intro: introScreen,
  select: selectScreen,
  sources: sourcesScreen,
  glossary,
  closeModal,
  term(k) { const t = TERMS[k]; if (t) openModal(`<h2 id="modal-title">${t[0]}</h2><p>${t[1]}</p>`); },
  sound() { Sound.on = !Sound.on; store.set("sound", Sound.on); syncSoundBtn(); if (Sound.on) Sound.click(); },
  pick(id) { newGame(STORMS.find(s => s.id === id)); alertScreen(); },
  live: loadLive,
  liveCached() { const c = store.get("liveCache", null); if (c) { newGame(c); alertScreen(); } else selectScreen(); },
  scramble: scrambleScreen,
  grab,
  seal() { seal(false); },
  nextDay() { S.dayIdx = 0; dayScreen(); },
  choose,
  advance,
  ending: endingScreen,
  debrief: debriefScreen,
  replay() { closeModal(); newGame(lastStorm); alertScreen(); }
};

syncSoundBtn();
applyMode();
titleScreen();
