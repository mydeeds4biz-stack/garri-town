"use strict";

const SAVE_KEY = "garriTownIdleSave";
const OFFLINE_LIMIT_SECONDS = 8 * 60 * 60;
const MAX_VALUE = 1e300;
const HELPERS = [
  { id: "aunty", state: "auntyCount", name: "Market Aunties", description: "Pack orders together", icon: "👩🏾‍🍳", baseCost: 10, costGrowth: 1.15, damage: 1 },
  { id: "danfo", state: "danfoCount", name: "Danfo Crew", description: "Fast hands, fast deliveries", icon: "🚌", baseCost: 120, costGrowth: 1.16, damage: 6 },
  { id: "guild", state: "guildCount", name: "Garri Guild", description: "The whole market pitches in", icon: "🧺", baseCost: 650, costGrowth: 1.17, damage: 32 },
];
const UPGRADES = [
  { id: "tap", state: "tapLevel", name: "Stronger scoops", description: "More packing power per tap", icon: "👆", baseCost: 15, growth: 1.2 },
  { id: "crew", state: "crewLevel", name: "Team huddle", description: "Boost all helper packing", icon: "📣", baseCost: 80, growth: 1.35 },
];
const ORDER_NAMES = [
  "First market order",
  "Yaba market rush",
  "Danfo depot delivery",
  "Lekki weekend market",
  "Balogun mega-order",
  "Lagos Island night market",
];
const defaults = {
  coins: 0,
  stage: 1,
  orderHp: 10,
  bestStage: 1,
  totalOrders: 0,
  tapLevel: 0,
  crewLevel: 0,
  auntyCount: 0,
  danfoCount: 0,
  guildCount: 0,
  prestige: 0,
  lastSaved: Date.now(),
  startedAt: Date.now(),
};

let state = { ...defaults };
let lastTick = Date.now();
let saveCounter = 0;
let toastTimeout;
let townRendered = false;

function $(id) {
  return document.getElementById(id);
}

function clamp(value, max = MAX_VALUE) {
  return Math.min(max, Math.max(0, value));
}

function safeAdd(left, right) {
  return Math.min(MAX_VALUE, left + right);
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "∞";
  if (value < 1000) return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(value < 10 ? 2 : 1);
  const units = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  const [size, suffix] = units.find(([limit]) => value >= limit);
  if (value >= 1e15) return value.toExponential(2);
  return `${(value / size).toFixed(value / size >= 100 ? 0 : 1)}${suffix}`;
}

function scaledValue(base, growth, level) {
  return Math.min(MAX_VALUE, base * Math.pow(growth, level));
}

function orderMaxHp(stage = state.stage) {
  return Math.max(1, scaledValue(10, 1.32, stage - 1));
}

function orderReward(stage = state.stage) {
  return Math.max(1, scaledValue(10, 1.2, stage - 1));
}

function tapPower() {
  return Math.min(MAX_VALUE, (1 + state.tapLevel * 2) * (1 + state.prestige * 0.25));
}

function helperDamagePerSecond() {
  const crewMultiplier = 1 + state.crewLevel * 0.5;
  const prestigeMultiplier = 1 + state.prestige * 0.25;
  return Math.min(MAX_VALUE, HELPERS.reduce((total, helper) =>
    total + state[helper.state] * helper.damage * crewMultiplier * prestigeMultiplier, 0));
}

function helperCost(helper) {
  return scaledValue(helper.baseCost, helper.costGrowth, state[helper.state]);
}

function upgradeCost(upgrade) {
  return scaledValue(upgrade.baseCost, upgrade.growth, state[upgrade.state]);
}

function showToast(message) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
}

function loadFarm() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) || "null");
    if (!saved || typeof saved !== "object") return;

    for (const key of Object.keys(defaults)) {
      if (Number.isFinite(saved[key]) && saved[key] >= 0) state[key] = Math.min(saved[key], MAX_VALUE);
    }
    state.stage = Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(state.stage)));
    state.bestStage = Math.max(state.stage, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(state.bestStage)));
    state.totalOrders = Math.floor(state.totalOrders);
    state.prestige = Math.floor(state.prestige);

    for (const key of ["tapLevel", "crewLevel", ...HELPERS.map((helper) => helper.state)]) {
      state[key] = Math.min(1e6, Math.floor(state[key]));
    }

    if (!Object.prototype.hasOwnProperty.call(saved, "stage")) {
      state.stage = Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, Math.floor((saved.orderIndex || 0) + 1)));
      state.bestStage = state.stage;
      state.totalOrders = Math.max(0, Math.floor(saved.ordersFilled || 0));
      showToast("Your old Garri Town coins are ready. Welcome to the market!");
    }

    state.orderHp = Number.isFinite(saved.orderHp) && saved.orderHp > 0
      ? Math.min(saved.orderHp, orderMaxHp())
      : orderMaxHp();
    state.lastSaved = Math.min(Date.now(), state.lastSaved);
    state.startedAt = state.startedAt || Date.now();
  } catch {
    showToast("Your browser couldn't load the saved game, so a fresh market is ready.");
  }
}

function saveFarm() {
  state.lastSaved = Date.now();
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    showToast("Save unavailable in this browser. Your current progress may not be kept.");
  }
}

function processDamage(damage) {
  let remainingDamage = clamp(damage);
  let completed = 0;

  while (remainingDamage >= state.orderHp) {
    remainingDamage -= state.orderHp;
    state.coins = safeAdd(state.coins, orderReward());
    state.totalOrders += 1;
    state.stage += 1;
    state.bestStage = Math.max(state.bestStage, state.stage);
    state.orderHp = orderMaxHp();
    completed += 1;
  }

  state.orderHp = Math.max(0, state.orderHp - remainingDamage);
  if (completed > 0) {
    showToast(completed === 1
      ? `Order packed! +${formatNumber(orderReward(state.stage - 1))} coins. The next market order is ready.`
      : `${formatNumber(completed)} market orders packed! Your crew earned the coins.`);
  }
  return completed;
}

function tapMarket() {
  const damage = tapPower();
  const completed = processDamage(damage);
  const target = $("tap-target");
  target.classList.remove("is-tapping");
  void target.offsetWidth;
  target.classList.add("is-tapping");

  const number = document.createElement("span");
  number.className = "floating-number";
  number.textContent = `+${formatNumber(damage)} ${completed ? "📦" : "🥣"}`;
  $("floating-numbers").append(number);
  window.setTimeout(() => number.remove(), 900);
  render();
  saveFarm();
}

function hireHelper(id) {
  const helper = HELPERS.find((item) => item.id === id);
  if (!helper) return;
  const cost = helperCost(helper);
  if (state.coins < cost) return;
  state.coins -= cost;
  state[helper.state] += 1;
  showToast(`${helper.name} joined your crew! They pack ${formatNumber(helper.damage)} order power each second.`);
  render();
  saveFarm();
}

function buyUpgrade(id) {
  const upgrade = UPGRADES.find((item) => item.id === id);
  if (!upgrade) return;
  const cost = upgradeCost(upgrade);
  if (state.coins < cost) return;
  state.coins -= cost;
  state[upgrade.state] += 1;
  showToast(`${upgrade.name} upgraded to level ${state[upgrade.state]}!`);
  render();
  saveFarm();
}

function potentialPrestige() {
  return Math.max(0, Math.floor((state.bestStage - 1) / 10) - state.prestige);
}

function prestige() {
  const reward = potentialPrestige();
  if (reward <= 0) return;
  const accepted = window.confirm(
    `Start a new market era for ${reward} Market Legacy? Your coins, helpers, upgrades, and order progress will reset. Your permanent power boost will grow.`
  );
  if (!accepted) return;

  state.prestige += reward;
  state.coins = 0;
  state.stage = 1;
  state.orderHp = orderMaxHp(1);
  state.bestStage = 1;
  state.tapLevel = 0;
  state.crewLevel = 0;
  for (const helper of HELPERS) state[helper.state] = 0;
  showToast(`New market era! +${reward} Market Legacy. Your taps and helpers are stronger forever.`);
  render();
  saveFarm();
}

function renderTown() {
  const helpers = HELPERS.reduce((total, helper) => total + state[helper.state], 0);
  if (!townRendered) {
    $("farm-layout").innerHTML = `
      <div class="map-field field-1"><span>🌿</span><span>🌿</span><span>🌿</span><small>CASSAVA</small></div>
      <div class="map-field field-2"><span>🌿</span><span>🌿</span><span>🌿</span><small>FARM</small></div>
      <div class="map-field field-5"><span>🌿</span><span>🌿</span><span>🌿</span><small>GARRI</small></div>
      <div class="map-building grater-building"><span>🏠</span><small>GARRI HOUSE</small><i>⚙️</i></div>
      <div class="map-building market-building"><span>🏪</span><small>MARKET</small><i>🧺</i></div>
      <div class="map-building farmhouse"><span>🏡</span><small>HOME</small></div>
      <span class="map-person person-a">🧑🏾‍🌾</span><span class="map-person person-b">👩🏿‍🌾</span>
      <span class="town-helper-count"></span>`;
    townRendered = true;
  }
  $("farm-layout").querySelector(".town-helper-count").textContent = `${formatNumber(helpers)} helpers`;
}

function renderHelpers() {
  $("helper-list").innerHTML = HELPERS.map((helper) => {
    const cost = helperCost(helper);
    const owned = state[helper.state];
    return `<article class="helper-card">
      <span class="helper-icon" aria-hidden="true">${helper.icon}</span>
      <span class="helper-copy"><strong>${helper.name}</strong><small>${helper.description}</small><small>Owned: ${formatNumber(owned)} · ${formatNumber(helper.damage * (1 + state.crewLevel * 0.5))} power/sec each</small></span>
      <button class="hire-button" data-hire="${helper.id}" type="button" ${state.coins < cost ? "disabled" : ""} aria-label="Hire ${helper.name} for ${formatNumber(cost)} coins">🪙 ${formatNumber(cost)}<span>HIRE</span></button>
    </article>`;
  }).join("");
}

function renderUpgrades() {
  $("upgrade-list").innerHTML = UPGRADES.map((upgrade) => {
    const cost = upgradeCost(upgrade);
    return `<article class="upgrade-card">
      <span class="helper-icon" aria-hidden="true">${upgrade.icon}</span>
      <span class="helper-copy"><strong>${upgrade.name} · L${state[upgrade.state]}</strong><small>${upgrade.description}</small><small>Next upgrade costs more each time</small></span>
      <button class="hire-button" data-upgrade="${upgrade.id}" type="button" ${state.coins < cost ? "disabled" : ""} aria-label="Upgrade ${upgrade.name} for ${formatNumber(cost)} coins">🪙 ${formatNumber(cost)}<span>UPGRADE</span></button>
    </article>`;
  }).join("");
}

function render() {
  const maxHp = orderMaxHp();
  const healthPercent = Math.max(0, Math.min(100, state.orderHp / maxHp * 100));
  const nextReward = orderReward();
  const legacyGain = potentialPrestige();
  const powerBoost = 1 + state.prestige * 0.25;
  const orderName = ORDER_NAMES[(state.stage - 1) % ORDER_NAMES.length];

  $("coins").textContent = formatNumber(state.coins);
  $("stage-count").textContent = formatNumber(state.stage);
  $("tap-stat").textContent = formatNumber(tapPower());
  $("dps-stat").textContent = formatNumber(helperDamagePerSecond());
  $("orders-beaten").textContent = formatNumber(state.totalOrders);
  $("order-number").textContent = formatNumber(state.stage);
  $("scene-order").textContent = formatNumber(state.stage);
  $("boss-name").textContent = orderName;
  $("boss-health").style.width = `${healthPercent}%`;
  $("boss-health").parentElement.setAttribute("aria-valuenow", String(Math.round(healthPercent)));
  $("boss-health-label").textContent = `${formatNumber(state.orderHp)} / ${formatNumber(maxHp)} packing power left`;
  $("order-reward").textContent = `+${formatNumber(nextReward)}`;
  $("idle-note").textContent = helperDamagePerSecond() > 0
    ? `Your crew packs ${formatNumber(helperDamagePerSecond())} power every second.`
    : "Tap the bowl or hire helpers to pack automatically.";

  $("prestige-badge").textContent = formatNumber(state.prestige);
  $("prestige-title").textContent = state.prestige > 0 ? "Market legend" : "Fresh start";
  $("prestige-progress").style.width = `${Math.min(100, state.bestStage / 10 * 100)}%`;
  $("prestige-boost").textContent = `${powerBoost.toFixed(2)}× power`;
  $("prestige-hint").textContent = legacyGain > 0
    ? `Prestige now for +${formatNumber(legacyGain)} Market Legacy.`
    : `Beat order ${formatNumber((state.prestige + 1) * 10)} to earn your next Market Legacy.`;
  $("prestige-button").disabled = legacyGain <= 0;
  $("prestige-button").textContent = legacyGain > 0 ? `+${formatNumber(legacyGain)} LEGACY` : "LOCKED";
  $("market-mood").textContent = helperDamagePerSecond() > 0 ? "⚡  The crew is packing" : "☀  The market is lively";

  renderHelpers();
  renderUpgrades();
  renderTown();
}

function simulate(seconds) {
  const damage = helperDamagePerSecond() * seconds;
  if (damage > 0) processDamage(damage);
}

function applyOfflineProgress() {
  const awaySeconds = Math.min(Math.max(0, (Date.now() - state.lastSaved) / 1000), OFFLINE_LIMIT_SECONDS);
  if (awaySeconds >= 10 && helperDamagePerSecond() > 0) {
    const oldStage = state.stage;
    simulate(awaySeconds);
    const orders = state.stage - oldStage;
    showToast(orders > 0
      ? `While you were away, your crew packed ${formatNumber(orders)} market orders!`
      : `While you were away, your crew packed ${formatNumber(helperDamagePerSecond() * awaySeconds)} order power.`);
  }
  render();
  saveFarm();
}

function tick() {
  const now = Date.now();
  const elapsed = Math.min((now - lastTick) / 1000, OFFLINE_LIMIT_SECONDS);
  lastTick = now;
  simulate(elapsed);
  render();
  saveCounter += elapsed;
  if (saveCounter >= 5) {
    saveFarm();
    saveCounter = 0;
  }
}

loadFarm();
$("tap-target").addEventListener("click", tapMarket);
$("helper-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-hire]");
  if (button) hireHelper(button.dataset.hire);
});
$("upgrade-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-upgrade]");
  if (button) buyUpgrade(button.dataset.upgrade);
});
$("prestige-button").addEventListener("click", prestige);
applyOfflineProgress();
window.setInterval(tick, 500);
window.addEventListener("pagehide", saveFarm);
