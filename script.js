window.addEventListener("error", function (e) {
  var wrap = document.querySelector(".wrap");
  var pre = document.createElement("pre");
  pre.style.cssText = "color:#ff5555;white-space:pre-wrap;direction:ltr;text-align:left;font-size:12px;width:100%;";
  pre.textContent = "Game error:\n" + (e.message || e.error);
  wrap.prepend(pre);
});

// ============================================================
// NOVA STRIKE — vanilla JS space shooter
// ============================================================

var W = 960;
var H = 540;
var TOTAL_LEVELS = 25;

var STAGE_NAMES = [
  "Asteroid Field", "Ghost Nebula", "Meteor Belt", "Frozen Reach", "Serpent Marsh",
  "Dark Gate", "Iron Foundry", "Storm Frontier", "Galactic Core", "Phantom Reach",
  "Shadow Alley", "Comet Corridor", "Hydra's Den", "Cursed Hollow", "Burning Void",
  "Abyssal Trench", "Empress Domain", "Judgement Ring", "Plague Expanse", "Moon Maze",
  "Solar Furnace", "Astral Vault", "Chaos Rift", "Ruin Galaxy", "Throne of Stars",
];

// Each boss has a unique look (shape), its own move pattern, and its own attack pattern.
var BOSS_DEFS = [
  { name: "Crimson Guardian",   shape: "crystal",   c1: "#ff2d55", c2: "#7a0033", accent: "#ffe0e8", move: "sideToSide", attack: "spreadShot" },
  { name: "Blue Dragon",        shape: "dragon",     c1: "#2f9bff", c2: "#0a2e66", accent: "#bff0ff", move: "swoop",      attack: "waveShot" },
  { name: "Eye of the Storm",   shape: "eye",        c1: "#a855f7", c2: "#3b0a5e", accent: "#f0d9ff", move: "float",      attack: "laserSweep" },
  { name: "Frost Sentinel",     shape: "frost",      c1: "#7de8ff", c2: "#0a3a4a", accent: "#ffffff", move: "sideToSide", attack: "spreadShot" },
  { name: "Venom Serpent",      shape: "serpent",    c1: "#4ade80", c2: "#0a3a1a", accent: "#d9ff4a", move: "sway",       attack: "waveShot" },
  { name: "Void Reaper",        shape: "reaper",     c1: "#7a3bff", c2: "#0a0018", accent: "#e0d9ff", move: "teleport",   attack: "homing" },
  { name: "Iron Colossus",      shape: "mech",       c1: "#9aa5b1", c2: "#2a2f36", accent: "#ffea00", move: "sideToSide", attack: "burstRapid" },
  { name: "Thunder Behemoth",   shape: "beast",      c1: "#ffd23f", c2: "#7a5a00", accent: "#fff7cc", move: "charge",     attack: "homing" },
  { name: "King of the Galaxy", shape: "king",       c1: "#ffd23f", c2: "#7a5a00", accent: "#fff2b8", move: "sideToSide", attack: "spiral" },
  { name: "Ether Phantom",      shape: "phantom",    c1: "#2dd4bf", c2: "#0a3330", accent: "#c9fff5", move: "phase",      attack: "waveShot" },
  { name: "Shadow Assassin",    shape: "blade",      c1: "#6b21a8", c2: "#0a0018", accent: "#ff2d55", move: "teleport",   attack: "burstRapid" },
  { name: "Star Devourer",      shape: "devourer",   c1: "#ff8c1a", c2: "#5a2a00", accent: "#ffd9a8", move: "pulseForward", attack: "swarmShot" },
  { name: "Crystal Hydra",      shape: "hydra",      c1: "#00f0ff", c2: "#0a3a4a", accent: "#ff00e0", move: "sideToSide", attack: "spreadShot" },
  { name: "Space Curse",        shape: "curse",      c1: "#39ff6a", c2: "#0a2a10", accent: "#c8ffd6", move: "erratic",    attack: "homing" },
  { name: "Inferno Titan",      shape: "giant",      c1: "#ff4d00", c2: "#3a0a00", accent: "#ffd23f", move: "pulseForward", attack: "swarmShot" },
  { name: "Abyssal Leviathan",  shape: "seamonster", c1: "#0a5cff", c2: "#00060f", accent: "#7de8ff", move: "sway",       attack: "waveShot" },
  { name: "Nebula Empress",     shape: "orb",        c1: "#ff00e0", c2: "#3a0033", accent: "#ffd9f7", move: "orbit",      attack: "spiral" },
  { name: "Celestial Judge",    shape: "judge",      c1: "#fff2cc", c2: "#8a7a3a", accent: "#00f0ff", move: "float",      attack: "laserSweep" },
  { name: "Plague Harbinger",   shape: "swarm",      c1: "#8aff2a", c2: "#1a3a00", accent: "#2a5a00", move: "erratic",    attack: "swarmShot" },
  { name: "Dark Emperor",       shape: "emperor",    c1: "#3a3a4a", c2: "#0a0010", accent: "#ff2d55", move: "sideToSide", attack: "spiral" },
  { name: "Solar Wraith",       shape: "phantom",    c1: "#ff7a1a", c2: "#4a1a00", accent: "#ffe0a8", move: "phase",      attack: "burstRapid" },
  { name: "Astral Sovereign",   shape: "king",       c1: "#c084fc", c2: "#2a0a4a", accent: "#00f0ff", move: "orbit",      attack: "spiral" },
  { name: "Chaos Incarnate",    shape: "blob",       c1: "#ff2d55", c2: "#1a0018", accent: "#39ff6a", move: "erratic",    attack: "swarmShot" },
  { name: "Void Sovereign",     shape: "reaper",     c1: "#0a0018", c2: "#5a00aa", accent: "#00f0ff", move: "teleport",   attack: "homing" },
  { name: "Lord of the Cosmos", shape: "cosmos",     c1: "#ffd23f", c2: "#7a3bff", accent: "#ffffff", move: "orbit",      attack: "allPattern" },
];
var BOSS_NAMES = BOSS_DEFS.map(function (b) { return b.name; });

var MAX_HEALTH = 100;
var HIT_DAMAGE = 16; // gentler than before so the hull bar drains slowly
var TOP_BAND_MIN = 46;
var ROW_GAP = 46;

// ============================================================
// PERSISTENT STORAGE (local to this browser/device)
// ============================================================
var STORAGE_KEY = "novaStrike_save_v2";
function loadSave() {
  var def = {
    highScore: 0,
    coins: 0,
    playCount: 0,
    ownedShips: [0],
    selectedShip: 0,
    upgrades: { fireRate: 0, damage: 0, multishot: 0, rockets: 0 },
    lang: "en",
  };
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return def;
    var parsed = JSON.parse(raw);
    return Object.assign(def, parsed, { upgrades: Object.assign(def.upgrades, parsed.upgrades || {}) });
  } catch (e) { return def; }
}

// ============================================================
// i18n — English / Arabic
// ============================================================
var LANG = {
  en: {
    howtoTitle: "📖 HOW TO PLAY",
    howtoIntro: "Pilot your ship across {n} space sectors. Destroy enemy waves, collect power-ups, and defeat each sector’s unique boss.",
    howtoControls: "CONTROLS",
    howtoMove: "Virtual joystick or A/D/W/S / arrow keys — move freely in any direction",
    howtoFire: "Hold Space or the FIRE button to shoot. Each weapon type has its own sound & look.",
    howtoPause: "P key or the Pause button — pause the game. Use 🌐 to switch English / Arabic.",
    howtoPowerups: "POWER-UPS (pick up the floating shapes)",
    puRapid: "⚡ Yellow lightning — Rapid Fire (much faster shooting)",
    puShield: "💧 Cyan hex — Barrier +5 (blocks the next 5 hits)",
    puDamage: "🌀 Magenta spiked orb — Damage Up (stronger bullets)",
    puTriple: "❄ Three cyan diamonds — Triple Shot (3 bullets at once)",
    puWingman: "🛸 Mini green ship — Wingman drone fights beside you",
    puRocket: "🚀 Orange rocket — Rocket Barrage (explosive splash)",
    puDual: "🟡 Twin yellow capsules — Dual Laser (2 high-speed beams)",
    puBeam: "🔴 Red crystal beam — Death Beam (hold FIRE to melt a column)",
    puFrost: "🔵 Ice crystal — Frost Shot (piercing icy bolts)",
    puNova: "🟢 Green star — Nova Burst (shots explode in an area)",
    howtoHint: "🪙 Coins buy ships & upgrades in the Shop. Weapon power-ups replace each other until they expire, then your base weapon returns.",
    btnNext: "NEXT ▶",
    startTitle: "🚀 READY FOR LAUNCH?",
    startIntro: "Destroy enemies, clear {n} sectors, and beat the boss of each round!",
    btnStart: "▶ START GAME",
    btnShop: "🛒 SHOP",
    playCountNote: "🌍 Total players: ",
    pausedTitle: "⏸ GAME PAUSED",
    pausedHint: "Press P or Resume to continue",
    btnResume: "▶ RESUME",
    btnQuit: "🚪 EXIT TO MENU",
    quitCoins: "🪙 Coins collected so far this run are saved automatically when you exit.",
    goTitle: "💥 GAME OVER",
    goScore: "Final score:",
    goCoins: "Coins earned:",
    goLevel: "Reached sector:",
    newHigh: "🏅 NEW HIGH SCORE!",
    btnAgain: "🔄 PLAY AGAIN",
    winTitle: "🏆 GALAXY SAVED!",
    winIntro: "You defeated every boss!",
    shopTitle: "🛒 STARSHIP SHOP",
    tabShips: "Ships",
    tabUpgrades: "Upgrades",
    btnClose: "✖ CLOSE",
    hull: "🛡️ Hull",
    sectorProgress: "Sector Progress",
    shield: "SHIELD",
    btnFire: "🔥 FIRE",
    soundOn: "🔊 Sound",
    soundOff: "🔇 Muted",
    pause: "⏸ Pause",
    resume: "▶ Resume",
    warning: "⚠️ WARNING ⚠️",
    bossArrived: "HAS ARRIVED",
    bossDestroyed: "✅ BOSS DESTROYED!",
    sector: "SECTOR",
  },
  ar: {
    howtoTitle: "📖 طريقة اللعب",
    howtoIntro: "قد سفينتك عبر {n} قطاع فضائي. دمّر موجات الأعداء، اجمع الباور-أبس، واهزم بوس كل قطاع.",
    howtoControls: "التحكم",
    howtoMove: "الجويستيك أو A/D/W/S / الأسهم — حركة حرة في أي اتجاه",
    howtoFire: "اضغط مطوّل على Space أو زرار FIRE عشان تطلق. كل نوع سلاح له صوت وشكل مختلف.",
    howtoPause: "حرف P أو زرار الإيقاف — إيقاف مؤقت. زرار 🌐 لتغيير اللغة عربي / إنجليزي.",
    howtoPowerups: "الباور-أبس (التقط الأشكال الطايعة)",
    puRapid: "⚡ صاعقة صفرا — إطلاق سريع (تضرب أسرع بكتير)",
    puShield: "💧 سداسي سماوي — حاجز +5 (بيمتص 5 ضربات)",
    puDamage: "🌀 كرة شوك بنفسجي — ضرر أعلى (طلقات أقوى)",
    puTriple: "❄ 3 ماسات سيان — ضربة ثلاثية (3 طلقات مرة واحدة)",
    puWingman: "🛸 سفينة خضرا صغيرة — درون مساعد بيقاتل جنبك",
    puRocket: "🚀 صاروخ برتقالي — رشقة صواريخ متفجرة",
    puDual: "🟡 كبسولتين صفرا — ليزر مزدوج (شعاعين بسرعة عالية)",
    puBeam: "🔴 بلورة حمرا — شعاع الموت (اضغط FIRE عشان يدمر عمود كامل)",
    puFrost: "🔵 كريستال تلج — طلقات ثلج تخترق الأعداء",
    puNova: "🟢 نجمة خضرا — انفجار نوفا (طلقاتك بتنفجر مساحيًا)",
    howtoHint: "🪙 الكوينز تشتري سفن وترقيات من المتجر. باور-أب السلاح بيستبدل اللي قبله، ولما مدته تخلص السلاح الأساسي يرجع.",
    btnNext: "التالي ◀",
    startTitle: "🚀 جاهز للإطلاق؟",
    startIntro: "دمّر الأعداء، خلّص {n} قطاع، واهزم بوس كل جولة!",
    btnStart: "▶ ابدأ اللعبة",
    btnShop: "🛒 المتجر",
    playCountNote: "🌍 إجمالي اللاعبين: ",
    pausedTitle: "⏸ اللعبة متوقفة",
    pausedHint: "اضغط P أو استئناف عشان تكمل",
    btnResume: "▶ استئناف",
    btnQuit: "🚪 الخروج للقائمة",
    quitCoins: "🪙 الكوينز اللي جمعتها في الجولة دي بتتحفظ تلقائي لما تخرج.",
    goTitle: "💥 انتهت اللعبة",
    goScore: "النتيجة النهائية:",
    goCoins: "الكوينز المكتسبة:",
    goLevel: "وصلت لقطاع:",
    newHigh: "🏅 رقم قياسي جديد!",
    btnAgain: "🔄 العب تاني",
    winTitle: "🏆 المجرة اتنقذت!",
    winIntro: "هزمت كل البوسات!",
    shopTitle: "🛒 متجر السفن",
    tabShips: "السفن",
    tabUpgrades: "الترقيات",
    btnClose: "✖ إغلاق",
    hull: "🛡️ الهيكل",
    sectorProgress: "تقدم القطاع",
    shield: "الدرع",
    btnFire: "🔥 نار",
    soundOn: "🔊 صوت",
    soundOff: "🔇 صامت",
    pause: "⏸ إيقاف",
    resume: "▶ استئناف",
    warning: "⚠️ تحذير ⚠️",
    bossArrived: "وصل",
    bossDestroyed: "✅ البوس اتهدم!",
    sector: "قطاع",
  }
};

function t(key) {
  var pack = LANG[save.lang] || LANG.en;
  return pack[key] || (LANG.en[key] || key);
}

function applyLang() {
  var lang = save.lang || "en";
  var pack = LANG[lang] || LANG.en;
  document.documentElement.lang = lang === "ar" ? "ar" : "en";
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(function (node) {
    var key = node.getAttribute("data-i18n");
    if (!pack[key]) return;
    var val = pack[key];
    if (key === "howtoIntro" || key === "startIntro") {
      val = val.replace("{n}", String(TOTAL_LEVELS));
      // preserve nested spans if any
      var span = node.querySelector("span");
      if (span && (span.id === "introLevels" || span.id === "startLevels")) {
        node.innerHTML = val.replace(String(TOTAL_LEVELS), "<span id=\"" + span.id + "\">" + TOTAL_LEVELS + "</span>");
        return;
      }
    }
    if (key === "playCountNote") {
      var pc = document.getElementById("playCountVal");
      var num = pc ? pc.textContent : "…";
      node.innerHTML = val + "<span id=\"playCountVal\" style=\"color:#00f0ff;font-weight:700;\">" + num + "</span>";
      return;
    }
    node.textContent = val;
  });
  var langBtn = document.getElementById("langBtn");
  if (langBtn) langBtn.textContent = lang === "ar" ? "🌐 عربي" : "🌐 EN";
  // refresh dynamic buttons
  if (typeof state !== "undefined" && state.phase) {
    var pauseBtn = document.getElementById("pauseBtn");
    if (pauseBtn) pauseBtn.textContent = state.phase === "paused" ? t("resume") : t("pause");
  }
  var soundBtn = document.getElementById("soundBtn");
  if (soundBtn && typeof snd !== "undefined") {
    soundBtn.textContent = snd.enabled ? t("soundOn") : t("soundOff");
  }
}
function persistSave() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(save)); } catch (e) {}
}
var save = loadSave();

// ============================================================
// GLOBAL PLAY COUNTER — shared across every device/visitor.
// Two backends, tried in order:
//  1. Claude's own shared key-value storage (window.storage) — used only
//     when this file is running inside Claude's own file preview.
//  2. CountAPI (https://countapi.mileshilliard.com) — a free, no-signup
//     public counting service. This is what kicks in once the file is
//     hosted for real (e.g. on GitHub Pages), since window.storage only
//     exists inside Claude's preview. It's a third-party free service —
//     reliable most of the time, but not guaranteed to stay online forever,
//     and every key/value on it is publicly readable (fine here, since this
//     is just a numeric play count with nothing private in it).
// ============================================================
var GLOBAL_PLAY_COUNT_KEY = "novaStrike:totalPlayers";
var COUNTAPI_KEY = "novastrike_mohamedhassan_totalplayers_v1";
var COUNTAPI_BASE = "https://countapi.mileshilliard.com/api/v1";

async function loadGlobalPlayCount() {
  if (window.storage) {
    try {
      var res = await window.storage.get(GLOBAL_PLAY_COUNT_KEY, true);
      var current = (res && res.value) ? (parseInt(res.value, 10) || 0) : 0;
      el.playCountVal.textContent = current;
    } catch (e) {
      el.playCountVal.textContent = 0; // key not created yet
    }
    return;
  }
  try {
    var r = await fetch(COUNTAPI_BASE + "/get/" + COUNTAPI_KEY);
    if (r.status === 404) { el.playCountVal.textContent = 0; return; }
    var data = await r.json();
    el.playCountVal.textContent = data.value || 0;
  } catch (err) {
    el.playCountVal.textContent = "—";
  }
}
async function bumpGlobalPlayCount() {
  if (window.storage) {
    try {
      var current = 0;
      try {
        var res = await window.storage.get(GLOBAL_PLAY_COUNT_KEY, true);
        current = (res && res.value) ? (parseInt(res.value, 10) || 0) : 0;
      } catch (e) { current = 0; }
      var next = current + 1;
      await window.storage.set(GLOBAL_PLAY_COUNT_KEY, String(next), true);
      el.playCountVal.textContent = next;
    } catch (err) {
      // Shared storage isn't available in this environment — leave the
      // counter showing whatever it last loaded.
    }
    return;
  }
  try {
    var r = await fetch(COUNTAPI_BASE + "/hit/" + COUNTAPI_KEY);
    var data = await r.json();
    el.playCountVal.textContent = data.value || "—";
  } catch (err) {
    // Offline, or the free counting service is unreachable right now —
    // leave the counter showing its last-known number instead of clearing it.
  }
}

// ============================================================
// SHIP & UPGRADE DEFINITIONS
// ============================================================
var SHIPS = [
  { id: 0, name: "Falcon", cost: 0, speed: 6, fireRateMul: 1, dmgBonus: 0, multiBonus: 0, weapon: "pulse",
    hull: "#00f0ff", wing: "#0066aa", accent: "#ff00e0" },
  { id: 1, name: "Raptor", cost: 300, speed: 7.2, fireRateMul: 0.85, dmgBonus: 0, multiBonus: 0, weapon: "pulse",
    hull: "#ff8c1a", wing: "#a83e00", accent: "#ffd23f" },
  { id: 2, name: "Vanguard", cost: 700, speed: 6.2, fireRateMul: 1, dmgBonus: 1, multiBonus: 0, weapon: "laser",
    hull: "#a259ff", wing: "#4b1f8a", accent: "#4ade80" },
  { id: 3, name: "Aurora", cost: 1500, speed: 8, fireRateMul: 0.8, dmgBonus: 1, multiBonus: 1, weapon: "spread",
    hull: "#ff4fd8", wing: "#3fd0ff", accent: "#ffea00" },
  { id: 4, name: "Nomad", cost: 2400, speed: 7, fireRateMul: 0.9, dmgBonus: 2, multiBonus: 0, weapon: "missile",
    hull: "#39ff6a", wing: "#0a6b2a", accent: "#00f0ff" },
  { id: 5, name: "Phantom", cost: 3600, speed: 8.6, fireRateMul: 0.72, dmgBonus: 1, multiBonus: 1, weapon: "laser",
    hull: "#2dd4bf", wing: "#0a3330", accent: "#ff00e0" },
  { id: 6, name: "Warlord", cost: 5200, speed: 6.8, fireRateMul: 0.78, dmgBonus: 3, multiBonus: 1, weapon: "missile",
    hull: "#ff2d55", wing: "#5a0018", accent: "#ffd23f" },
  { id: 7, name: "Singularity", cost: 7500, speed: 9, fireRateMul: 0.6, dmgBonus: 2, multiBonus: 2, weapon: "plasma",
    hull: "#c084fc", wing: "#2a0a4a", accent: "#ffffff" },
  { id: 8, name: "Stinger", cost: 9000, speed: 9.5, fireRateMul: 0.55, dmgBonus: 2, multiBonus: 1, weapon: "homing",
    hull: "#f97316", wing: "#7c2d12", accent: "#fef08a" },
  { id: 9, name: "Eclipse", cost: 11000, speed: 7.5, fireRateMul: 0.7, dmgBonus: 4, multiBonus: 2, weapon: "plasma",
    hull: "#1e1b4b", wing: "#312e81", accent: "#a5b4fc" },
  { id: 10, name: "Nebula Wing", cost: 13000, speed: 10, fireRateMul: 0.5, dmgBonus: 3, multiBonus: 2, weapon: "homing",
    hull: "#06b6d4", wing: "#0e7490", accent: "#f0abfc" },
  { id: 11, name: "Titan Core", cost: 16000, speed: 6.5, fireRateMul: 0.85, dmgBonus: 5, multiBonus: 1, weapon: "missile",
    hull: "#eab308", wing: "#854d0e", accent: "#fef9c3" },
];

var UPGRADE_DEFS = {
  fireRate: { label: "Fire Rate", max: 5, baseCost: 150, step: 110, desc: "Shoot faster" },
  damage: { label: "Bullet Damage", max: 5, baseCost: 150, step: 110, desc: "Bullets hit harder" },
  multishot: { label: "Multishot", max: 3, baseCost: 400, step: 300, desc: "Extra parallel bullets" },
  rockets: { label: "Rocket Pods", max: 3, baseCost: 500, step: 350, desc: "Chance to fire explosive rockets" },
};
function upgradeCost(key, currentLevel) {
  var d = UPGRADE_DEFS[key];
  return d.baseCost + currentLevel * d.step;
}

function currentShip() { return SHIPS[save.selectedShip] || SHIPS[0]; }

// ============================================================
// SOUND ENGINE
// ============================================================
function SoundEngine() {
  this.ctx = null;
  this.enabled = true;
  this.pitchMul = 1;
}
SoundEngine.prototype.setLevel = function (level) {
  this.pitchMul = 1 + (level - 1) * 0.06;
};
SoundEngine.prototype.ensure = function () {
  if (!this.ctx) {
    var AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
  }
  if (this.ctx.state === "suspended") this.ctx.resume();
  return this.ctx;
};
SoundEngine.prototype.tone = function (freq, dur, type, vol, slideTo) {
  if (!this.enabled) return;
  var ctx = this.ensure();
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), ctx.currentTime + dur);
  }
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur);
};
SoundEngine.prototype.shoot = function (kind) {
  var k = kind || "pulse";
  var p = this.pitchMul;
  if (k === "laser" || k === "dualLaser") {
    // sharp high laser zap
    this.tone(1400 * p, 0.07, "sawtooth", 0.055, 2200 * p);
    this.tone(2200 * p, 0.05, "square", 0.03, 900 * p);
  } else if (k === "missile") {
    // whoosh + low thump
    this.tone(180 * p, 0.18, "sawtooth", 0.08, 60 * p);
    this.tone(420 * p, 0.1, "triangle", 0.04, 120 * p);
  } else if (k === "plasma") {
    // thick electric blip
    this.tone(320 * p, 0.12, "sawtooth", 0.07, 90 * p);
    this.tone(640 * p, 0.08, "square", 0.04, 200 * p);
  } else if (k === "homing") {
    // soft seeker chirp
    this.tone(520 * p, 0.1, "sine", 0.06, 780 * p);
    this.tone(780 * p, 0.08, "triangle", 0.035, 520 * p);
  } else if (k === "frost") {
    // icy shimmer
    this.tone(960 * p, 0.11, "triangle", 0.05, 1400 * p);
    this.tone(1400 * p, 0.07, "sine", 0.03, 600 * p);
  } else if (k === "nova") {
    // punchy burst seed
    this.tone(240 * p, 0.1, "square", 0.07, 80 * p);
    this.tone(480 * p, 0.08, "sawtooth", 0.04, 160 * p);
  } else if (k === "deathBeam") {
    // continuous hum handled separately; short tick on start
    this.tone(90 * p, 0.2, "sawtooth", 0.1, 55 * p);
  } else if (k === "spread") {
    this.tone(700 * p, 0.07, "square", 0.04, 280 * p);
    this.tone(900 * p, 0.06, "square", 0.03, 350 * p);
  } else {
    // classic pulse
    this.tone(880 * p, 0.08, "square", 0.045, 300 * p);
  }
};
SoundEngine.prototype.enemyShoot = function () {
  this.tone(220 * this.pitchMul, 0.12, "sawtooth", 0.05, 120 * this.pitchMul);
};
SoundEngine.prototype.beamHum = function () {
  if (!this.enabled) return;
  if (this._beamUntil && Date.now() < this._beamUntil) return;
  this._beamUntil = Date.now() + 180;
  this.tone(70 * this.pitchMul, 0.22, "sawtooth", 0.06, 45 * this.pitchMul);
  this.tone(140 * this.pitchMul, 0.18, "triangle", 0.03, 90 * this.pitchMul);
};
SoundEngine.prototype.explosion = function (big) {
  if (!this.enabled) return;
  var ctx = this.ensure();
  var noise = ctx.createBufferSource();
  var dur = big ? 0.55 : 0.3;
  var buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  var data = buffer.getChannelData(0);
  for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  noise.buffer = buffer;
  var gain = ctx.createGain();
  gain.gain.setValueAtTime(big ? 0.35 : 0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  var filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = big ? 1400 : 1000;
  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start();
};
SoundEngine.prototype.hit = function () {
  this.tone(140 * this.pitchMul, 0.25, "triangle", 0.22, 60 * this.pitchMul);
};
SoundEngine.prototype.shieldBlock = function () {
  this.tone(700, 0.12, "sine", 0.12, 900);
};
SoundEngine.prototype.coin = function () {
  this.tone(1200, 0.09, "square", 0.07, 1600);
};
SoundEngine.prototype.powerup = function () {
  var self = this;
  [660, 990, 1320].forEach(function (f, i) {
    setTimeout(function () { self.tone(f, 0.12, "square", 0.08); }, i * 60);
  });
};
SoundEngine.prototype.startAmbient = function () {
  if (this.ambientStarted) return;
  this.ambientStarted = true;
  var ctx = this.ensure();
  var g = ctx.createGain();
  g.gain.value = this.enabled ? 0.03 : 0;
  var o1 = ctx.createOscillator();
  o1.type = "sine";
  o1.frequency.value = 55;
  var o2 = ctx.createOscillator();
  o2.type = "sine";
  o2.frequency.value = 82.5;
  var lfo = ctx.createOscillator();
  var lfoGain = ctx.createGain();
  lfo.frequency.value = 0.12;
  lfoGain.gain.value = 0.01;
  lfo.connect(lfoGain).connect(g.gain);
  o1.connect(g);
  o2.connect(g);
  g.connect(ctx.destination);
  o1.start();
  o2.start();
  lfo.start();
  this.ambientGain = g;
};
SoundEngine.prototype.setAmbientVolume = function () {
  if (this.ambientGain) {
    this.ambientGain.gain.setTargetAtTime(this.enabled ? 0.03 : 0, this.ctx.currentTime, 0.08);
  }
};
SoundEngine.prototype.levelUp = function () {
  var self = this;
  [523, 659, 784, 1046].forEach(function (f, i) {
    setTimeout(function () { self.tone(f, 0.15, "square", 0.1); }, i * 90);
  });
};
SoundEngine.prototype.bossAlarm = function () {
  if (!this.enabled) return;
  var self = this;
  var ctx = this.ensure();
  // deep pulsing alarm + dissonant layers
  [0, 1, 2, 3].forEach(function (i) {
    setTimeout(function () {
      self.tone(95, 0.38, "sawtooth", 0.18, 55);
      self.tone(140, 0.28, "square", 0.1, 70);
    }, i * 280);
  });
  // low rumble noise burst
  try {
    var noise = ctx.createBufferSource();
    var dur = 1.4;
    var buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * 0.7;
    noise.buffer = buffer;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    var filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 280;
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
  } catch (e) {}
};
SoundEngine.prototype.bossRoar = function () {
  if (!this.enabled) return;
  var ctx = this.ensure();
  // terrifying multi-layer roar: sub-bass + growl + metallic screech
  this.tone(42, 0.95, "sawtooth", 0.28, 22);
  this.tone(68, 0.75, "sawtooth", 0.2, 35);
  this.tone(110, 0.55, "square", 0.12, 55);
  try {
    var noise = ctx.createBufferSource();
    var dur = 1.1;
    var buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) {
      var env = 1 - i / data.length;
      data[i] = (Math.random() * 2 - 1) * env * env * 0.85;
    }
    noise.buffer = buffer;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.32, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    var filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 180;
    filter.Q.value = 0.8;
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
  } catch (e) {}
};
SoundEngine.prototype.gameOver = function () {
  var self = this;
  [440, 349, 261, 130].forEach(function (f, i) {
    setTimeout(function () { self.tone(f, 0.35, "triangle", 0.14); }, i * 200);
  });
};
SoundEngine.prototype.win = function () {
  var self = this;
  [523, 659, 784, 1046, 1318].forEach(function (f, i) {
    setTimeout(function () { self.tone(f, 0.25, "square", 0.12); }, i * 130);
  });
};

var snd = new SoundEngine();

// ============================================================
// DOM
// ============================================================
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var el = {
  scoreVal: document.getElementById("scoreVal"),
  highScoreVal: document.getElementById("highScoreVal"),
  coinsVal: document.getElementById("coinsVal"),
  levelVal: document.getElementById("levelVal"),
  totalLevelsVal: document.getElementById("totalLevelsVal"),
  startLevels: document.getElementById("startLevels"),
  playCountVal: document.getElementById("playCountVal"),
  soundBtn: document.getElementById("soundBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  healthPctVal: document.getElementById("healthPctVal"),
  healthFill: document.getElementById("healthFill"),
  progressBlock: document.getElementById("progressBlock"),
  progressLabel: document.getElementById("progressLabel"),
  progressVal: document.getElementById("progressVal"),
  progressFill: document.getElementById("progressFill"),
  bossBarBlock: document.getElementById("bossBarBlock"),
  bossNameVal: document.getElementById("bossNameVal"),
  bossFill: document.getElementById("bossFill"),
  shieldRow: document.getElementById("shieldRow"),
  banner: document.getElementById("banner"),
  overlayStart: document.getElementById("overlayStart"),
  overlayInstructions: document.getElementById("overlayInstructions"),
  btnInstructionsNext: document.getElementById("btnInstructionsNext"),
  introLevels: document.getElementById("introLevels"),
  overlayPaused: document.getElementById("overlayPaused"),
  overlayGameOver: document.getElementById("overlayGameOver"),
  overlayWin: document.getElementById("overlayWin"),
  overlayShop: document.getElementById("overlayShop"),
  goScore: document.getElementById("goScore"),
  goCoins: document.getElementById("goCoins"),
  goLevel: document.getElementById("goLevel"),
  goNewHigh: document.getElementById("goNewHigh"),
  winScore: document.getElementById("winScore"),
  winCoins: document.getElementById("winCoins"),
  winNewHigh: document.getElementById("winNewHigh"),
  btnStart: document.getElementById("btnStart"),
  btnShop: document.getElementById("btnShop"),
  btnShopPause: document.getElementById("btnShopPause"),
  btnShopOver: document.getElementById("btnShopOver"),
  btnCloseShop: document.getElementById("btnCloseShop"),
  btnResume: document.getElementById("btnResume"),
  btnQuit: document.getElementById("btnQuit"),
  btnRestart: document.getElementById("btnRestart"),
  btnRestartWin: document.getElementById("btnRestartWin"),
  btnFire: document.getElementById("btnFire"),
  joystickZone: document.getElementById("joystickZone"),
  joystickBase: document.getElementById("joystickBase"),
  joystickKnob: document.getElementById("joystickKnob"),
  shopGrid: document.getElementById("shopGrid"),
  shopCoinsVal: document.getElementById("shopCoinsVal"),
  tabShips: document.getElementById("tabShips"),
  tabUpgrades: document.getElementById("tabUpgrades"),
  rotateHint: document.getElementById("rotateHint"),
  btnRotateOk: document.getElementById("btnRotateOk"),
  stage: document.querySelector(".stage"),
};
el.totalLevelsVal.textContent = TOTAL_LEVELS;
el.introLevels.textContent = TOTAL_LEVELS;
el.startLevels.textContent = TOTAL_LEVELS;

// ============================================================
// GAME STATE
// ============================================================
var state = {
  player: { x: W / 2 - 20, y: H - 70, w: 40, h: 40, speed: 6, invuln: 0, shield: 3, maxShield: 3 },
  bullets: [],
  enemies: [],
  enemyBullets: [],
  particles: [],
  stars: [],
  pickups: [],
  wingman: null,
  boss: null,
  bossEntering: false,
  keys: {},
  touch: { left: false, right: false, up: false, down: false, fire: false, stickX: 0, stickY: 0 },
  score: 0,
  runCoins: 0,
  health: MAX_HEALTH,
  level: 1,
  killsThisLevel: 0,
  killsNeeded: 8,
  lastShot: 0,
  lastEnemySpawn: 0,
  lastEnemyShot: 0,
  lastBossShot: 0,
  running: false,
  phase: "start",
  shake: { time: 0, mag: 0 },
  effects: { rapidUntil: 0, wingmanUntil: 0, damageUntil: 0, tripleUntil: 0, missileUntil: 0, dualLaserUntil: 0, deathBeamUntil: 0, frostUntil: 0, novaUntil: 0, powerShield: 0 },
};

var rafId = 0;
var soundOn = true;
var bannerTimeout = null;
var floatLayer = document.querySelector(".stage");

var lastHudVals = { score: null, coins: null, level: null };
function bumpIfChanged(node, key, val) {
  if (lastHudVals[key] !== null && lastHudVals[key] !== val) {
    node.classList.remove("bump");
    void node.offsetWidth; // restart animation
    node.classList.add("bump");
  }
  lastHudVals[key] = val;
}
function syncHud() {
  bumpIfChanged(el.coinsVal, "coins", save.coins);
  bumpIfChanged(el.levelVal, "level", state.level);
  el.scoreVal.textContent = state.score;
  el.highScoreVal.textContent = save.highScore;
  el.coinsVal.textContent = save.coins;
  el.levelVal.textContent = state.level;
  var healthPct = Math.max(0, Math.min(100, (state.health / MAX_HEALTH) * 100));
  el.healthPctVal.textContent = Math.round(healthPct) + "%";
  el.healthFill.style.width = healthPct + "%";

  for (var i = 0; i < state.player.maxShield; i++) {
    var pip = document.getElementById("pip" + i);
    if (pip) pip.classList.toggle("used", i >= state.player.shield);
  }
  var barrierRow = document.getElementById("barrierRow");
  if (barrierRow) {
    barrierRow.style.display = state.effects.powerShield > 0 ? "inline-flex" : "none";
    document.getElementById("barrierVal").textContent = state.effects.powerShield;
  }

  if (state.boss || state.bossEntering) {
    el.bossBarBlock.style.display = "block";
    el.progressBlock.style.display = "none";
    el.bossNameVal.textContent = "⚠ " + (BOSS_NAMES[state.level - 1] || "BOSS") + " ⚠";
    var bossPct = state.boss && state.boss.maxHp > 0 ? Math.max(0, (state.boss.hp / state.boss.maxHp) * 100) : 100;
    el.bossFill.style.width = bossPct + "%";
  } else {
    el.bossBarBlock.style.display = "none";
    el.progressBlock.style.display = "block";
    el.progressLabel.textContent = STAGE_NAMES[state.level - 1] || "Sector";
    el.progressVal.textContent = Math.min(state.killsThisLevel, state.killsNeeded) + "/" + state.killsNeeded;
    el.progressFill.style.width = Math.min(100, (state.killsThisLevel / state.killsNeeded) * 100) + "%";
  }
}

function showBanner(text, ms, warn) {
  el.banner.textContent = text;
  el.banner.style.display = "block";
  el.banner.classList.toggle("warn", !!warn);
  if (bannerTimeout) clearTimeout(bannerTimeout);
  bannerTimeout = setTimeout(function () { el.banner.style.display = "none"; }, ms || 2200);
}

function floatText(x, y, text, color) {
  var pctX = (x / W) * 100;
  var pctY = (y / H) * 100;
  var d = document.createElement("div");
  d.className = "floattext";
  d.style.left = pctX + "%";
  d.style.top = pctY + "%";
  d.style.color = color || "#ffd23f";
  d.textContent = text;
  floatLayer.appendChild(d);
  setTimeout(function () { d.remove(); }, 1000);
}

function setPhase(phase) {
  state.phase = phase;
  el.overlayStart.classList.toggle("active", phase === "start");
  el.overlayPaused.classList.toggle("active", phase === "paused");
  el.overlayGameOver.classList.toggle("active", phase === "gameover");
  el.overlayWin.classList.toggle("active", phase === "win");
  el.overlayShop.classList.toggle("active", phase === "shop");
  el.pauseBtn.textContent = phase === "paused" ? t("resume") : t("pause");
  el.shieldRow.style.display = (phase === "playing" || phase === "boss" || phase === "bosswarning") ? "flex" : "none";
  // Before the game actually starts (instructions + ready screens), hide all HUD
  // chrome so the overlay gets the full screen; it reappears once play begins.
  document.body.classList.toggle("pregame", phase === "start");
}

function initStars() {
  var stars = [];
  for (var i = 0; i < 140; i++) {
    stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.6 + 0.2, s: Math.random() * 1.5 + 0.3,
    });
  }
  state.stars = stars;
}

// ============================================================
// PARTICLE FX — sparks, rings, debris
// ============================================================
function explode(x, y, color, big) {
  color = color || "#ff5555";
  var sparkCount = big ? 34 : 16;
  for (var i = 0; i < sparkCount; i++) {
    var ang = Math.random() * Math.PI * 2;
    var spd = Math.random() * (big ? 8 : 5) + 1;
    state.particles.push({
      type: "spark", x: x, y: y,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      life: 26 + Math.random() * 14, maxLife: 40, color: color, size: Math.random() * 2 + 1.5,
    });
  }
  var debrisCount = big ? 10 : 5;
  for (var j = 0; j < debrisCount; j++) {
    var ang2 = Math.random() * Math.PI * 2;
    var spd2 = Math.random() * (big ? 5 : 3) + 0.5;
    state.particles.push({
      type: "debris", x: x, y: y,
      vx: Math.cos(ang2) * spd2, vy: Math.sin(ang2) * spd2 - 1,
      life: 34 + Math.random() * 20, maxLife: 54, color: "#ffffff", size: Math.random() * 3 + 2,
      rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.3,
    });
  }
  state.particles.push({ type: "ring", x: x, y: y, life: big ? 26 : 18, maxLife: big ? 26 : 18, color: color, r: 4, maxR: big ? 60 : 30 });
  if (big) {
    state.particles.push({ type: "flash", x: x, y: y, life: 8, maxLife: 8, color: "#ffffff", r: 40 });
    shakeScreen(big ? 12 : 5, 16);
  } else {
    shakeScreen(3, 8);
  }
}

function shakeScreen(mag, time) {
  state.shake.mag = Math.max(state.shake.mag, mag);
  state.shake.time = Math.max(state.shake.time, time);
}

// ============================================================
// SHOP RENDERING
// ============================================================
var shopTab = "ships";
function drawMiniShip(canvasEl, ship) {
  var c = canvasEl.getContext("2d");
  var w = canvasEl.width = 60, h = canvasEl.height = 60;
  c.clearRect(0, 0, w, h);
  c.save();
  c.translate(w / 2, h / 2 + 6);
  c.fillStyle = ship.hull;
  c.beginPath();
  c.moveTo(0, -20);
  c.lineTo(16, 14);
  c.lineTo(0, 6);
  c.lineTo(-16, 14);
  c.closePath();
  c.fill();
  c.fillStyle = ship.accent;
  c.beginPath();
  c.arc(0, -4, 4, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function renderShop() {
  el.shopCoinsVal.textContent = save.coins;
  el.shopGrid.innerHTML = "";
  el.tabShips.classList.toggle("active", shopTab === "ships");
  el.tabUpgrades.classList.toggle("active", shopTab === "upgrades");

  if (shopTab === "ships") {
    SHIPS.forEach(function (ship) {
      var owned = save.ownedShips.indexOf(ship.id) !== -1;
      var selected = save.selectedShip === ship.id;
      var card = document.createElement("div");
      card.className = "shop-card" + (owned ? " owned" : "") + (selected ? " selected" : "");
      var mc = document.createElement("canvas");
      var wpn = ship.weapon ? ship.weapon.toUpperCase() : "PULSE";
      var statsText = "Spd " + ship.speed + " · Dmg +" + ship.dmgBonus + (ship.multiBonus ? " · +" + ship.multiBonus + " shot" : "") + " · " + wpn;
      card.innerHTML =
        '<div class="name">' + ship.name + '</div>' +
        '<div class="stats">' + statsText + '</div>';
      card.prepend(mc);
      var btn = document.createElement("button");
      if (!owned) {
        btn.className = "buy-btn";
        btn.textContent = "🪙 " + ship.cost;
        btn.disabled = save.coins < ship.cost;
        btn.addEventListener("click", function () {
          if (save.coins >= ship.cost) {
            save.coins -= ship.cost;
            save.ownedShips.push(ship.id);
            save.selectedShip = ship.id;
            persistSave();
            renderShop();
            syncHud();
          }
        });
      } else if (!selected) {
        btn.className = "select-btn";
        btn.textContent = "Select";
        btn.addEventListener("click", function () {
          save.selectedShip = ship.id;
          persistSave();
          renderShop();
        });
      } else {
        btn.className = "select-btn active-sel";
        btn.textContent = "Equipped";
        btn.disabled = true;
      }
      card.appendChild(btn);
      el.shopGrid.appendChild(card);
      drawMiniShip(mc, ship);
    });
  } else {
    Object.keys(UPGRADE_DEFS).forEach(function (key) {
      var d = UPGRADE_DEFS[key];
      var level = save.upgrades[key] || 0;
      var maxed = level >= d.max;
      var cost = maxed ? 0 : upgradeCost(key, level);
      var card = document.createElement("div");
      card.className = "shop-card";
      var icon = key === "fireRate" ? "⚡" : key === "damage" ? "💥" : "🔱";
      card.innerHTML =
        '<div style="font-size:30px;">' + icon + '</div>' +
        '<div class="name">' + d.label + '</div>' +
        '<div class="stats">' + d.desc + '<br>Level ' + level + '/' + d.max + '</div>';
      var btn = document.createElement("button");
      if (maxed) {
        btn.className = "select-btn active-sel";
        btn.textContent = "MAXED";
        btn.disabled = true;
      } else {
        btn.className = "buy-btn";
        btn.textContent = "🪙 " + cost;
        btn.disabled = save.coins < cost;
        btn.addEventListener("click", function () {
          if (save.coins >= cost && (save.upgrades[key] || 0) < d.max) {
            save.coins -= cost;
            save.upgrades[key] = (save.upgrades[key] || 0) + 1;
            persistSave();
            renderShop();
            syncHud();
          }
        });
      }
      card.appendChild(btn);
      el.shopGrid.appendChild(card);
    });
  }
}

el.tabShips.addEventListener("click", function () { shopTab = "ships"; renderShop(); });
el.tabUpgrades.addEventListener("click", function () { shopTab = "upgrades"; renderShop(); });

var shopReturnPhase = "start";
function openShop(fromPhase) {
  shopReturnPhase = fromPhase;
  cancelAnimationFrame(rafId);
  setPhase("shop");
  renderShop();
}
function closeShop() {
  setPhase(shopReturnPhase);
  if (shopReturnPhase === "playing" || shopReturnPhase === "boss" || shopReturnPhase === "bosswarning") {
    rafId = requestAnimationFrame(loop);
  }
}
el.btnShop.addEventListener("click", function () { openShop("start"); });
el.btnShopPause.addEventListener("click", function () { openShop("paused"); });
el.btnShopOver.addEventListener("click", function () { openShop("gameover"); });
el.btnCloseShop.addEventListener("click", closeShop);

// ============================================================
// CORE GAME FLOW
// ============================================================
function startBossWarning() {
  state.phase = "bosswarning";
  state.enemies = [];
  state.enemyBullets = [];
  showBanner(t("warning"), 2000, true);
  snd.bossAlarm();
  setTimeout(function () {
    startBoss();
  }, 2000);
}

function startBoss() {
  var lvl = state.level;
  var def = BOSS_DEFS[lvl - 1] || BOSS_DEFS[BOSS_DEFS.length - 1];
  state.bossEntering = true;
  state.boss = {
    def: def, shape: def.shape, c1: def.c1, c2: def.c2, accent: def.accent,
    x: W / 2 - 70, y: -140, targetY: 60, w: 140, h: 90,
    hp: 45 + lvl * 22, maxHp: 45 + lvl * 22,
    dir: 1, speed: Math.min(5.0, 1.7 + lvl * 0.13), timer: 0,
    moveType: def.move, attackType: def.attack,
    homeX: W / 2 - 70, homeY: 60, angle: Math.random() * Math.PI * 2,
    phaseVisible: true, teleportAt: 0, chargeVx: 0,
  };
  setPhase("boss");
  showBanner("☠ " + def.name + " " + t("bossArrived"), 2400);
  snd.bossRoar();
  syncHud();
}

function nextLevel() {
  if (state.level >= TOTAL_LEVELS) {
    finishRun(true);
    return;
  }
  state.level++;
  state.killsThisLevel = 0;
  state.killsNeeded = 8 + state.level * 2;
  state.boss = null;
  state.bossEntering = false;
  state.enemies = [];
  state.enemyBullets = [];
  state.player.shield = state.player.maxShield;
  setPhase("playing");
  showBanner(t("sector") + " " + state.level + ": " + STAGE_NAMES[state.level - 1], 2200);
  snd.setLevel(state.level);
  snd.levelUp();
  syncHud();
}

function finishRun(won) {
  state.running = false;
  save.coins += state.runCoins;
  var isNewHigh = state.score > save.highScore;
  if (isNewHigh) save.highScore = state.score;
  persistSave();
  if (won) {
    setPhase("win");
    el.winScore.textContent = state.score;
    el.winCoins.textContent = state.runCoins;
    el.winNewHigh.style.display = isNewHigh ? "block" : "none";
    snd.win();
  } else {
    setPhase("gameover");
    el.goScore.textContent = state.score;
    el.goCoins.textContent = state.runCoins;
    el.goLevel.textContent = state.level;
    el.goNewHigh.style.display = isNewHigh ? "block" : "none";
    snd.gameOver();
  }
  syncHud();
}

// Quit mid-run from the pause menu: banks whatever coins were collected so
// far (same as a normal run end), then returns all the way to the main menu.
function quitToMenu() {
  if (!confirm("Quit to the main menu? Your coins from this run will be saved.")) return;
  state.running = false;
  cancelAnimationFrame(rafId);
  save.coins += state.runCoins;
  state.runCoins = 0;
  persistSave();
  setPhase("start");
  syncHud();
}

function startGame() {
  snd.ensure();
  snd.startAmbient();
  var ship = currentShip();
  state.player = { x: W / 2 - 20, y: H - 70, w: 40, h: 40, speed: ship.speed, invuln: 0, shield: 3, maxShield: 3, vx: 0, vy: 0, tilt: 0 };
  state.bullets = [];
  state.enemies = [];
  state.enemyBullets = [];
  state.particles = [];
  state.pickups = [];
  state.wingman = null;
  state.boss = null;
  state.bossEntering = false;
  state.score = 0;
  state.runCoins = 0;
  state.health = MAX_HEALTH;
  state.level = 1;
  state.killsThisLevel = 0;
  state.killsNeeded = 10;
  state.lastShot = 0;
  state.lastEnemySpawn = 0;
  state.lastEnemyShot = 0;
  state.lastBossShot = 0;
  state.running = true;
  state.effects = { rapidUntil: 0, wingmanUntil: 0, damageUntil: 0, tripleUntil: 0, missileUntil: 0, dualLaserUntil: 0, deathBeamUntil: 0, frostUntil: 0, novaUntil: 0, powerShield: 0 };
  snd.setLevel(1);
  initStars();
  setPhase("playing");
  showBanner(t("sector") + " 1: " + STAGE_NAMES[0], 2000);

  save.playCount = (save.playCount || 0) + 1;
  persistSave();
  bumpGlobalPlayCount();

  syncHud();
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}

function loseLife() {
  if (state.player.invuln > 0) return;
  if (state.effects.powerShield > 0) {
    state.effects.powerShield--;
    state.player.invuln = 26;
    snd.shieldBlock();
    explode(state.player.x + state.player.w / 2, state.player.y + state.player.h / 2, "#3fd0ff");
    syncHud();
    return;
  }
  if (state.player.shield > 0) {
    state.player.shield--;
    state.player.invuln = 40;
    snd.shieldBlock();
    explode(state.player.x + state.player.w / 2, state.player.y + state.player.h / 2, "#00f0ff");
    syncHud();
    return;
  }
  state.health = Math.max(0, state.health - HIT_DAMAGE);
  state.player.invuln = 75;
  snd.hit();
  syncHud();
  if (state.health <= 0) {
    finishRun(false);
  }
}

function computeFireInterval() {
  var ship = currentShip();
  var base = 200 * ship.fireRateMul;
  base -= (save.upgrades.fireRate || 0) * 16;
  if (Date.now() < state.effects.rapidUntil) base *= 0.5;
  if (Date.now() < (state.effects.dualLaserUntil || 0)) base *= 0.55;
  return Math.max(55, base);
}
function computeMultishotExtra() {
  var extra = currentShip().multiBonus + (save.upgrades.multishot || 0);
  if (Date.now() < state.effects.tripleUntil) extra = Math.max(extra, 2);
  return Math.min(6, extra);
}
function computeDamage() {
  var dmg = 1 + currentShip().dmgBonus + (save.upgrades.damage || 0);
  if (Date.now() < state.effects.damageUntil) dmg += 2;
  return dmg;
}

function spawnPlayerBullets(fromX, fromY) {
  var extra = computeMultishotExtra();
  var dmg = computeDamage();
  var total = extra + 1;
  var ship = currentShip();
  var weapon = ship.weapon || "pulse";
  var now = Date.now();

  // Active weapon-mode power-up fully replaces base weapon (no mixing)
  if (now < (state.effects.deathBeamUntil || 0)) {
    // Death beam is continuous — no discrete bullets while it is active
    return;
  }
  if (now < (state.effects.dualLaserUntil || 0)) {
    state.bullets.push({
      x: fromX - 10, y: fromY - 10, w: 3, h: 26, speed: 18,
      vx: 0, dmg: dmg + 2, type: "laser", color: "#ffd23f", pierce: true
    });
    state.bullets.push({
      x: fromX + 7, y: fromY - 10, w: 3, h: 26, speed: 18,
      vx: 0, dmg: dmg + 2, type: "laser", color: "#ffd23f", pierce: true
    });
    return;
  }
  if (now < (state.effects.frostUntil || 0)) {
    state.bullets.push({
      x: fromX - 3, y: fromY, w: 6, h: 14, speed: 7,
      vx: 0, dmg: dmg + 1, type: "frost", color: "#7de8ff", pierce: true
    });
    return;
  }
  if (now < (state.effects.novaUntil || 0)) {
    state.bullets.push({
      x: fromX - 4, y: fromY, w: 8, h: 12, speed: 9,
      vx: 0, dmg: dmg + 1, type: "nova", color: "#4ade80", explosive: true, blastR: 42
    });
    return;
  }
  if (now < (state.effects.missileUntil || 0)) {
    // Rocket barrage mode only — no base weapon mixed in
    for (var mi = 0; mi < Math.min(3, total); mi++) {
      var moff = (mi - (Math.min(3, total) - 1) / 2) * 16;
      state.bullets.push({
        x: fromX - 4 + moff, y: fromY, w: 8, h: 16, speed: 7,
        vx: 0, dmg: dmg + 2, type: "missile", color: "#ff6b35", explosive: true
      });
    }
    return;
  }

  // Base ship weapon (returns automatically when any weapon-mode power-up ends)
  var rocketChance = (save.upgrades.rockets || 0) * 0.12;
  if (weapon === "laser") {
    // Long thin laser beams
    for (var i = 0; i < total; i++) {
      var offset = (i - (total - 1) / 2) * 12;
      state.bullets.push({
        x: fromX - 2 + offset, y: fromY - 8, w: 3, h: 22, speed: 14,
        vx: 0, dmg: dmg + 1, type: "laser", color: ship.accent || "#aef1ff"
      });
    }
  } else if (weapon === "spread") {
    // Wide fan of shots
    for (var i = 0; i < total + 1; i++) {
      var t = total + 1;
      var offset = (i - (t - 1) / 2) * 8;
      var angle = (i - (t - 1) / 2) * 0.12;
      state.bullets.push({
        x: fromX - 2 + offset, y: fromY, w: 4, h: 12, speed: 11,
        vx: Math.sin(angle) * 4.5, dmg: dmg, type: "pulse", color: ship.hull
      });
    }
  } else if (weapon === "plasma") {
    // Fat glowing plasma orbs
    for (var i = 0; i < total; i++) {
      var offset = (i - (total - 1) / 2) * 14;
      state.bullets.push({
        x: fromX - 5 + offset, y: fromY - 4, w: 10, h: 10, speed: 9,
        vx: total > 1 ? (i - (total - 1) / 2) * 1.5 : 0, dmg: dmg + 1, type: "plasma", color: ship.accent || "#c084fc"
      });
    }
  } else if (weapon === "homing") {
    // Slightly slower seeking shots
    for (var i = 0; i < total; i++) {
      var offset = (i - (total - 1) / 2) * 11;
      state.bullets.push({
        x: fromX - 3 + offset, y: fromY, w: 6, h: 12, speed: 8,
        vx: 0, dmg: dmg, type: "homing", color: ship.hull || "#f97316", seek: 0.35
      });
    }
  } else if (weapon === "missile") {
    // Default to missiles for missile ships
    for (var i = 0; i < Math.max(1, Math.min(3, total)); i++) {
      var offset = (i - (Math.min(3, total) - 1) / 2) * 16;
      state.bullets.push({
        x: fromX - 4 + offset, y: fromY, w: 8, h: 16, speed: 7,
        vx: 0, dmg: dmg + 2, type: "missile", color: "#ff6b35", explosive: true
      });
    }
  } else {
    // Classic pulse
    for (var i = 0; i < total; i++) {
      var offset = (i - (total - 1) / 2) * 10;
      var angle = (i - (total - 1) / 2) * 0.06;
      state.bullets.push({
        x: fromX - 2 + offset, y: fromY, w: 4, h: 14, speed: 10,
        vx: total > 1 ? Math.sin(angle) * 3 : 0, dmg: dmg, type: "pulse", color: ship.hull || "#00f0ff"
      });
    }
  }

  // Extra rocket pods from upgrade / power-up
  if (Math.random() < rocketChance) {
    state.bullets.push({
      x: fromX - 5, y: fromY + 4, w: 9, h: 18, speed: 6.5,
      vx: (Math.random() - 0.5) * 2, dmg: dmg + 3, type: "missile", color: "#ff3d00", explosive: true
    });
  }
}

function activeWeaponSoundKind() {
  var now = Date.now();
  if (now < (state.effects.deathBeamUntil || 0)) return "deathBeam";
  if (now < (state.effects.dualLaserUntil || 0)) return "dualLaser";
  if (now < (state.effects.frostUntil || 0)) return "frost";
  if (now < (state.effects.novaUntil || 0)) return "nova";
  if (now < (state.effects.missileUntil || 0)) return "missile";
  var ship = currentShip();
  return (ship && ship.weapon) || "pulse";
}

function shoot() {
  var now = Date.now();
  // Death beam is continuous — play a soft hum while held, no discrete shots
  if (now < (state.effects.deathBeamUntil || 0)) {
    if (state.keys[" "] || state.touch.fire) snd.beamHum();
    return;
  }
  if (now - state.lastShot > computeFireInterval()) {
    spawnPlayerBullets(state.player.x + state.player.w / 2, state.player.y);
    state.lastShot = now;
    snd.shoot(activeWeaponSoundKind());
  }
  if (state.wingman && now - (state.wingman.lastShot || 0) > 260) {
    state.bullets.push({ x: state.wingman.x + state.wingman.w / 2 - 2, y: state.wingman.y, w: 4, h: 12, speed: 10, dmg: computeDamage(), vx: 0 });
    state.wingman.lastShot = now;
    snd.shoot("pulse");
  }
}

// ============================================================
// PICKUPS — coins & power-ups
// ============================================================
// Small enemy variants — each has unique shape, colors, bullet color, move & attack
var ENEMY_TYPES = [
  { id: "scout",   shape: "wedge",   col: "#ff5555", col2: "#aa2222", accent: "#ff8888", bullet: "#ff6666", move: "patrol", attack: "single",  hpMul: 1 },
  { id: "gunner",  shape: "diamond", col: "#ff00e0", col2: "#7a00aa", accent: "#ff66ee", bullet: "#ff66ee", move: "patrol", attack: "single",  hpMul: 1 },
  { id: "raider",  shape: "arrow",   col: "#ffaa00", col2: "#aa6600", accent: "#ffcc44", bullet: "#ffcc44", move: "zigzag", attack: "burst",   hpMul: 1 },
  { id: "drone",   shape: "hex",     col: "#3fd0ff", col2: "#0a5a7a", accent: "#7de8ff", bullet: "#7de8ff", move: "sine",   attack: "aimed",   hpMul: 1 },
  { id: "bomber",  shape: "saucer",  col: "#4ade80", col2: "#1a5a30", accent: "#86efac", bullet: "#86efac", move: "slow",   attack: "spread",  hpMul: 1.5 },
  { id: "striker", shape: "blade",   col: "#a855f7", col2: "#4c1d95", accent: "#d8b4fe", bullet: "#d8b4fe", move: "dash",   attack: "rapid",   hpMul: 1 },
];

// Power-up drop types (each has a distinct icon & effect):
var POWERUP_TYPES = [
  { key: "rapid", icon: "⚡", color: "#ffd23f", label: "RAPID FIRE" },
  { key: "shield", icon: "💧", color: "#3fd0ff", label: "BARRIER +5" },
  { key: "damage", icon: "🌀", color: "#ff00e0", label: "DAMAGE UP" },
  { key: "triple", icon: "❄", color: "#aef1ff", label: "TRIPLE SHOT" },
  { key: "wingman", icon: "🛸", color: "#4ade80", label: "WINGMAN" },
  { key: "missile", icon: "🚀", color: "#ff6b35", label: "ROCKET BARRAGE" },
  { key: "dualLaser", icon: "🟡", color: "#ffd23f", label: "DUAL LASER" },
  { key: "deathBeam", icon: "🔴", color: "#ff2d55", label: "DEATH BEAM" },
  { key: "frost", icon: "🔵", color: "#7de8ff", label: "FROST SHOT" },
  { key: "nova", icon: "🟢", color: "#4ade80", label: "NOVA BURST" },
];

// Drop rates: coins stay modest, power-ups bumped up so upgrades show up much more often.
function maybeDropPickup(x, y) {
  var r = Math.random();
  if (r < 0.12) {
    state.pickups.push({ type: "coin", x: x, y: y, w: 14, h: 14, vy: 1.6, bob: Math.random() * Math.PI * 2 });
  } else if (r < 0.32) {
    var pt = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    state.pickups.push({ type: "power", key: pt.key, icon: pt.icon, color: pt.color, label: pt.label, x: x, y: y, w: 20, h: 20, vy: 1.3, bob: Math.random() * Math.PI * 2 });
  }
}

// Weapon-mode power-ups replace each other (and the base weapon) until they expire
function clearWeaponModes() {
  state.effects.missileUntil = 0;
  state.effects.dualLaserUntil = 0;
  state.effects.deathBeamUntil = 0;
  state.effects.frostUntil = 0;
  state.effects.novaUntil = 0;
}

function applyPowerup(key) {
  var now = Date.now();
  if (key === "rapid") {
    state.effects.rapidUntil = now + 12000;
    floatText(state.player.x, state.player.y - 10, "RAPID FIRE!", "#ffd23f");
  } else if (key === "shield") {
    state.effects.powerShield = Math.min(9, state.effects.powerShield + 5);
    floatText(state.player.x, state.player.y - 10, "BARRIER +5!", "#3fd0ff");
  } else if (key === "damage") {
    state.effects.damageUntil = now + 13000;
    floatText(state.player.x, state.player.y - 10, "DAMAGE UP!", "#ff00e0");
  } else if (key === "triple") {
    state.effects.tripleUntil = now + 13000;
    floatText(state.player.x, state.player.y - 10, "TRIPLE SHOT!", "#aef1ff");
  } else if (key === "wingman") {
    state.effects.wingmanUntil = now + 16000;
    state.wingman = { x: state.player.x - 46, y: state.player.y + 6, w: 26, h: 26, lastShot: 0 };
    floatText(state.player.x, state.player.y - 10, "WINGMAN ONLINE!", "#4ade80");
  } else if (key === "missile") {
    clearWeaponModes();
    state.effects.missileUntil = now + 14000;
    floatText(state.player.x, state.player.y - 10, "ROCKET BARRAGE!", "#ff6b35");
  } else if (key === "dualLaser") {
    clearWeaponModes();
    state.effects.dualLaserUntil = now + 14000;
    floatText(state.player.x, state.player.y - 10, "DUAL LASER!", "#ffd23f");
  } else if (key === "deathBeam") {
    clearWeaponModes();
    state.effects.deathBeamUntil = now + 11000;
    floatText(state.player.x, state.player.y - 10, "DEATH BEAM!", "#ff2d55");
  } else if (key === "frost") {
    clearWeaponModes();
    state.effects.frostUntil = now + 14000;
    floatText(state.player.x, state.player.y - 10, "FROST SHOT!", "#7de8ff");
  } else if (key === "nova") {
    clearWeaponModes();
    state.effects.novaUntil = now + 13000;
    floatText(state.player.x, state.player.y - 10, "NOVA BURST!", "#4ade80");
  }
  snd.powerup();
  syncHud();
}

// ============================================================
// BOSS MOVEMENT PATTERNS — every boss shape moves differently
// ============================================================
function updateBossMovement(boss, s, now) {
  var t = boss.timer;
  var px = s.player.x + s.player.w / 2;
  var bx = boss.x + boss.w / 2;
  // stronger player tracking — bosses feel smarter & more aggressive
  var track = (px - bx) * 0.032;
  var lvlBoost = 1 + s.level * 0.035;
  switch (boss.moveType) {
    case "swoop": // Blue Dragon — aggressive hunt + deeper dips
      boss.x += boss.dir * boss.speed * 1.15 * lvlBoost + track * 0.55;
      if (boss.x <= 0 || boss.x + boss.w >= W) boss.dir *= -1;
      // occasionally dive toward player Y
      var dive = (t % 100 < 35) ? Math.min(55, (s.player.y - boss.y) * 0.04) : 0;
      boss.y = boss.homeY + Math.sin(t * 0.045) * 42 + Math.max(0, Math.sin(t * 0.022)) * 22 + dive;
      break;
    case "float": // Eye / Judge — snaps harder & more often toward player
      if (t % 70 < 28) {
        boss.x += Math.sign(px - bx) * boss.speed * 2.1 * lvlBoost;
      } else {
        boss.x += boss.dir * boss.speed * 0.55 + track * 0.25;
        if (boss.x <= 0 || boss.x + boss.w >= W) boss.dir *= -1;
      }
      boss.y = boss.homeY + Math.sin(t * 0.03) * 18;
      break;
    case "sway": // Serpent / Leviathan — tracks player center while swaying
      var swayAmp = (W / 2 - boss.w / 2 - 10);
      var targetX = W / 2 - boss.w / 2 + Math.sin(t * 0.026) * swayAmp * 0.85 + track * 8;
      boss.x += (targetX - boss.x) * 0.12;
      boss.x = Math.max(0, Math.min(W - boss.w, boss.x));
      boss.y = boss.homeY + Math.cos(t * 0.04) * 20 + Math.sin(t * 0.08) * 8;
      break;
    case "teleport": // Reaper / Assassin — smarter blinks closer to player, more frequent
      if (t > (boss.teleportAt || 0)) {
        var prefer = Math.random() < 0.8
          ? Math.max(15, Math.min(W - boss.w - 15, px - boss.w / 2 + (Math.random() - 0.5) * 70))
          : 20 + Math.random() * (W - boss.w - 40);
        explode(boss.x + boss.w / 2, boss.y + boss.h / 2, boss.accent, false);
        boss.x = prefer;
        explode(boss.x + boss.w / 2, boss.y + boss.h / 2, boss.c1, false);
        boss.teleportAt = t + Math.max(28, 58 - s.level * 1.2);
      }
      // slight drift toward player between teleports
      boss.x += track * 0.4;
      boss.x = Math.max(0, Math.min(W - boss.w, boss.x));
      boss.y = boss.homeY + Math.sin(t * 0.055) * 10;
      break;
    case "phase": // Phantom / Wraith — faster strafe + stronger tracking while visible
      boss.x += boss.dir * boss.speed * 1.05 * lvlBoost + track * 0.45;
      if (boss.x <= 0 || boss.x + boss.w >= W) boss.dir *= -1;
      boss.phaseVisible = Math.floor(t / 28) % 3 !== 0;
      boss.y = boss.homeY + Math.sin(t * 0.035) * 14;
      break;
    case "orbit": // Empress / Sovereign / Cosmos — faster orbit + slight player bias
      boss.angle += 0.032 + s.level * 0.0012;
      var rad = (W / 2 - boss.w / 2 - 20) * (0.8 + 0.2 * Math.sin(t * 0.025));
      var ox = W / 2 - boss.w / 2 + Math.cos(boss.angle) * rad;
      boss.x = ox + track * 4;
      boss.y = boss.homeY + Math.sin(boss.angle) * 30;
      break;
    case "pulseForward": // Devourer / Titan — stronger advance + better X tracking
      boss.x += boss.dir * boss.speed * 1.1 + track * 0.65;
      if (boss.x <= 0 || boss.x + boss.w >= W) boss.dir *= -1;
      var pulse = Math.sin(t * 0.035);
      boss.y = boss.homeY + Math.max(0, pulse) * (58 + s.level * 1.4);
      break;
    case "charge": // Behemoth — locks on faster, longer & deeper dive
      if (t % 100 < 22) {
        boss.x += (px - boss.w / 2 - boss.x) * 0.18;
        boss.y = boss.homeY + 4;
        boss.charging = true;
      } else if (t % 100 < 52) {
        boss.charging = true;
        boss.y = boss.homeY + (t % 100 - 22) * (5.0 + s.level * 0.1);
      } else {
        boss.charging = false;
        boss.y += (boss.homeY - boss.y) * 0.12;
        boss.x += boss.dir * boss.speed + track * 0.3;
        if (boss.x <= 0 || boss.x + boss.w >= W) boss.dir *= -1;
      }
      break;
    case "erratic": // Curse / Plague / Chaos — more lunges + smarter direction changes
      if (t % 28 === 0) boss.dir = (px > bx) ? 1 : -1;
      if (t % 70 < 22) {
        boss.x += Math.sign(px - bx) * boss.speed * 2.6 * lvlBoost;
      } else {
        boss.x += boss.dir * boss.speed * 1.5 + track * 0.2;
      }
      boss.x = Math.max(0, Math.min(W - boss.w, boss.x));
      boss.y = boss.homeY + Math.sin(t * 0.055) * 28;
      break;
    case "sideToSide":
    default: // Guardian / Colossus / King / Emperor — stronger tracking + occasional surge
      var surge = (t % 110 < 25) ? 1.55 : 1;
      boss.x += boss.dir * boss.speed * surge * lvlBoost + track * 0.75;
      if (boss.x <= 4) { boss.x = 4; boss.dir = 1; }
      if (boss.x + boss.w >= W - 4) { boss.x = W - boss.w - 4; boss.dir = -1; }
      boss.y = boss.homeY + Math.sin(t * 0.025) * 10;
      break;
  }
  // motion trail aura for bosses
  if (t % 3 === 0) {
    s.particles.push({
      type: "trail",
      x: boss.x + boss.w / 2 + (Math.random() - 0.5) * boss.w * 0.5,
      y: boss.y + boss.h * 0.6 + Math.random() * 10,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 0.6 + Math.random() * 1.2,
      life: 14, maxLife: 14,
      color: boss.c1 || "#ff00e0",
      r: 3 + Math.random() * 3
    });
  }
}

// ============================================================
// BOSS ATTACK PATTERNS — every boss has its own bullet pattern
// ============================================================
function fireBossAttack(boss, s) {
  var cx = boss.x + boss.w / 2;
  var cy = boss.y + boss.h;
  var lvl = s.level;
  var spd = 3.3 + lvl * 0.12;
  var bc = boss.c1 || "#ff3366"; // each boss fires bolts in its own signature color
  switch (boss.attackType) {
    case "spreadShot": {
      var n = 3 + Math.min(6, Math.floor(lvl / 3));
      var bias = Math.max(-1.2, Math.min(1.2, (s.player.x + s.player.w / 2 - cx) / 90));
      for (var i = 0; i < n; i++) {
        var dx = (i - (n - 1) / 2) * 1.2 + bias;
        s.enemyBullets.push({ x: cx - 3, y: cy, w: 6, h: 12, speed: spd, dx: dx, color: bc });
      }
      snd.enemyShoot();
      break;
    }
    case "waveShot": {
      for (var w = 0; w < 5; w++) {
        s.enemyBullets.push({ x: cx - 3, y: cy, w: 6, h: 10, speed: spd * 0.9, dx: Math.sin(w * 0.9) * 2.2, wavePhase: w * 0.9, waveAmp: 1.8, color: bc });
      }
      snd.enemyShoot();
      break;
    }
    case "laserSweep": {
      var aim = Math.max(-2.8, Math.min(2.8, (s.player.x + s.player.w / 2 - cx) / 55));
      for (var l = 0; l < 4; l++) {
        s.enemyBullets.push({ x: cx - 12 + l * 8, y: cy, w: 7, h: 24, speed: spd * 1.25, dx: aim + (l - 1.5) * 0.35, color: bc });
      }
      snd.enemyShoot();
      break;
    }
    case "homing": {
      // predict where the player will be
      var px = s.player.x + s.player.w / 2 + (s.player.vx || 0) * 18;
      var lead = Math.max(-3.2, Math.min(3.2, (px - cx) / 48));
      s.enemyBullets.push({ x: cx - 4, y: cy, w: 8, h: 14, speed: spd * 1.05, dx: lead, color: bc, seekPlayer: true });
      s.enemyBullets.push({ x: cx - 10, y: cy - 6, w: 7, h: 12, speed: spd * 0.9, dx: lead * 0.7 - 0.5, color: bc, seekPlayer: true });
      s.enemyBullets.push({ x: cx + 2, y: cy - 6, w: 7, h: 12, speed: spd * 0.9, dx: lead * 0.7 + 0.5, color: bc, seekPlayer: true });
      snd.enemyShoot();
      break;
    }
    case "spiral": {
      var count = 6;
      for (var sp = 0; sp < count; sp++) {
        var ang = (boss.timer * 0.12) + (sp / count) * Math.PI * 2;
        s.enemyBullets.push({ x: cx - 3, y: cy, w: 6, h: 6, speed: spd * 0.8, dx: Math.cos(ang) * 2.4, roundShot: true, color: bc });
      }
      snd.enemyShoot();
      break;
    }
    case "burstRapid": {
      var side = Math.random() < 0.5 ? -1 : 1;
      s.enemyBullets.push({ x: cx - 3 + side * 22, y: cy, w: 6, h: 12, speed: spd * 1.2, dx: side * 0.6, color: bc });
      s.enemyBullets.push({ x: cx - 3 - side * 22, y: cy, w: 6, h: 12, speed: spd * 1.2, dx: -side * 0.6, color: bc });
      snd.enemyShoot();
      break;
    }
    case "swarmShot": {
      for (var sw = 0; sw < 4; sw++) {
        var sx = boss.x + (sw + 0.5) * (boss.w / 4);
        s.enemyBullets.push({ x: sx - 3, y: cy, w: 6, h: 8, speed: spd + Math.random() * 1.2, dx: (Math.random() - 0.5) * 2, color: bc });
      }
      snd.enemyShoot();
      break;
    }
    case "allPattern": {
      // Final boss cycles through every pattern for maximum variety.
      var cycle = Math.floor(boss.timer / 90) % 4;
      var patterns = ["spreadShot", "waveShot", "spiral", "homing"];
      var pat = patterns[cycle];
      var save2 = boss.attackType;
      boss.attackType = pat;
      fireBossAttack(boss, s);
      boss.attackType = save2;
      return;
    }
  }
}

// ============================================================
// UPDATE
// ============================================================
function update() {
  var s = state;
  var now = Date.now();

  s.stars.forEach(function (st) {
    st.y += st.s;
    if (st.y > H) { st.y = 0; st.x = Math.random() * W; }
  });

  if (s.phase === "playing" || s.phase === "boss") {
    // Analog stick (joystick) has priority; keyboard still works for desktop
    var sx = s.touch.stickX || 0;
    var sy = s.touch.stickY || 0;
    var vx = 0, vy = 0;
    if (sx !== 0 || sy !== 0) {
      vx = sx * s.player.speed;
      vy = sy * s.player.speed;
    } else {
      var left = s.keys["arrowleft"] || s.keys["a"];
      var right = s.keys["arrowright"] || s.keys["d"];
      var up = s.keys["arrowup"] || s.keys["w"];
      var down = s.keys["arrowdown"] || s.keys["s"];
      if (left) vx -= s.player.speed;
      if (right) vx += s.player.speed;
      if (up) vy -= s.player.speed;
      if (down) vy += s.player.speed;
      // normalize diagonal keyboard so speed matches stick
      if (vx && vy) { vx *= 0.7071; vy *= 0.7071; }
    }
    s.player.x += vx;
    s.player.y += vy;
    s.player.vx = vx;
    s.player.vy = vy;
    // smooth visual tilt toward movement direction
    var targetTilt = Math.max(-0.35, Math.min(0.35, vx * 0.045));
    s.player.tilt = (s.player.tilt || 0) * 0.78 + targetTilt * 0.22;

    s.player.x = Math.max(0, Math.min(W - s.player.w, s.player.x));
    s.player.y = Math.max(H * 0.28, Math.min(H - s.player.h - 8, s.player.y));

    // Motion / engine trail particles while moving
    var speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > 0.4) {
      var cx = s.player.x + s.player.w / 2;
      var cy = s.player.y + s.player.h / 2;
      var shipCol = (currentShip() && currentShip().hull) || "#00f0ff";
      // engine exhaust behind the ship
      s.particles.push({
        type: "trail", x: cx + (Math.random() - 0.5) * 8, y: cy + s.player.h * 0.35,
        vx: -vx * 0.25 + (Math.random() - 0.5) * 0.6,
        vy: -vy * 0.25 + 1.2 + Math.random() * 0.8,
        life: 12 + Math.random() * 8, maxLife: 18,
        color: shipCol, r: 2.5 + Math.random() * 2.5
      });
      if (speed > 3 && Math.random() < 0.45) {
        s.particles.push({
          type: "spark", x: cx, y: cy + s.player.h * 0.4,
          vx: -vx * 0.4 + (Math.random() - 0.5) * 2,
          vy: -vy * 0.3 + Math.random() * 1.5,
          life: 8, maxLife: 8, color: "#ffea00", r: 1.5 + Math.random()
        });
      }
    }

    if (s.keys[" "] || s.touch.fire) shoot();
    if (s.player.invuln > 0) s.player.invuln--;

    if (s.wingman) {
      if (now > s.effects.wingmanUntil) {
        s.wingman = null;
      } else {
        s.wingman.x = s.player.x - 46;
        s.wingman.y = s.player.y + 6;
      }
    }
  }

  s.bullets.forEach(function (b) {
    if (b.type === "homing" && b.seek) {
      // simple seek toward nearest enemy or boss
      var tx = null, ty = null, best = 1e9;
      s.enemies.forEach(function (e) {
        var dx = (e.x + e.w / 2) - (b.x + b.w / 2);
        var dy = (e.y + e.h / 2) - (b.y + b.h / 2);
        var d = dx * dx + dy * dy;
        if (d < best) { best = d; tx = e.x + e.w / 2; ty = e.y + e.h / 2; }
      });
      if (s.boss && !s.bossEntering) {
        var dx = (s.boss.x + s.boss.w / 2) - (b.x + b.w / 2);
        var dy = (s.boss.y + s.boss.h / 2) - (b.y + b.h / 2);
        var d = dx * dx + dy * dy;
        if (d < best) { best = d; tx = s.boss.x + s.boss.w / 2; ty = s.boss.y + s.boss.h / 2; }
      }
      if (tx !== null) {
        var adx = tx - (b.x + b.w / 2);
        var ady = ty - (b.y + b.h / 2);
        var len = Math.sqrt(adx * adx + ady * ady) || 1;
        b.vx = (b.vx || 0) * 0.85 + (adx / len) * b.speed * b.seek;
        b.vy = (b.vy || -b.speed) * 0.85 + (ady / len) * b.speed * b.seek;
      }
    }
    if (b.vy !== undefined) {
      b.y += b.vy;
      b.x += (b.vx || 0);
    } else {
      b.y -= b.speed;
      if (b.vx) b.x += b.vx;
    }
  });
  s.bullets = s.bullets.filter(function (b) { return b.y + b.h > -30 && b.x > -40 && b.x < W + 40; });

  s.enemyBullets.forEach(function (b) {
    if (b.seekPlayer) {
      var tx = s.player.x + s.player.w / 2;
      var desired = Math.max(-2.8, Math.min(2.8, (tx - (b.x + b.w / 2)) * 0.04));
      b.dx = (b.dx || 0) * 0.9 + desired * 0.1;
    }
    if (b.waveAmp) {
      b.wavePhase = (b.wavePhase || 0) + 0.12;
      b.x += Math.sin(b.wavePhase) * b.waveAmp;
    }
    b.y += b.speed;
    if (b.dx) b.x += b.dx;
  });
  s.enemyBullets = s.enemyBullets.filter(function (b) { return b.y < H && b.x > -20 && b.x < W + 20; });

  // pickups falling
  s.pickups.forEach(function (p) { p.y += p.vy; p.bob += 0.15; });
  s.pickups = s.pickups.filter(function (p) {
    if (p.y > H + 20) return false;
    var px = s.player.x, py = s.player.y, pw = s.player.w, ph = s.player.h;
    if (p.x < px + pw + 10 && p.x + p.w > px - 10 && p.y < py + ph + 10 && p.y + p.h > py - 10) {
      if (p.type === "coin") {
        s.runCoins += 5;
        floatText(p.x, p.y, "+5", "#ffd23f");
        snd.coin();
      } else {
        applyPowerup(p.key);
      }
      return false;
    }
    return true;
  });

  if (s.phase === "boss" && s.boss) {
    var boss = s.boss;
    if (s.bossEntering) {
      boss.y += (boss.targetY - boss.y) * 0.06;
      if (Math.abs(boss.y - boss.targetY) < 1.5) { boss.y = boss.targetY; s.bossEntering = false; }
    } else {
      boss.timer++;
      updateBossMovement(boss, s, now);

      var shootRate = Math.max(240, 880 - s.level * 30);
      if (now - s.lastBossShot > shootRate) {
        s.lastBossShot = now;
        fireBossAttack(boss, s);
      }

      s.bullets = s.bullets.filter(function (b) {
        if (!s.boss) return true;
        if (b.x < boss.x + boss.w && b.x + b.w > boss.x && b.y < boss.y + boss.h && b.y + b.h > boss.y) {
          boss.hp -= b.dmg || 1;
          var isMissile = b.explosive || b.type === "missile";
          explode(b.x, b.y, isMissile ? "#ff6b35" : "#ffea00", isMissile);
          syncHud();
          if (boss.hp <= 0) {
            explode(boss.x + boss.w / 2, boss.y + boss.h / 2, "#ff00e0", true);
            snd.explosion(true);
            s.score += 200;
            s.runCoins += 40;
            floatText(boss.x + boss.w / 2, boss.y + boss.h / 2, "+40 🪙", "#ffd23f");
            s.boss = null;
            showBanner(t("bossDestroyed"), 1400);
            setTimeout(nextLevel, 1400);
          }
          // pierce special weapons can pass through boss only if still alive
          if (b.pierce && s.boss) return true;
          return false;
        }
        return true;
      });

      // only collide with player while boss is still alive
      if (s.boss && !s.bossEntering && boss.y + boss.h > s.player.y && boss.x < s.player.x + s.player.w && boss.x + boss.w > s.player.x) {
        loseLife();
      }
    }
  } else if (s.phase === "playing") {
    var spawnRate = Math.max(380, 1250 - s.level * 44);
    var maxAlive = Math.min(20, 7 + Math.floor(s.level * 0.8));
    if (now - s.lastEnemySpawn > spawnRate && s.enemies.length < maxAlive) {
      var size = 34;
      var row = Math.floor(Math.random() * 3);
      // unlock more enemy types as levels progress
      var poolSize = Math.min(ENEMY_TYPES.length, 2 + Math.floor(s.level / 3));
      var et = ENEMY_TYPES[Math.floor(Math.random() * poolSize)];
      var baseHp = s.level >= 3 ? 2 : 1;
      var hp = Math.max(1, Math.round(baseHp * (et.hpMul || 1)));
      s.enemies.push({
        x: Math.random() * (W - size), y: TOP_BAND_MIN + row * ROW_GAP, w: size, h: size,
        speed: 0.8 + s.level * 0.09 + Math.random() * 0.6,
        dir: Math.random() < 0.5 ? 1 : -1,
        hp: hp, maxHp: hp,
        type: et.id,
        shape: et.shape,
        col: et.col, col2: et.col2, accent: et.accent, bulletColor: et.bullet,
        moveStyle: et.move, attackStyle: et.attack,
        nextShot: now + 600 + Math.random() * 900,
        anim: Math.random() * 100,
      });
      s.lastEnemySpawn = now;
    }
  }

  // Every enemy type shoots — slower cadence so fire is readable and fair
  if (s.phase === "playing") {
    var shotInterval = Math.max(700, 1600 - s.level * 40);
    s.enemies.forEach(function (e) {
      if (now < e.nextShot) return;
      var cx = e.x + e.w / 2;
      var cy = e.y + e.h;
      var spd = 3.2 + s.level * 0.12;
      var bc = e.bulletColor || "#ff6666";
      var atk = e.attackStyle || "single";
      if (atk === "burst") {
        for (var bi = -1; bi <= 1; bi++) {
          s.enemyBullets.push({ x: cx - 2 + bi * 6, y: cy, w: 4, h: 10, speed: spd, dx: bi * 0.6, color: bc });
        }
      } else if (atk === "spread") {
        for (var si = -1; si <= 1; si++) {
          s.enemyBullets.push({ x: cx - 2, y: cy, w: 5, h: 10, speed: spd * 0.9, dx: si * 1.4, color: bc, roundShot: true });
        }
      } else if (atk === "aimed") {
        var aimDx = (s.player.x + s.player.w / 2 - cx) / 80;
        s.enemyBullets.push({ x: cx - 3, y: cy, w: 5, h: 11, speed: spd * 1.1, dx: aimDx, color: bc });
      } else if (atk === "rapid") {
        s.enemyBullets.push({ x: cx - 2, y: cy, w: 3, h: 9, speed: spd * 1.2, dx: (Math.random() - 0.5) * 0.5, color: bc });
        e.nextShot = now + shotInterval * 0.55;
        snd.enemyShoot();
        return;
      } else {
        s.enemyBullets.push({ x: cx - 2, y: cy, w: 4, h: 10, speed: spd, color: bc });
      }
      snd.enemyShoot();
      e.nextShot = now + shotInterval * (0.85 + Math.random() * 0.4);
    });
  }

  s.enemies.forEach(function (e) {
    if (!e) return;
    e.anim = (e.anim || 0) + 1;
    var ms = e.moveStyle || "patrol";
    if (ms === "zigzag") {
      e.x += e.dir * e.speed * 1.25;
      e.y += Math.sin(e.anim * 0.18) * 0.55;
    } else if (ms === "sine") {
      e.x += e.dir * e.speed * 0.7;
      e.y = (e.homeY || e.y) + Math.sin(e.anim * 0.1) * 10;
      if (!e.homeY) e.homeY = e.y;
    } else if (ms === "slow") {
      e.x += e.dir * e.speed * 0.55;
      e.y += Math.sin(e.anim * 0.06) * 0.1;
    } else if (ms === "dash") {
      if (e.anim % 50 < 18) e.x += e.dir * e.speed * 2.2;
      else e.x += e.dir * e.speed * 0.4;
      e.y += Math.sin(e.anim * 0.1) * 0.2;
    } else {
      e.x += e.dir * e.speed;
      e.y += Math.sin(e.anim * 0.08 + e.x * 0.01) * 0.15;
    }
    if (e.x <= 0) { e.x = 0; e.dir = 1; }
    if (e.x + e.w >= W) { e.x = W - e.w; e.dir = -1; }
    if (e.anim % 4 === 0) {
      s.particles.push({
        type: "trail",
        x: e.x + e.w / 2 + (Math.random() - 0.5) * 6,
        y: e.y + 4,
        vx: -e.dir * 0.4 + (Math.random() - 0.5) * 0.5,
        vy: -0.8 - Math.random() * 0.6,
        life: 10, maxLife: 10,
        color: e.col || "#ff5555",
        r: 1.5 + Math.random() * 1.5
      });
    }
  });

  // Death Beam — only damages while FIRE / Space is held
  if ((s.phase === "playing" || s.phase === "boss") && s.player) {
    var beamHeld = !!(s.keys[" "] || s.touch.fire);
    if (Date.now() < (s.effects.deathBeamUntil || 0) && beamHeld) {
      var beamX = s.player.x + s.player.w / 2 - 8;
      var beamW = 16;
      // damage enemies
      for (var dei = s.enemies.length - 1; dei >= 0; dei--) {
        var en = s.enemies[dei];
        if (!en) continue;
        if (en.x < beamX + beamW && en.x + en.w > beamX) {
          en.hp -= 0.35;
          if (en.hp <= 0) {
            explode(en.x + en.w / 2, en.y + en.h / 2, en.col || "#ff2d55", false);
            maybeDropPickup(en.x + en.w / 2, en.y + en.h / 2);
            s.score += 10;
            s.runCoins += 1;
            s.killsThisLevel++;
            s.enemies.splice(dei, 1);
          }
        }
      }
      // damage boss
      if (s.boss && !s.bossEntering) {
        var dBoss = s.boss;
        if (dBoss.x < beamX + beamW && dBoss.x + dBoss.w > beamX) {
          dBoss.hp -= 0.25;
          if (dBoss.hp <= 0) {
            explode(dBoss.x + dBoss.w / 2, dBoss.y + dBoss.h / 2, dBoss.c1, true);
            s.score += 200;
            s.runCoins += 40;
            floatText(dBoss.x + dBoss.w / 2, dBoss.y + dBoss.h / 2, "+40 🪙", "#ffd23f");
            s.boss = null;
            showBanner(t("bossDestroyed"), 1400);
            setTimeout(nextLevel, 1400);
          }
        }
      }
    }
  }

  s.bullets = s.bullets.filter(function (b) {
    var keep = true;
    for (var ei = s.enemies.length - 1; ei >= 0; ei--) {
      var e = s.enemies[ei];
      if (!e) continue;
      if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
        e.hp -= b.dmg || 1;
        if (!b.pierce) keep = false;
        var isMissile = b.explosive || b.type === "missile";
        if (isMissile) {
          explode(b.x + b.w / 2, b.y + b.h / 2, "#ff6b35", true);
          // splash damage to nearby enemies
          var cx = b.x + b.w / 2, cy = b.y + b.h / 2;
          for (var sj = s.enemies.length - 1; sj >= 0; sj--) {
            if (sj === ei) continue;
            var oe = s.enemies[sj];
            if (!oe) continue;
            var odx = (oe.x + oe.w / 2) - cx, ody = (oe.y + oe.h / 2) - cy;
            if (odx * odx + ody * ody < 55 * 55) {
              oe.hp -= Math.max(1, Math.floor((b.dmg || 1) * 0.6));
              if (oe.hp <= 0) {
                explode(oe.x + oe.w / 2, oe.y + oe.h / 2, "#ffaa00");
                maybeDropPickup(oe.x + oe.w / 2, oe.y + oe.h / 2);
                s.enemies.splice(sj, 1);
                s.score += 10;
                s.killsThisLevel++;
                if (sj < ei) ei--;
              }
            }
          }
        }
        if (e.hp <= 0) {
          explode(e.x + e.w / 2, e.y + e.h / 2, e.col || "#ffaa00");
          snd.explosion(isMissile);
          maybeDropPickup(e.x + e.w / 2, e.y + e.h / 2);
          s.enemies.splice(ei, 1);
          s.score += 15;
          s.killsThisLevel++;
          syncHud();
          if (s.phase === "playing" && s.killsThisLevel >= s.killsNeeded && !s.boss) {
            startBossWarning();
          }
        } else if (isMissile) {
          snd.explosion(false);
        }
        if (!b.pierce) break;
      }
    }
    return keep;
  });

  s.enemyBullets = s.enemyBullets.filter(function (b) {
    if (b.x < s.player.x + s.player.w && b.x + b.w > s.player.x &&
        b.y < s.player.y + s.player.h && b.y + b.h > s.player.y) {
      explode(s.player.x + s.player.w / 2, s.player.y + s.player.h / 2, "#00f0ff");
      loseLife();
      return false;
    }
    return true;
  });

  s.particles.forEach(function (p) {
    if (p.type === "spark" || p.type === "debris" || p.type === "trail") {
      p.x += p.vx || 0; p.y += p.vy || 0;
      if (p.type === "debris") { p.vy += 0.05; p.rot += p.rotSpeed; }
      else if (p.type === "trail") { p.vx *= 0.92; p.vy *= 0.92; p.r *= 0.94; }
      else { p.vx *= 0.96; p.vy *= 0.96; }
    }
    p.life--;
  });
  s.particles = s.particles.filter(function (p) { return p.life > 0; });

  if (s.shake.time > 0) { s.shake.time--; if (s.shake.time <= 0) s.shake.mag = 0; }
}

// ============================================================
// DRAW
// ============================================================
function drawShip(ctx, x, y, w, h, ship) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  // bank / tilt with horizontal velocity for a dynamic feel
  var tilt = (state.player && state.player.tilt) || 0;
  ctx.rotate(tilt);
  var moving = state.player && (Math.abs(state.player.vx || 0) + Math.abs(state.player.vy || 0) > 0.5);
  var flameLen = moving ? (14 + Math.random() * 10) : (8 + Math.random() * 5);
  // outer glow flame
  ctx.shadowColor = ship.accent || "#00f0ff";
  ctx.shadowBlur = moving ? 18 : 8;
  ctx.fillStyle = moving ? "#ff6b35" : "#ffea00";
  ctx.beginPath();
  ctx.moveTo(-7, h / 2 - 2);
  ctx.lineTo(0, h / 2 + flameLen);
  ctx.lineTo(7, h / 2 - 2);
  ctx.closePath();
  ctx.fill();
  // hot core
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(-3, h / 2);
  ctx.lineTo(0, h / 2 + flameLen * 0.55);
  ctx.lineTo(3, h / 2);
  ctx.closePath();
  ctx.fill();
  // hull
  var g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, ship.hull);
  g.addColorStop(1, ship.wing);
  ctx.fillStyle = g;
  ctx.shadowColor = ship.hull;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w / 2, h / 2);
  ctx.lineTo(0, h / 3);
  ctx.lineTo(-w / 2, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = ship.accent;
  ctx.beginPath();
  ctx.arc(0, -2, 5, 0, Math.PI * 2);
  ctx.fill();
  // speed lines when moving fast
  if (moving && Math.abs(state.player.vx) + Math.abs(state.player.vy) > 4) {
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = ship.hull;
    ctx.lineWidth = 1.5;
    for (var i = 0; i < 3; i++) {
      var ly = -h / 3 + i * 10;
      ctx.beginPath();
      ctx.moveTo(-w / 3, ly);
      ctx.lineTo(-w / 2 - 8 - Math.random() * 6, ly + (state.player.vy || 0) * 0.3);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawWingman(ctx, wm, ship) {
  ctx.save();
  ctx.translate(wm.x + wm.w / 2, wm.y + wm.h / 2);
  ctx.scale(0.62, 0.62);
  ctx.globalAlpha = 0.92;
  var g = ctx.createLinearGradient(0, -18, 0, 18);
  g.addColorStop(0, ship.hull);
  g.addColorStop(1, ship.wing);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(20, 20);
  ctx.lineTo(0, 12);
  ctx.lineTo(-20, 20);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawEnemy(ctx, e) {
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  var bob = Math.sin((e.anim || 0) * 0.15) * 1.5;
  ctx.translate(0, bob);
  var col = e.col || "#ff5555";
  var col2 = e.col2 || "#aa2222";
  var shape = e.shape || "wedge";
  // engine glow
  ctx.shadowColor = col;
  ctx.shadowBlur = 12;
  ctx.fillStyle = e.accent || col;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(-5, -e.h / 2 + 2);
  ctx.lineTo(0, -e.h / 2 - 6 - Math.random() * 4);
  ctx.lineTo(5, -e.h / 2 + 2);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  var g = ctx.createLinearGradient(0, -e.h / 2, 0, e.h / 2);
  g.addColorStop(0, col);
  g.addColorStop(1, col2);
  ctx.fillStyle = g;
  ctx.beginPath();
  if (shape === "diamond") {
    ctx.moveTo(0, e.h / 2); ctx.lineTo(e.w / 2.15, 0); ctx.lineTo(0, -e.h / 2); ctx.lineTo(-e.w / 2.15, 0);
  } else if (shape === "arrow") {
    ctx.moveTo(0, e.h / 2); ctx.lineTo(e.w / 2.4, -e.h / 6); ctx.lineTo(e.w / 3.5, -e.h / 2);
    ctx.lineTo(0, -e.h / 3.5); ctx.lineTo(-e.w / 3.5, -e.h / 2); ctx.lineTo(-e.w / 2.4, -e.h / 6);
  } else if (shape === "hex") {
    var hr = e.w / 2.1, hy = e.h / 2.1;
    for (var hi = 0; hi < 6; hi++) {
      var ha = (hi / 6) * Math.PI * 2 - Math.PI / 2;
      var hx = Math.cos(ha) * hr, hyy = Math.sin(ha) * hy;
      if (hi === 0) ctx.moveTo(hx, hyy); else ctx.lineTo(hx, hyy);
    }
  } else if (shape === "saucer") {
    ctx.ellipse(0, 0, e.w / 2, e.h / 3.2, 0, 0, Math.PI * 2);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -2, e.w / 3.5, e.h / 4.5, 0, 0, Math.PI * 2);
  } else if (shape === "blade") {
    ctx.moveTo(0, e.h / 2); ctx.lineTo(e.w / 5, 0); ctx.lineTo(e.w / 2.2, -e.h / 2);
    ctx.lineTo(0, -e.h / 4); ctx.lineTo(-e.w / 2.2, -e.h / 2); ctx.lineTo(-e.w / 5, 0);
  } else {
    // wedge (default scout)
    ctx.moveTo(0, e.h / 2); ctx.lineTo(e.w / 2, -e.h / 2); ctx.lineTo(0, -e.h / 5); ctx.lineTo(-e.w / 2, -e.h / 2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = e.accent || "#ff8888";
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.55;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  // eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-5, 2, 2.8, 0, Math.PI * 2);
  ctx.arc(5, 2, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = e.bulletColor || "#ffd23f";
  ctx.beginPath();
  ctx.arc(-5, 2.4, 1.3, 0, Math.PI * 2);
  ctx.arc(5, 2.4, 1.3, 0, Math.PI * 2);
  ctx.fill();
  // accent details for some shapes
  if (shape === "diamond" || shape === "blade") {
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5 + Math.sin((e.anim || 0) * 0.2) * 0.3;
    ctx.beginPath();
    ctx.moveTo(-e.w / 2, 0); ctx.lineTo(-e.w / 2 - 5, -3);
    ctx.moveTo(e.w / 2, 0); ctx.lineTo(e.w / 2 + 5, -3);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function bossFillStyle(ctx, b, h) {
  var g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, b.c1);
  g.addColorStop(1, b.c2);
  return g;
}
function bossEye(ctx, x, y, r, accent) {
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = accent;
  ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, Math.PI * 2); ctx.fill();
}

// Each boss shape gets its own silhouette + decorations + subtle animation
// driven by b.timer, so no two bosses look or move alike.
var BOSS_SHAPE_DRAWERS = {
  // Crimson Guardian / Frost Sentinel — a faceted crystal that slowly rotates & morphs
  crystal: function (ctx, b) {
    var t = b.timer * 0.03;
    var pulse = 1 + Math.sin(t * 2) * 0.06;
    ctx.shadowColor = b.c1; ctx.shadowBlur = 26;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    var facets = 7;
    ctx.beginPath();
    for (var i = 0; i < facets; i++) {
      var ang = (i / facets) * Math.PI * 2 + t;
      var rad = (i % 2 === 0 ? b.w / 2 : b.w / 3.2) * pulse;
      var px = Math.cos(ang) * rad, py = Math.sin(ang) * rad * (b.h / b.w);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = b.accent; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.7; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.fillStyle = b.accent;
    ctx.beginPath(); ctx.arc(0, 0, 10 * pulse, 0, Math.PI * 2); ctx.fill();
  },
  // Blue Dragon — winged head with horns, snout & nostrils, diving toward the player
  dragon: function (ctx, b) {
    var flap = Math.sin(b.timer * 0.15) * 14;
    ctx.shadowColor = b.c1; ctx.shadowBlur = 22;
    // wings (behind the head, bat-like with jagged trailing edge)
    ctx.fillStyle = b.c2;
    ctx.beginPath();
    ctx.moveTo(-b.w / 7, -b.h / 10);
    ctx.lineTo(-b.w / 2 - 16, -22 + flap);
    ctx.lineTo(-b.w / 2.3, -2 + flap * 0.5);
    ctx.lineTo(-b.w / 2.8, 12 + flap * 0.3);
    ctx.lineTo(-b.w / 3.6, b.h / 5);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(b.w / 7, -b.h / 10);
    ctx.lineTo(b.w / 2 + 16, -22 + flap);
    ctx.lineTo(b.w / 2.3, -2 + flap * 0.5);
    ctx.lineTo(b.w / 2.8, 12 + flap * 0.3);
    ctx.lineTo(b.w / 3.6, b.h / 5);
    ctx.closePath(); ctx.fill();
    // head/snout, pointing down toward the player like it's diving in to attack
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath();
    ctx.moveTo(0, b.h / 2);
    ctx.lineTo(b.w / 6.5, b.h / 5);
    ctx.lineTo(b.w / 4, -b.h / 10);
    ctx.lineTo(b.w / 6.5, -b.h / 2.3);
    ctx.lineTo(0, -b.h / 2.8);
    ctx.lineTo(-b.w / 6.5, -b.h / 2.3);
    ctx.lineTo(-b.w / 4, -b.h / 10);
    ctx.lineTo(-b.w / 6.5, b.h / 5);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    // horns
    ctx.fillStyle = "#ffea00";
    ctx.beginPath(); ctx.moveTo(-b.w / 9, -b.h / 2.3); ctx.lineTo(-b.w / 7, -b.h / 1.5); ctx.lineTo(-b.w / 17, -b.h / 2.4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(b.w / 9, -b.h / 2.3); ctx.lineTo(b.w / 7, -b.h / 1.5); ctx.lineTo(b.w / 17, -b.h / 2.4); ctx.closePath(); ctx.fill();
    // eyes & nostrils near the snout
    bossEye(ctx, -8, 2, 5, b.accent); bossEye(ctx, 8, 2, 5, b.accent);
    ctx.fillStyle = b.c2;
    ctx.beginPath(); ctx.arc(-4, b.h / 2 - 8, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4, b.h / 2 - 8, 2, 0, Math.PI * 2); ctx.fill();
  },
  // Frost Sentinel — a spiky six-pointed ice star/snowflake, distinct from the crystal boss
  frost: function (ctx, b) {
    var t = b.timer * 0.02;
    var pulse = 1 + Math.sin(b.timer * 0.05) * 0.05;
    ctx.shadowColor = b.c1; ctx.shadowBlur = 26;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    var points = 6;
    var outer = (b.w / 2) * pulse, inner = b.w / 5;
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var ang = (i / (points * 2)) * Math.PI * 2 + t;
      var rad = (i % 2 === 0 ? outer : inner);
      var px = Math.cos(ang) * rad, py = Math.sin(ang) * rad * (b.h / b.w);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = b.accent; ctx.lineWidth = 2; ctx.globalAlpha = 0.85; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    // icy core
    ctx.fillStyle = b.accent;
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = b.c2;
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  },
  // Eye of the Storm / Celestial Judge halo eye — a giant watching eye
  eye: function (ctx, b) {
    var r = Math.min(b.w, b.h) / 2;
    ctx.shadowColor = b.c1; ctx.shadowBlur = 30;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    for (var i = 0; i < 8; i++) {
      var ang = (i / 8) * Math.PI * 2 + b.timer * 0.02;
      ctx.strokeStyle = b.accent; ctx.globalAlpha = 0.5; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r); ctx.lineTo(Math.cos(ang) * (r + 14), Math.sin(ang) * (r + 14)); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    bossEye(ctx, 0, 0, r * 0.55, b.accent);
    ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2); ctx.fill();
  },
  // Venom Serpent / Abyssal Leviathan — sinuous segmented body
  serpent: function (ctx, b) {
    ctx.shadowColor = b.c1; ctx.shadowBlur = 18;
    var segs = 5;
    for (var i = 0; i < segs; i++) {
      var sx = -b.w / 2 + (i / (segs - 1)) * b.w;
      var sy = Math.sin(b.timer * 0.06 + i * 0.9) * 16;
      var sr = (b.h / 2) * (1 - i * 0.08);
      ctx.fillStyle = i === segs - 1 ? bossFillStyle(ctx, b, b.h) : b.c1;
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    var headX = -b.w / 2, headY = Math.sin(b.timer * 0.06) * 16;
    bossEye(ctx, headX - 6, headY - 6, 4, b.accent); bossEye(ctx, headX - 6, headY + 6, 4, b.accent);
  },
  // Void Reaper / Void Sovereign — hooded skull with scythe blades
  reaper: function (ctx, b) {
    ctx.shadowColor = b.c1; ctx.shadowBlur = 24;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath();
    ctx.arc(0, -b.h / 6, b.w / 3.4, Math.PI, 0);
    ctx.lineTo(b.w / 3, b.h / 2); ctx.lineTo(0, b.h / 3); ctx.lineTo(-b.w / 3, b.h / 2);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = b.accent; ctx.lineWidth = 4;
    var swing = Math.sin(b.timer * 0.08) * 0.5;
    ctx.beginPath(); ctx.moveTo(-b.w / 2, 0); ctx.quadraticCurveTo(-b.w / 2 - 30, -20 + swing * 20, -b.w / 2 - 10, -40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.w / 2, 0); ctx.quadraticCurveTo(b.w / 2 + 30, -20 - swing * 20, b.w / 2 + 10, -40); ctx.stroke();
    bossEye(ctx, -9, -b.h / 6, 4, "#ff2d55"); bossEye(ctx, 9, -b.h / 6, 4, "#ff2d55");
  },
  // King of the Galaxy / Astral Sovereign — crowned hex throne shape
  king: function (ctx, b) {
    ctx.shadowColor = b.c1; ctx.shadowBlur = 22;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath();
    ctx.moveTo(-b.w / 2, 0); ctx.lineTo(-b.w / 4, -b.h / 2); ctx.lineTo(b.w / 4, -b.h / 2);
    ctx.lineTo(b.w / 2, 0); ctx.lineTo(b.w / 4, b.h / 2); ctx.lineTo(-b.w / 4, b.h / 2);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = b.accent;
    for (var i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 18, -b.h / 2); ctx.lineTo(i * 18 - 7, -b.h / 2 - 16 - Math.sin(b.timer * 0.05 + i) * 4); ctx.lineTo(i * 18 + 7, -b.h / 2); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "#00f0ff"; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
  },
  // Ether Phantom / Solar Wraith — ghostly wavy-bottomed body that flickers
  phantom: function (ctx, b) {
    ctx.globalAlpha = b.phaseVisible === false ? 0.35 : 0.85;
    ctx.shadowColor = b.c1; ctx.shadowBlur = 20;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath();
    ctx.moveTo(-b.w / 2, -b.h / 4);
    ctx.quadraticCurveTo(0, -b.h / 2 - 10, b.w / 2, -b.h / 4);
    ctx.lineTo(b.w / 2, b.h / 4);
    var waves = 4;
    for (var i = waves; i >= 0; i--) {
      var wx = -b.w / 2 + (i / waves) * b.w;
      var wy = b.h / 2 + (i % 2 === 0 ? 10 : -6) + Math.sin(b.timer * 0.08 + i) * 4;
      ctx.lineTo(wx, wy);
    }
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    bossEye(ctx, -10, -b.h / 6, 5, b.accent); bossEye(ctx, 10, -b.h / 6, 5, b.accent);
  },
  // Shadow Assassin — sharp angular blade silhouette
  blade: function (ctx, b) {
    ctx.shadowColor = b.c1; ctx.shadowBlur = 18;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath();
    ctx.moveTo(0, -b.h / 2); ctx.lineTo(b.w / 2, 0); ctx.lineTo(b.w / 5, 0); ctx.lineTo(b.w / 3, b.h / 2);
    ctx.lineTo(0, b.h / 4); ctx.lineTo(-b.w / 3, b.h / 2); ctx.lineTo(-b.w / 5, 0); ctx.lineTo(-b.w / 2, 0);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = b.accent; ctx.lineWidth = 2; ctx.globalAlpha = 0.8; ctx.stroke(); ctx.globalAlpha = 1;
    bossEye(ctx, 0, -b.h / 8, 4, b.accent);
  },
  // Star Devourer — jagged maw full of teeth
  devourer: function (ctx, b) {
    ctx.shadowColor = b.c1; ctx.shadowBlur = 20;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath(); ctx.ellipse(0, 0, b.w / 2, b.h / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    var open = 6 + Math.abs(Math.sin(b.timer * 0.1)) * 10;
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath(); ctx.ellipse(0, 4, b.w / 3, open, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    for (var i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(i * 9, 4 - open); ctx.lineTo(i * 9 - 4, 4 - open + 8); ctx.lineTo(i * 9 + 4, 4 - open + 8); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(i * 9, 4 + open); ctx.lineTo(i * 9 - 4, 4 + open - 8); ctx.lineTo(i * 9 + 4, 4 + open - 8); ctx.closePath(); ctx.fill();
    }
  },
  // Crystal Hydra — three crystalline heads on one body
  hydra: function (ctx, b) {
    ctx.shadowColor = b.c1; ctx.shadowBlur = 18;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath(); ctx.ellipse(0, b.h / 4, b.w / 2.6, b.h / 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    var offsets = [-1, 0, 1];
    offsets.forEach(function (o, idx) {
      var hx = o * (b.w / 3.4);
      var hy = -b.h / 4 - Math.abs(o) * 6 + Math.sin(b.timer * 0.05 + idx) * 4;
      ctx.fillStyle = idx === 1 ? b.accent : b.c1;
      ctx.beginPath();
      ctx.moveTo(hx, hy - 18); ctx.lineTo(hx + 10, hy + 6); ctx.lineTo(hx - 10, hy + 6); ctx.closePath(); ctx.fill();
      bossEye(ctx, hx, hy - 2, 3, "#ff00e0");
    });
  },
  // Space Curse — skull sigil with a slowly spinning runic ring
  curse: function (ctx, b) {
    ctx.shadowColor = b.c1; ctx.shadowBlur = 22;
    ctx.strokeStyle = b.accent; ctx.lineWidth = 2; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.arc(0, 0, b.w / 2, b.timer * 0.02, b.timer * 0.02 + 4.6); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath(); ctx.arc(0, -4, b.w / 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-b.w / 5, b.h / 8, b.w / 2.5, b.h / 4);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(-10, -8, 6, 0, Math.PI * 2); ctx.arc(10, -8, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-5, 10); ctx.lineTo(5, 10); ctx.closePath(); ctx.fill();
  },
  // Inferno Titan — hulking fire giant silhouette
  giant: function (ctx, b) {
    ctx.shadowColor = b.c1; ctx.shadowBlur = 26;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath();
    ctx.moveTo(-b.w / 2.2, b.h / 2); ctx.lineTo(-b.w / 3, -b.h / 4); ctx.lineTo(-b.w / 6, -b.h / 2);
    ctx.lineTo(b.w / 6, -b.h / 2); ctx.lineTo(b.w / 3, -b.h / 4); ctx.lineTo(b.w / 2.2, b.h / 2);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = b.accent; ctx.globalAlpha = 0.7 + Math.sin(b.timer * 0.2) * 0.2;
    ctx.beginPath(); ctx.arc(0, b.h / 6, 10, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    bossEye(ctx, -10, -b.h / 4, 4, "#ff4d00"); bossEye(ctx, 10, -b.h / 4, 4, "#ff4d00");
  },
  // Abyssal Leviathan fallback uses serpent (aliased below)
  // Nebula Empress — orbiting rings around a glowing orb
  orb: function (ctx, b) {
    var r = Math.min(b.w, b.h) / 2.6;
    for (var i = 0; i < 3; i++) {
      ctx.strokeStyle = b.accent; ctx.globalAlpha = 0.5; ctx.lineWidth = 2;
      ctx.save(); ctx.rotate(b.timer * 0.02 * (i + 1));
      ctx.beginPath(); ctx.ellipse(0, 0, r + 14 + i * 10, (r + 14 + i * 10) * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.shadowColor = b.c1; ctx.shadowBlur = 28;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  },
  // Celestial Judge — robed figure with a halo (uses eye-style halo variant)
  judge: function (ctx, b) {
    ctx.shadowColor = b.accent; ctx.shadowBlur = 22;
    ctx.strokeStyle = b.accent; ctx.lineWidth = 3; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.arc(0, -b.h / 2, 20, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath();
    ctx.moveTo(0, -b.h / 3); ctx.lineTo(b.w / 2.2, b.h / 2); ctx.lineTo(-b.w / 2.2, b.h / 2);
    ctx.closePath(); ctx.fill();
    bossEye(ctx, -8, -b.h / 5, 4, "#00f0ff"); bossEye(ctx, 8, -b.h / 5, 4, "#00f0ff");
  },
  // Plague Harbinger — a swarm cluster acting as one entity
  swarm: function (ctx, b) {
    ctx.shadowColor = b.c1; ctx.shadowBlur = 14;
    var count = 9;
    for (var i = 0; i < count; i++) {
      var ang = (i / count) * Math.PI * 2 + b.timer * 0.04;
      var rad = b.w / 3.2 + Math.sin(b.timer * 0.07 + i) * 8;
      var px = Math.cos(ang) * rad, py = Math.sin(ang) * rad * 0.7;
      ctx.fillStyle = i % 2 === 0 ? b.c1 : b.accent;
      ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = b.c2; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
  },
  // Dark Emperor — angular armored humanoid ship hybrid
  emperor: function (ctx, b) {
    ctx.shadowColor = b.accent; ctx.shadowBlur = 20;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath();
    ctx.moveTo(0, -b.h / 2); ctx.lineTo(b.w / 3, -b.h / 6); ctx.lineTo(b.w / 2, b.h / 2);
    ctx.lineTo(0, b.h / 4); ctx.lineTo(-b.w / 2, b.h / 2); ctx.lineTo(-b.w / 3, -b.h / 6);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = b.accent;
    ctx.fillRect(-b.w / 2, b.h / 6, 12, 6); ctx.fillRect(b.w / 2 - 12, b.h / 6, 12, 6);
    bossEye(ctx, 0, -b.h / 6, 5, b.accent);
  },
  // Chaos Incarnate — shifting amorphous blob with random protrusions
  blob: function (ctx, b) {
    ctx.shadowColor = b.c1; ctx.shadowBlur = 24;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    var spikes = 10;
    ctx.beginPath();
    for (var i = 0; i <= spikes; i++) {
      var ang = (i / spikes) * Math.PI * 2;
      var rad = (b.w / 2.4) * (0.85 + Math.sin(b.timer * 0.07 + i * 2) * 0.18);
      var px = Math.cos(ang) * rad, py = Math.sin(ang) * rad * (b.h / b.w);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    bossEye(ctx, -8, 0, 4, b.accent); bossEye(ctx, 8, 6, 4, b.accent);
  },
  // Lord of the Cosmos — final boss: grand orb crowned with stars & rings
  cosmos: function (ctx, b) {
    var r = Math.min(b.w, b.h) / 2.4;
    for (var i = 0; i < 4; i++) {
      ctx.strokeStyle = i % 2 === 0 ? b.c1 : b.c2; ctx.globalAlpha = 0.55; ctx.lineWidth = 2.5;
      ctx.save(); ctx.rotate(b.timer * 0.015 * (i + 1) * (i % 2 === 0 ? 1 : -1));
      ctx.beginPath(); ctx.ellipse(0, 0, r + 16 + i * 12, (r + 16 + i * 12) * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.shadowColor = b.accent; ctx.shadowBlur = 32;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = b.accent;
    for (var s = 0; s < 5; s++) {
      var sang = (s / 5) * Math.PI * 2 + b.timer * 0.03;
      ctx.beginPath(); ctx.arc(Math.cos(sang) * r * 0.5, Math.sin(sang) * r * 0.5, 3, 0, Math.PI * 2); ctx.fill();
    }
    bossEye(ctx, 0, 0, r * 0.3, "#ff00e0");
  },
  // Iron Colossus / mech — blocky robotic build
  mech: function (ctx, b) {
    ctx.shadowColor = b.accent; ctx.shadowBlur = 16;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h * 0.7);
    ctx.shadowBlur = 0;
    ctx.fillStyle = b.c2;
    ctx.fillRect(-b.w / 2 - 10, -b.h / 4, 12, b.h / 2);
    ctx.fillRect(b.w / 2 - 2, -b.h / 4, 12, b.h / 2);
    var blink = Math.floor(b.timer / 20) % 2 === 0;
    ctx.fillStyle = blink ? b.accent : "#333";
    ctx.beginPath(); ctx.arc(-10, -b.h / 6, 4, 0, Math.PI * 2); ctx.arc(10, -b.h / 6, 4, 0, Math.PI * 2); ctx.fill();
  },
  // Thunder Behemoth / beast — clawed creature
  beast: function (ctx, b) {
    ctx.shadowColor = b.c1; ctx.shadowBlur = 20;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath();
    ctx.moveTo(0, -b.h / 2); ctx.lineTo(b.w / 2.4, -b.h / 6); ctx.lineTo(b.w / 3, b.h / 2);
    ctx.lineTo(-b.w / 3, b.h / 2); ctx.lineTo(-b.w / 2.4, -b.h / 6);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = b.accent; ctx.lineWidth = 2;
    for (var c = -1; c <= 1; c += 2) {
      ctx.beginPath(); ctx.moveTo(c * b.w / 3, b.h / 2 - 4); ctx.lineTo(c * b.w / 3 + c * 10, b.h / 2 + 14); ctx.stroke();
    }
    bossEye(ctx, -9, -b.h / 5, 5, "#fff7cc"); bossEye(ctx, 9, -b.h / 5, 5, "#fff7cc");
  },
  // Abyssal Leviathan — tentacled sea monster
  seamonster: function (ctx, b) {
    ctx.shadowColor = b.c1; ctx.shadowBlur = 18;
    ctx.fillStyle = bossFillStyle(ctx, b, b.h);
    ctx.beginPath(); ctx.ellipse(0, -b.h / 6, b.w / 2.6, b.h / 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = b.c1; ctx.lineWidth = 6; ctx.lineCap = "round";
    for (var tI = -2; tI <= 2; tI++) {
      var tx = tI * (b.w / 6);
      var sway = Math.sin(b.timer * 0.08 + tI) * 14;
      ctx.beginPath(); ctx.moveTo(tx, b.h / 6);
      ctx.quadraticCurveTo(tx + sway, b.h / 2, tx + sway * 1.4, b.h / 1.5);
      ctx.stroke();
    }
    bossEye(ctx, -10, -b.h / 6, 4, b.accent); bossEye(ctx, 10, -b.h / 6, 4, b.accent);
  },
};

function drawBoss(ctx, b) {
  if (b.phaseVisible === false) {
    // phasing out — faint silhouette only
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.strokeStyle = b.accent || "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  // charge telegraph ring
  if (b.charging) {
    ctx.strokeStyle = b.accent || "#ffd23f";
    ctx.lineWidth = 3;
    ctx.shadowColor = b.accent || "#ffd23f";
    ctx.shadowBlur = 20;
    ctx.globalAlpha = 0.55 + Math.sin(Date.now() / 50) * 0.35;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(b.w, b.h) * 0.7 + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
  // ambient aura
  ctx.shadowColor = b.c1;
  ctx.shadowBlur = 18;
  var drawer = BOSS_SHAPE_DRAWERS[b.shape] || BOSS_SHAPE_DRAWERS.crystal;
  drawer(ctx, b);
  ctx.restore();
}

function drawShieldRing(ctx, p) {
  if (p.invuln <= 0 || p.shield <= 0) return;
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  ctx.strokeStyle = "rgba(0,240,255,0.75)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, 0, p.w / 2 + 8 + Math.sin(Date.now() / 90) * 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawPickup(ctx, p) {
  var bobY = Math.sin(p.bob) * 2;
  var spin = p.bob * 0.8;
  ctx.save();
  ctx.translate(p.x + 10, p.y + 10 + bobY);
  if (p.type === "coin") {
    ctx.shadowColor = "#ffd23f";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a8790a";
    ctx.font = "8px Orbitron, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", 0, 0.5);
    ctx.restore();
    return;
  }

  var key = p.key || "";
  ctx.shadowColor = p.color || "#fff";
  ctx.shadowBlur = 16;

  // Distinct weapon-mode shapes
  if (key === "dualLaser") {
    // twin yellow laser capsules
    ctx.rotate(spin * 0.15);
    ctx.fillStyle = "#ffd23f";
    ctx.fillRect(-10, -3, 6, 14);
    ctx.fillRect(4, -3, 6, 14);
    ctx.fillStyle = "#fff8c8";
    ctx.fillRect(-8, -1, 2, 10);
    ctx.fillRect(6, -1, 2, 10);
    ctx.strokeStyle = "#ffaa00";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-11, -4, 8, 16);
    ctx.strokeRect(3, -4, 8, 16);
  } else if (key === "deathBeam") {
    // red vertical beam crystal
    ctx.fillStyle = "#ff2d55";
    ctx.beginPath();
    ctx.moveTo(0, -14); ctx.lineTo(8, 0); ctx.lineTo(0, 14); ctx.lineTo(-8, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,200,200,0.9)";
    ctx.fillRect(-2, -12, 4, 24);
    ctx.strokeStyle = "#ff6b8a";
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (key === "frost") {
    // icy snowflake / crystal
    ctx.strokeStyle = "#7de8ff";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (var fi = 0; fi < 6; fi++) {
      var fa = fi * Math.PI / 3 + spin * 0.2;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(fa) * 12, Math.sin(fa) * 12);
      ctx.moveTo(Math.cos(fa) * 7, Math.sin(fa) * 7);
      ctx.lineTo(Math.cos(fa + 0.35) * 10, Math.sin(fa + 0.35) * 10);
    }
    ctx.stroke();
    ctx.fillStyle = "#c9f7ff";
    ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
  } else if (key === "nova") {
    // green expanding star burst
    ctx.fillStyle = "#4ade80";
    ctx.beginPath();
    for (var ni = 0; ni < 8; ni++) {
      var na = (ni / 8) * Math.PI * 2 + spin * 0.25;
      var nr = ni % 2 === 0 ? 13 : 6;
      var nx = Math.cos(na) * nr, ny = Math.sin(na) * nr;
      if (ni === 0) ctx.moveTo(nx, ny); else ctx.lineTo(nx, ny);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ecfdf5";
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  } else if (key === "missile") {
    // orange rocket silhouette
    ctx.rotate(-0.4);
    ctx.fillStyle = "#ff6b35";
    ctx.beginPath();
    ctx.moveTo(0, -12); ctx.lineTo(5, -2); ctx.lineTo(5, 8); ctx.lineTo(0, 11); ctx.lineTo(-5, 8); ctx.lineTo(-5, -2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ffd23f";
    ctx.fillRect(-3, 8, 6, 4);
    ctx.fillStyle = "#fff";
    ctx.fillRect(-2, -4, 4, 6);
  } else if (key === "rapid") {
    // lightning bolt
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath();
    ctx.moveTo(2, -12); ctx.lineTo(-4, 0); ctx.lineTo(1, 0); ctx.lineTo(-2, 12); ctx.lineTo(6, -1); ctx.lineTo(1, -1);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#fff3a0";
    ctx.lineWidth = 1; ctx.stroke();
  } else if (key === "shield") {
    // barrier hex
    ctx.fillStyle = "rgba(63,208,255,0.35)";
    ctx.strokeStyle = "#3fd0ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var hi = 0; hi < 6; hi++) {
      var ha = (hi / 6) * Math.PI * 2 - Math.PI / 2;
      var hx = Math.cos(ha) * 11, hy = Math.sin(ha) * 11;
      if (hi === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#e0f7ff";
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
  } else if (key === "damage") {
    // magenta spiked orb
    ctx.fillStyle = "#ff00e0";
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#ff99f0";
    ctx.lineWidth = 2;
    for (var di = 0; di < 6; di++) {
      var da = di * Math.PI / 3 + spin * 0.3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(da) * 8, Math.sin(da) * 8);
      ctx.lineTo(Math.cos(da) * 13, Math.sin(da) * 13);
      ctx.stroke();
    }
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
  } else if (key === "triple") {
    // three cyan diamonds
    ctx.fillStyle = "#aef1ff";
    for (var ti = -1; ti <= 1; ti++) {
      ctx.beginPath();
      ctx.moveTo(ti * 8, -7); ctx.lineTo(ti * 8 + 4, 0); ctx.lineTo(ti * 8, 7); ctx.lineTo(ti * 8 - 4, 0);
      ctx.closePath(); ctx.fill();
    }
  } else if (key === "wingman") {
    // mini ship
    ctx.fillStyle = "#4ade80";
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(8, 8); ctx.lineTo(0, 4); ctx.lineTo(-8, 8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#bbf7d0";
    ctx.beginPath(); ctx.arc(0, -2, 2.5, 0, Math.PI * 2); ctx.fill();
  } else {
    // fallback ring + icon
    ctx.fillStyle = "rgba(10,10,24,0.7)";
    ctx.strokeStyle = p.color || "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 0;
    ctx.fillText(p.icon || "?", 0, 1);
  }
  ctx.restore();
}

function draw() {
  var s = state;
  ctx.save();
  if (s.shake.time > 0) {
    var mag = s.shake.mag;
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
  }
  ctx.clearRect(-20, -20, W + 40, H + 40);

  ctx.fillStyle = "#ffffff";
  s.stars.forEach(function (st) {
    ctx.globalAlpha = st.r / 1.8;
    ctx.beginPath();
    ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  var ship = currentShip();

  // Death Beam visual — only while FIRE is held
  if (Date.now() < (s.effects.deathBeamUntil || 0) && (s.keys[" "] || s.touch.fire)) {
    var beamX = s.player.x + s.player.w / 2;
    var pulse = 0.55 + Math.sin(Date.now() * 0.02) * 0.25;
    ctx.save();
    ctx.globalAlpha = pulse;
    var bg = ctx.createLinearGradient(beamX, s.player.y, beamX, 0);
    bg.addColorStop(0, "rgba(255,45,85,0.9)");
    bg.addColorStop(0.5, "rgba(255,100,50,0.55)");
    bg.addColorStop(1, "rgba(255,200,100,0.15)");
    ctx.fillStyle = bg;
    ctx.fillRect(beamX - 10, 0, 20, s.player.y);
    ctx.globalAlpha = 1;
    ctx.shadowColor = "#ff2d55";
    ctx.shadowBlur = 22;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(beamX - 3, 0, 6, s.player.y);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  if (!(s.player.invuln > 0 && s.player.shield <= 0 && Math.floor(s.player.invuln / 6) % 2 === 0)) {
    drawShip(ctx, s.player.x, s.player.y, s.player.w, s.player.h, ship);
  }
  drawShieldRing(ctx, s.player);

  if (s.wingman) drawWingman(ctx, s.wingman, ship);

  ctx.fillStyle = "#ffea00";
  ctx.shadowColor = "#ffea00";
  ctx.shadowBlur = 10;
  s.bullets.forEach(function (b) {
    ctx.save();
    var col = b.color || "#00f0ff";
    if (b.type === "laser") {
      ctx.shadowColor = col; ctx.shadowBlur = 12;
      ctx.fillStyle = col;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(b.x + 1, b.y, 1, b.h);
    } else if (b.type === "frost") {
      ctx.shadowColor = col; ctx.shadowBlur = 14;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(b.x + b.w / 2, b.y);
      ctx.lineTo(b.x + b.w, b.y + b.h * 0.4);
      ctx.lineTo(b.x + b.w / 2, b.y + b.h);
      ctx.lineTo(b.x, b.y + b.h * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillRect(b.x + 2, b.y + 2, 2, b.h - 4);
    } else if (b.type === "plasma") {
      ctx.shadowColor = col; ctx.shadowBlur = 16;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2 - 1, b.y + b.h / 2 - 1, b.w / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.type === "missile" || b.explosive) {
      ctx.shadowColor = "#ff6b35"; ctx.shadowBlur = 10;
      ctx.fillStyle = col || "#ff3d00";
      // body
      ctx.fillRect(b.x + 1, b.y + 2, b.w - 2, b.h - 4);
      // tip
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + 4);
      ctx.lineTo(b.x + b.w / 2, b.y);
      ctx.lineTo(b.x + b.w, b.y + 4);
      ctx.closePath();
      ctx.fill();
      // exhaust flicker
      ctx.fillStyle = Math.random() > 0.4 ? "#ffd23f" : "#ff6b35";
      ctx.fillRect(b.x + 2, b.y + b.h - 2, b.w - 4, 4);
    } else if (b.type === "homing") {
      ctx.shadowColor = col; ctx.shadowBlur = 10;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(b.x + b.w / 2, b.y);
      ctx.lineTo(b.x + b.w, b.y + b.h);
      ctx.lineTo(b.x, b.y + b.h);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.shadowColor = col; ctx.shadowBlur = 8;
      ctx.fillStyle = col;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
    ctx.restore();
  });
  ctx.shadowBlur = 0;

  s.enemyBullets.forEach(function (b) {
    var col = b.color || "#ff3366";
    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur = 12;
    ctx.fillStyle = col;
    if (b.roundShot || b.seekPlayer) {
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, b.y + b.h / 2, Math.max(b.w, b.h) / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2 - 1, b.y + b.h / 2 - 1, Math.max(1.5, b.w / 4), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(b.x + 1, b.y + 1, Math.max(1, b.w - 2), 3);
    }
    ctx.restore();
  });
  ctx.shadowBlur = 0;

  s.enemies.forEach(function (e) { drawEnemy(ctx, e); });

  if (s.boss) drawBoss(ctx, s.boss);

  s.pickups.forEach(function (p) { drawPickup(ctx, p); });

  s.particles.forEach(function (p) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    if (p.type === "trail") {
      ctx.shadowColor = p.color; ctx.shadowBlur = 8;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.r || 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (p.type === "spark") {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size || p.r || 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "debris") {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    } else if (p.type === "ring") {
      var prog = 1 - p.life / p.maxLife;
      var r = 4 + prog * (p.maxR - 4);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === "flash") {
      var g2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g2.addColorStop(0, "rgba(255,255,255,0.9)");
      g2.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
  ctx.restore();
}

function loop() {
  if (!state.running || state.phase === "paused" || state.phase === "shop") return;
  update();
  draw();
  rafId = requestAnimationFrame(loop);
}

// ============================================================
// INPUT
// ============================================================
window.addEventListener("keydown", function (e) {
  var k = e.key.toLowerCase();
  state.keys[k] = true;
  if (e.key === " ") {
    state.keys[" "] = true;
    e.preventDefault();
  }
  if (k === "p" && state.running) {
    if (state.phase === "paused") {
      setPhase(state.boss ? "boss" : (state.phase === "bosswarning" ? "bosswarning" : "playing"));
      rafId = requestAnimationFrame(loop);
    } else if (state.phase !== "shop") {
      setPhase("paused");
    }
  }
});
window.addEventListener("keyup", function (e) {
  state.keys[e.key.toLowerCase()] = false;
  if (e.key === " ") state.keys[" "] = false;
});

function togglePause() {
  if (!state.running) return;
  if (state.phase === "paused") {
    setPhase(state.boss ? "boss" : "playing");
    rafId = requestAnimationFrame(loop);
  } else if (state.phase !== "shop") {
    setPhase("paused");
  }
}

function toggleSound() {
  snd.enabled = !snd.enabled;
  soundOn = snd.enabled;
  snd.setAmbientVolume();
  el.soundBtn.textContent = soundOn ? t("soundOn") : t("soundOff");
}

function toggleLang() {
  save.lang = save.lang === "ar" ? "en" : "ar";
  persistSave();
  applyLang();
}

function bindHold(button, key) {
  var setTouch = function (val) { return function (e) { e.preventDefault(); state.touch[key] = val; }; };
  button.addEventListener("pointerdown", function (e) { snd.ensure(); setTouch(true)(e); });
  button.addEventListener("pointerup", setTouch(false));
  button.addEventListener("pointerleave", function () { state.touch[key] = false; });
  button.addEventListener("pointercancel", function () { state.touch[key] = false; });
}
bindHold(el.btnFire, "fire");

// ============================================================
// FLOATING VIRTUAL ANALOG JOYSTICK — appears under finger, zero-lag
// ============================================================
(function setupJoystick() {
  var zone = el.joystickZone;
  var base = el.joystickBase;
  var knob = el.joystickKnob;
  if (!zone || !base || !knob) return;

  var active = false;
  var pointerId = null;
  var originX = 0, originY = 0; // screen coords of stick center
  var maxRadius = 48;
  var DEAD = 0.08; // small deadzone so micro-jitter does not drift the ship

  function applyVector(clientX, clientY) {
    var dx = clientX - originX;
    var dy = clientY - originY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var nx = 0, ny = 0;
    if (dist > 0.5) {
      nx = dx / maxRadius;
      ny = dy / maxRadius;
      var len = Math.sqrt(nx * nx + ny * ny);
      if (len > 1) { nx /= len; ny /= len; len = 1; }
      // soft deadzone
      if (len < DEAD) { nx = 0; ny = 0; }
      else {
        // remap so past deadzone goes 0→1 smoothly
        var t = (len - DEAD) / (1 - DEAD);
        nx = (nx / len) * t;
        ny = (ny / len) * t;
      }
    }
    // visual knob (pixel offset, clamped)
    var kx = nx * maxRadius;
    var ky = ny * maxRadius;
    var klen = Math.sqrt(kx * kx + ky * ky);
    if (klen > maxRadius) { kx = (kx / klen) * maxRadius; ky = (ky / klen) * maxRadius; }
    knob.style.transform = "translate(calc(-50% + " + kx.toFixed(1) + "px), calc(-50% + " + ky.toFixed(1) + "px))";
    state.touch.stickX = nx;
    state.touch.stickY = ny;
  }

  function hideStick() {
    base.classList.remove("active", "visible");
    base.style.left = "";
    base.style.top = "";
    base.style.transform = "";
    knob.style.transform = "translate(-50%, -50%)";
    state.touch.stickX = 0;
    state.touch.stickY = 0;
    active = false;
    pointerId = null;
  }

  function onStart(e) {
    // only primary touch / left mouse
    if (active) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    snd.ensure();
    try { zone.setPointerCapture(e.pointerId); } catch (err) {}
    pointerId = e.pointerId;
    active = true;

    // Float the stick so its center is under the finger
    var zrect = zone.getBoundingClientRect();
    originX = e.clientX;
    originY = e.clientY;
    // keep base fully inside the zone
    var half = base.offsetWidth / 2 || 60;
    var localX = Math.max(half, Math.min(zrect.width - half, e.clientX - zrect.left));
    var localY = Math.max(half, Math.min(zrect.height - half, e.clientY - zrect.top));
    // recompute origin to the clamped center so vector math stays consistent
    originX = zrect.left + localX;
    originY = zrect.top + localY;

    base.style.left = localX + "px";
    base.style.top = localY + "px";
    base.style.transform = "translate(-50%, -50%)";
    base.classList.add("active", "visible");
    applyVector(e.clientX, e.clientY);
  }

  function onMove(e) {
    if (!active || e.pointerId !== pointerId) return;
    e.preventDefault();
    applyVector(e.clientX, e.clientY);
  }

  function onEnd(e) {
    if (!active) return;
    if (pointerId !== null && e.pointerId !== pointerId) return;
    e.preventDefault();
    try { zone.releasePointerCapture(e.pointerId); } catch (err) {}
    hideStick();
  }

  zone.addEventListener("pointerdown", onStart, { passive: false });
  zone.addEventListener("pointermove", onMove, { passive: false });
  zone.addEventListener("pointerup", onEnd, { passive: false });
  zone.addEventListener("pointercancel", onEnd, { passive: false });
  // safety: if pointer leaves the window while held
  window.addEventListener("blur", hideStick);
})();

// Try to switch to fullscreen + force landscape orientation.
// Orientation lock only works while in fullscreen, and only on browsers
// that support the Screen Orientation API (mainly Android Chrome — iOS
// Safari does not support locking, so it will just stay as-is there).
async function tryLockLandscape() {
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock("landscape");
    }
  } catch (err) {
    // Ignored: not supported on this device/browser, game still works fine.
  }
}
function startGameLandscape() {
  tryLockLandscape();
  startGame();
}
el.btnInstructionsNext.addEventListener("click", function () {
  el.overlayInstructions.classList.remove("active");
  el.overlayStart.classList.add("active");
});
el.btnStart.addEventListener("click", startGameLandscape);
el.btnResume.addEventListener("click", togglePause);
el.btnQuit.addEventListener("click", quitToMenu);
el.btnRestart.addEventListener("click", startGameLandscape);
el.btnRestartWin.addEventListener("click", startGameLandscape);
el.soundBtn.addEventListener("click", toggleSound);
el.pauseBtn.addEventListener("click", togglePause);
document.getElementById("langBtn").addEventListener("click", toggleLang);
applyLang();

// rotate hint (only enabled on small portrait screens)
function checkRotateHint() {
  var isSmall = window.innerWidth < 900;
  var isPortrait = window.matchMedia("(orientation: portrait)").matches;
  el.rotateHint.classList.toggle("enabled", isSmall && isPortrait);
}
window.addEventListener("resize", checkRotateHint);
checkRotateHint();
el.btnRotateOk.addEventListener("click", function () {
  el.rotateHint.classList.remove("enabled");
  el.rotateHint.classList.remove("show");
});

// initial HUD values from saved data
el.highScoreVal.textContent = save.highScore || 0;
el.coinsVal.textContent = save.coins || 0;
loadGlobalPlayCount();

setPhase("start");
// The instructions screen is shown first (see overlayInstructions in the HTML),
// so undo the "start" overlay activation setPhase just did — it'll be shown
// once the player taps NEXT on the instructions screen instead.
el.overlayStart.classList.remove("active");
syncHud();

