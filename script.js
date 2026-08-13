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
var STORAGE_KEY = "novaStrike_save_v1";
function loadSave() {
  var def = {
    highScore: 0,
    coins: 0,
    playCount: 0,
    ownedShips: [0],
    selectedShip: 0,
    upgrades: { fireRate: 0, damage: 0, multishot: 0 },
  };
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return def;
    var parsed = JSON.parse(raw);
    return Object.assign(def, parsed, { upgrades: Object.assign(def.upgrades, parsed.upgrades || {}) });
  } catch (e) { return def; }
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
  { id: 0, name: "Falcon", cost: 0, speed: 6, fireRateMul: 1, dmgBonus: 0, multiBonus: 0,
    hull: "#00f0ff", wing: "#0066aa", accent: "#ff00e0" },
  { id: 1, name: "Raptor", cost: 300, speed: 7.2, fireRateMul: 0.85, dmgBonus: 0, multiBonus: 0,
    hull: "#ff8c1a", wing: "#a83e00", accent: "#ffd23f" },
  { id: 2, name: "Vanguard", cost: 700, speed: 6.2, fireRateMul: 1, dmgBonus: 1, multiBonus: 0,
    hull: "#a259ff", wing: "#4b1f8a", accent: "#4ade80" },
  { id: 3, name: "Aurora", cost: 1500, speed: 8, fireRateMul: 0.8, dmgBonus: 1, multiBonus: 1,
    hull: "#ff4fd8", wing: "#3fd0ff", accent: "#ffea00" },
  { id: 4, name: "Nomad", cost: 2400, speed: 7, fireRateMul: 0.9, dmgBonus: 2, multiBonus: 0,
    hull: "#39ff6a", wing: "#0a6b2a", accent: "#00f0ff" },
  { id: 5, name: "Phantom", cost: 3600, speed: 8.6, fireRateMul: 0.72, dmgBonus: 1, multiBonus: 1,
    hull: "#2dd4bf", wing: "#0a3330", accent: "#ff00e0" },
  { id: 6, name: "Warlord", cost: 5200, speed: 6.8, fireRateMul: 0.78, dmgBonus: 3, multiBonus: 1,
    hull: "#ff2d55", wing: "#5a0018", accent: "#ffd23f" },
  { id: 7, name: "Singularity", cost: 7500, speed: 9, fireRateMul: 0.6, dmgBonus: 2, multiBonus: 2,
    hull: "#c084fc", wing: "#2a0a4a", accent: "#ffffff" },
];

var UPGRADE_DEFS = {
  fireRate: { label: "Fire Rate", max: 5, baseCost: 150, step: 110, desc: "Shoot faster" },
  damage: { label: "Bullet Damage", max: 5, baseCost: 150, step: 110, desc: "Bullets hit harder" },
  multishot: { label: "Multishot", max: 3, baseCost: 400, step: 300, desc: "Extra parallel bullets" },
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
SoundEngine.prototype.shoot = function () {
  this.tone(880 * this.pitchMul, 0.08, "square", 0.045, 300 * this.pitchMul);
};
SoundEngine.prototype.enemyShoot = function () {
  this.tone(220 * this.pitchMul, 0.12, "sawtooth", 0.05, 120 * this.pitchMul);
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
  var self = this;
  [0, 1, 2].forEach(function (i) {
    setTimeout(function () { self.tone(180, 0.3, "sawtooth", 0.14, 90); }, i * 320);
  });
};
SoundEngine.prototype.bossRoar = function () {
  this.tone(70, 0.6, "sawtooth", 0.2, 40);
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
  btnLeft: document.getElementById("btnLeft"),
  btnRight: document.getElementById("btnRight"),
  btnFire: document.getElementById("btnFire"),
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
  touch: { left: false, right: false, fire: false },
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
  effects: { rapidUntil: 0, wingmanUntil: 0, damageUntil: 0, tripleUntil: 0, powerShield: 0 },
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
  el.pauseBtn.textContent = phase === "paused" ? "▶ Resume" : "⏸ Pause";
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
      var statsText = "Speed " + ship.speed + " · Dmg +" + ship.dmgBonus + (ship.multiBonus ? " · +" + ship.multiBonus + " shot" : "");
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
  var count = 3;
  showBanner("⚠️ WARNING — BOSS INCOMING IN " + count + " ⚠️", 1100, true);
  snd.bossAlarm();
  var iv = setInterval(function () {
    count--;
    if (count > 0) {
      showBanner("⚠️ WARNING — BOSS INCOMING IN " + count + " ⚠️", 1100, true);
    } else {
      clearInterval(iv);
      startBoss();
    }
  }, 1100);
}

function startBoss() {
  var lvl = state.level;
  var def = BOSS_DEFS[lvl - 1] || BOSS_DEFS[BOSS_DEFS.length - 1];
  state.bossEntering = true;
  state.boss = {
    def: def, shape: def.shape, c1: def.c1, c2: def.c2, accent: def.accent,
    x: W / 2 - 70, y: -140, targetY: 60, w: 140, h: 90,
    hp: 45 + lvl * 22, maxHp: 45 + lvl * 22,
    dir: 1, speed: Math.min(4.2, 1.4 + lvl * 0.11), timer: 0,
    moveType: def.move, attackType: def.attack,
    homeX: W / 2 - 70, homeY: 60, angle: Math.random() * Math.PI * 2,
    phaseVisible: true, teleportAt: 0, chargeVx: 0,
  };
  setPhase("boss");
  showBanner("☠ " + def.name + " HAS ARRIVED", 2400);
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
  showBanner("SECTOR " + state.level + ": " + STAGE_NAMES[state.level - 1], 2200);
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
  state.player = { x: W / 2 - 20, y: H - 70, w: 40, h: 40, speed: ship.speed, invuln: 0, shield: 3, maxShield: 3 };
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
  state.effects = { rapidUntil: 0, wingmanUntil: 0, damageUntil: 0, tripleUntil: 0, powerShield: 0 };
  snd.setLevel(1);
  initStars();
  setPhase("playing");
  showBanner("SECTOR 1: " + STAGE_NAMES[0], 2000);

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
  return Math.max(70, base);
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
  for (var i = 0; i < total; i++) {
    var offset = (i - (total - 1) / 2) * 10;
    var angle = (i - (total - 1) / 2) * 0.06;
    state.bullets.push({
      x: fromX - 2 + offset, y: fromY, w: 4, h: 14, speed: 10,
      vx: total > 1 ? Math.sin(angle) * 3 : 0, dmg: dmg,
    });
  }
}

function shoot() {
  var now = Date.now();
  if (now - state.lastShot > computeFireInterval()) {
    spawnPlayerBullets(state.player.x + state.player.w / 2, state.player.y);
    state.lastShot = now;
    snd.shoot();
  }
  if (state.wingman && now - (state.wingman.lastShot || 0) > 260) {
    state.bullets.push({ x: state.wingman.x + state.wingman.w / 2 - 2, y: state.wingman.y, w: 4, h: 12, speed: 10, dmg: computeDamage(), vx: 0 });
    state.wingman.lastShot = now;
  }
}

// ============================================================
// PICKUPS — coins & power-ups
// ============================================================
// Power-up drop types (each has a distinct icon & effect):
//  ⚡ rapid   — boosts fire rate for a while
//  💧 shield  — grants a barrier that absorbs the next 5 enemy hits
//  🌀 damage  — boosts bullet damage for a while
//  ❄ triple  — fires 3 bullets instead of 1 for a while
//  🛸 wingman — summons a temporary escort drone that also fires
var POWERUP_TYPES = [
  { key: "rapid", icon: "⚡", color: "#ffd23f", label: "RAPID FIRE" },
  { key: "shield", icon: "💧", color: "#3fd0ff", label: "BARRIER +5" },
  { key: "damage", icon: "🌀", color: "#ff00e0", label: "DAMAGE UP" },
  { key: "triple", icon: "❄", color: "#aef1ff", label: "TRIPLE SHOT" },
  { key: "wingman", icon: "🛸", color: "#4ade80", label: "WINGMAN" },
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

function applyPowerup(key) {
  var now = Date.now();
  if (key === "rapid") {
    state.effects.rapidUntil = now + 8000;
    floatText(state.player.x, state.player.y - 10, "RAPID FIRE!", "#ffd23f");
  } else if (key === "shield") {
    state.effects.powerShield = Math.min(9, state.effects.powerShield + 5);
    floatText(state.player.x, state.player.y - 10, "BARRIER +5!", "#3fd0ff");
  } else if (key === "damage") {
    state.effects.damageUntil = now + 9000;
    floatText(state.player.x, state.player.y - 10, "DAMAGE UP!", "#ff00e0");
  } else if (key === "triple") {
    state.effects.tripleUntil = now + 9000;
    floatText(state.player.x, state.player.y - 10, "TRIPLE SHOT!", "#aef1ff");
  } else if (key === "wingman") {
    state.effects.wingmanUntil = now + 12000;
    state.wingman = { x: state.player.x - 46, y: state.player.y + 6, w: 26, h: 26, lastShot: 0 };
    floatText(state.player.x, state.player.y - 10, "WINGMAN ONLINE!", "#4ade80");
  }
  snd.powerup();
  syncHud();
}

// ============================================================
// BOSS MOVEMENT PATTERNS — every boss shape moves differently
// ============================================================
function updateBossMovement(boss, s, now) {
  var t = boss.timer;
  switch (boss.moveType) {
    case "swoop":
      boss.x += boss.dir * boss.speed;
      if (boss.x <= 0 || boss.x + boss.w >= W) boss.dir *= -1;
      boss.y = boss.homeY + Math.sin(t * 0.03) * 30;
      break;
    case "float":
      boss.x += boss.dir * boss.speed * 0.5;
      if (boss.x <= 0 || boss.x + boss.w >= W) boss.dir *= -1;
      boss.y = boss.homeY + Math.sin(t * 0.02) * 14;
      break;
    case "sway":
      boss.x = W / 2 - boss.w / 2 + Math.sin(t * 0.018) * (W / 2 - boss.w / 2 - 10);
      boss.y = boss.homeY + Math.cos(t * 0.03) * 10;
      break;
    case "teleport":
      if (t > (boss.teleportAt || 0)) {
        boss.x = 20 + Math.random() * (W - boss.w - 40);
        boss.teleportAt = t + 70;
        explode(boss.x + boss.w / 2, boss.y + boss.h / 2, boss.accent, false);
      }
      boss.y = boss.homeY + Math.sin(t * 0.05) * 6;
      break;
    case "phase":
      boss.x += boss.dir * boss.speed * 0.7;
      if (boss.x <= 0 || boss.x + boss.w >= W) boss.dir *= -1;
      boss.phaseVisible = Math.floor(t / 40) % 2 === 0;
      break;
    case "orbit":
      boss.angle += 0.02;
      boss.x = W / 2 - boss.w / 2 + Math.cos(boss.angle) * (W / 2 - boss.w / 2 - 20);
      boss.y = boss.homeY + Math.sin(boss.angle) * 22;
      break;
    case "pulseForward":
      boss.x += boss.dir * boss.speed;
      if (boss.x <= 0 || boss.x + boss.w >= W) boss.dir *= -1;
      boss.y = boss.homeY + Math.max(0, Math.sin(t * 0.025)) * 46;
      break;
    case "charge":
      if (t % 130 < 34) {
        boss.y = boss.homeY + (t % 130) * 3;
      } else {
        boss.y += (boss.homeY - boss.y) * 0.08;
        boss.x += boss.dir * boss.speed;
        if (boss.x <= 0 || boss.x + boss.w >= W) boss.dir *= -1;
      }
      break;
    case "erratic":
      if (t % 55 === 0) boss.dir = Math.random() < 0.5 ? 1 : -1;
      boss.x += boss.dir * boss.speed * 1.2;
      boss.x = Math.max(0, Math.min(W - boss.w, boss.x));
      boss.y = boss.homeY + Math.sin(t * 0.04) * 20;
      break;
    case "sideToSide":
    default:
      boss.x += boss.dir * boss.speed;
      if (boss.x <= 0 || boss.x + boss.w >= W) boss.dir *= -1;
      break;
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
      var n = 3 + Math.min(5, Math.floor(lvl / 3));
      for (var i = 0; i < n; i++) {
        var dx = (i - (n - 1) / 2) * 1.15;
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
      var dir = Math.sin(boss.timer * 0.05) > 0 ? 1 : -1;
      for (var l = 0; l < 3; l++) {
        s.enemyBullets.push({ x: cx - 10 + l * 10, y: cy, w: 8, h: 22, speed: spd * 1.1, dx: dir * 2.4, color: bc });
      }
      snd.enemyShoot();
      break;
    }
    case "homing": {
      var px = s.player.x + s.player.w / 2;
      var homeDx = Math.max(-2.4, Math.min(2.4, (px - cx) / 60));
      s.enemyBullets.push({ x: cx - 4, y: cy, w: 8, h: 14, speed: spd, dx: homeDx, color: bc });
      s.enemyBullets.push({ x: cx - 4, y: cy - 10, w: 8, h: 14, speed: spd * 0.85, dx: homeDx * 0.6, color: bc });
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
    var left = s.keys["arrowleft"] || s.keys["a"] || s.touch.left;
    var right = s.keys["arrowright"] || s.keys["d"] || s.touch.right;
    if (left) s.player.x -= s.player.speed;
    if (right) s.player.x += s.player.speed;
    s.player.x = Math.max(0, Math.min(W - s.player.w, s.player.x));
    if (s.keys[" "] || s.touch.fire) shoot();
    if (s.player.invuln > 0) s.player.invuln--;

    if (s.wingman) {
      s.wingman.x = s.player.x - 46;
      s.wingman.y = s.player.y + 6;
      if (now > s.effects.wingmanUntil) s.wingman = null;
    }
  }

  s.bullets.forEach(function (b) { b.y -= b.speed; if (b.vx) b.x += b.vx; });
  s.bullets = s.bullets.filter(function (b) { return b.y + b.h > 0; });

  s.enemyBullets.forEach(function (b) {
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

      var shootRate = Math.max(300, 1000 - s.level * 26);
      if (now - s.lastBossShot > shootRate) {
        s.lastBossShot = now;
        fireBossAttack(boss, s);
      }

      s.bullets = s.bullets.filter(function (b) {
        if (b.x < boss.x + boss.w && b.x + b.w > boss.x && b.y < boss.y + boss.h && b.y + b.h > boss.y) {
          boss.hp -= b.dmg || 1;
          explode(b.x, b.y, "#ffea00");
          syncHud();
          if (boss.hp <= 0) {
            explode(boss.x + boss.w / 2, boss.y + boss.h / 2, "#ff00e0", true);
            snd.explosion(true);
            s.score += 200;
            s.runCoins += 40;
            floatText(boss.x + boss.w / 2, boss.y + boss.h / 2, "+40 🪙", "#ffd23f");
            s.boss = null;
            showBanner("✅ BOSS DESTROYED!", 1400);
            setTimeout(nextLevel, 1400);
          }
          return false;
        }
        return true;
      });

      if (!s.bossEntering && boss.y + boss.h > s.player.y && boss.x < s.player.x + s.player.w && boss.x + boss.w > s.player.x) {
        loseLife();
      }
    }
  } else if (s.phase === "playing") {
    var spawnRate = Math.max(380, 1250 - s.level * 44);
    var maxAlive = Math.min(20, 7 + Math.floor(s.level * 0.8));
    if (now - s.lastEnemySpawn > spawnRate && s.enemies.length < maxAlive) {
      var size = 34;
      var row = Math.floor(Math.random() * 3);
      var isShooter = Math.random() < Math.min(0.65, 0.3 + s.level * 0.02);
      s.enemies.push({
        x: Math.random() * (W - size), y: TOP_BAND_MIN + row * ROW_GAP, w: size, h: size,
        speed: 0.8 + s.level * 0.09 + Math.random() * 0.6,
        dir: Math.random() < 0.5 ? 1 : -1,
        hp: s.level >= 3 ? 2 : 1, maxHp: s.level >= 3 ? 2 : 1,
        type: isShooter ? "shooter" : "normal",
        nextShot: now + 500 + Math.random() * 900,
      });
      s.lastEnemySpawn = now;
    }
  }

  // Each shooter enemy fires on its own independent timer, so shots feel steady
  // instead of relying on a single global "pick a random shooter" tick.
  if (s.phase === "playing") {
    var shotInterval = Math.max(700, 1900 - s.level * 55);
    s.enemies.forEach(function (e) {
      if (e.type !== "shooter") return;
      if (now >= e.nextShot) {
        s.enemyBullets.push({ x: e.x + e.w / 2 - 2, y: e.y + e.h, w: 4, h: 10, speed: 3.4 + s.level * 0.14 });
        snd.enemyShoot();
        e.nextShot = now + shotInterval * (0.7 + Math.random() * 0.6);
      }
    });
  }

  s.enemies.forEach(function (e) {
    e.x += e.dir * e.speed;
    if (e.x <= 0) { e.x = 0; e.dir = 1; }
    if (e.x + e.w >= W) { e.x = W - e.w; e.dir = -1; }
  });

  s.bullets = s.bullets.filter(function (b) {
    var keep = true;
    for (var ei = s.enemies.length - 1; ei >= 0; ei--) {
      var e = s.enemies[ei];
      if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
        e.hp -= b.dmg || 1;
        keep = false;
        if (e.hp <= 0) {
          explode(e.x + e.w / 2, e.y + e.h / 2, e.type === "shooter" ? "#ff00e0" : "#ffaa00");
          snd.explosion(false);
          maybeDropPickup(e.x + e.w / 2, e.y + e.h / 2);
          s.enemies.splice(ei, 1);
          s.score += e.type === "shooter" ? 20 : 10;
          s.killsThisLevel++;
          syncHud();
          if (s.phase === "playing" && s.killsThisLevel >= s.killsNeeded && !s.boss) {
            startBossWarning();
          }
        }
        break;
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
    if (p.type === "spark" || p.type === "debris") {
      p.x += p.vx; p.y += p.vy;
      if (p.type === "debris") { p.vy += 0.05; p.rot += p.rotSpeed; }
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
  ctx.fillStyle = "#ffea00";
  ctx.beginPath();
  ctx.moveTo(-6, h / 2);
  ctx.lineTo(0, h / 2 + 10 + Math.random() * 4);
  ctx.lineTo(6, h / 2);
  ctx.closePath();
  ctx.fill();
  var g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, ship.hull);
  g.addColorStop(1, ship.wing);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w / 2, h / 2);
  ctx.lineTo(0, h / 3);
  ctx.lineTo(-w / 2, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = ship.accent;
  ctx.beginPath();
  ctx.arc(0, -2, 5, 0, Math.PI * 2);
  ctx.fill();
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
  ctx.fillStyle = e.type === "shooter" ? "#ff00e0" : "#ff5555";
  ctx.beginPath();
  ctx.moveTo(0, e.h / 2);
  ctx.lineTo(e.w / 2, -e.h / 2);
  ctx.lineTo(0, -e.h / 3);
  ctx.lineTo(-e.w / 2, -e.h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-6, 0, 3, 0, Math.PI * 2);
  ctx.arc(6, 0, 3, 0, Math.PI * 2);
  ctx.fill();
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
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
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
  ctx.save();
  ctx.translate(p.x, p.y + bobY);
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
  } else {
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 14;
    ctx.fillStyle = "rgba(10,10,24,0.7)";
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.icon, 0, 1);
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

  if (!(s.player.invuln > 0 && s.player.shield <= 0 && Math.floor(s.player.invuln / 6) % 2 === 0)) {
    drawShip(ctx, s.player.x, s.player.y, s.player.w, s.player.h, ship);
  }
  drawShieldRing(ctx, s.player);

  if (s.wingman) drawWingman(ctx, s.wingman, ship);

  ctx.fillStyle = "#ffea00";
  ctx.shadowColor = "#ffea00";
  ctx.shadowBlur = 10;
  s.bullets.forEach(function (b) { ctx.fillRect(b.x, b.y, b.w, b.h); });
  ctx.shadowBlur = 0;

  s.enemyBullets.forEach(function (b) {
    var col = b.color || "#ff3366";
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 10;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });
  ctx.shadowBlur = 0;

  s.enemies.forEach(function (e) { drawEnemy(ctx, e); });

  if (s.boss) drawBoss(ctx, s.boss);

  s.pickups.forEach(function (p) { drawPickup(ctx, p); });

  s.particles.forEach(function (p) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    if (p.type === "spark") {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
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
  el.soundBtn.textContent = soundOn ? "🔊 Sound" : "🔇 Muted";
}

function bindHold(button, key) {
  var setTouch = function (val) { return function (e) { e.preventDefault(); state.touch[key] = val; }; };
  button.addEventListener("pointerdown", function (e) { snd.ensure(); setTouch(true)(e); });
  button.addEventListener("pointerup", setTouch(false));
  button.addEventListener("pointerleave", function () { state.touch[key] = false; });
  button.addEventListener("pointercancel", function () { state.touch[key] = false; });
}
bindHold(el.btnLeft, "left");
bindHold(el.btnRight, "right");
bindHold(el.btnFire, "fire");

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

