"use strict";

const SAVE_KEY = "garriTownIdleSave";
const OFFLINE_LIMIT_SECONDS = 8 * 60 * 60;
const PLOT_COSTS = [0, 80, 180, 400, 850, 1700];
const LEVEL_TITLES = ["", "New Roots", "Market Helper", "Farm Hand", "Town Trader", "Garri Maker", "Market Favourite", "Farm Keeper", "Town Builder"];
const CUSTOMERS = [
  { name: "Adaeze's market stall", initial: "A", product: "Golden garri", amount: 5, coins: 35, xp: 18 },
  { name: "Tunde's family kitchen", initial: "T", product: "Fresh garri", amount: 8, coins: 52, xp: 24 },
  { name: "Amara's corner shop", initial: "A", product: "Neatly packed garri", amount: 12, coins: 78, xp: 32 },
  { name: "Chidi's supper club", initial: "C", product: "Golden garri", amount: 17, coins: 112, xp: 42 },
  { name: "Kemi's market cart", initial: "K", product: "Fresh garri", amount: 23, coins: 155, xp: 55 },
];

const defaults = {
  coins: 65,
  cassava: 8,
  garri: 0,
  xp: 0,
  level: 1,
  plots: 1,
  fieldLevel: 0,
  millLevel: 0,
  orderIndex: 0,
  ordersFilled: 0,
  totalCoinsEarned: 0,
  lastSaved: Date.now(),
  startedAt: Date.now(),
};

let state = { ...defaults };
let lastTick = Date.now();
let saveCounter = 0;
let toastTimeout;
let renderedPlots = 0;

try {
  const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) || "null");
  if (saved && typeof saved === "object") {
    for (const key of Object.keys(defaults)) {
      if (Number.isFinite(saved[key]) && saved[key] >= 0) state[key] = saved[key];
    }
    state.level = Math.max(1, Math.floor(state.level));
    state.plots = Math.max(1, Math.min(6, Math.floor(state.plots)));
    state.fieldLevel = Math.max(0, Math.min(20, Math.floor(state.fieldLevel)));
    state.millLevel = Math.max(0, Math.min(20, Math.floor(state.millLevel)));
    state.orderIndex = Math.floor(state.orderIndex);
    state.ordersFilled = Math.floor(state.ordersFilled);
    state.lastSaved = Math.min(Date.now(), state.lastSaved);
  }
} catch {
  showToast("Your browser couldn't load a saved farm, so we started a fresh one.");
}

function $(id) {
  return document.getElementById(id);
}

function currentOrder() {
  const base = CUSTOMERS[state.orderIndex % CUSTOMERS.length];
  const tier = Math.floor(state.orderIndex / CUSTOMERS.length);
  return { ...base, amount: base.amount + tier * 4, coins: base.coins + tier * 18, xp: base.xp + tier * 5 };
}

function cropRate() {
  return state.plots * (1 + state.fieldLevel * 0.2) / 5;
}

function millRate() {
  return (1 + state.millLevel * 0.25) / 6;
}

function simulate(seconds) {
  if (seconds <= 0) return;
  const rootsGrown = cropRate() * seconds;
  const rootsProcessed = Math.min(state.cassava + rootsGrown, millRate() * seconds);
  state.cassava = Math.min(999999, state.cassava + rootsGrown - rootsProcessed);
  state.garri = Math.min(999999, state.garri + rootsProcessed);
}

function formatNumber(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
  if (value >= 10000) return `${(value / 1000).toFixed(1)}k`;
  return Math.floor(value).toLocaleString();
}

function formatStock(value) {
  return value >= 1000 ? formatNumber(value) : value.toFixed(value < 10 && value % 1 !== 0 ? 1 : 0);
}

function xpForNextLevel() {
  return 60 + (state.level - 1) * 45;
}

function levelName() {
  return LEVEL_TITLES[state.level] || "Town Builder";
}

function fieldUpgradeCost() {
  return Math.floor(45 * Math.pow(1.55, state.fieldLevel));
}

function millUpgradeCost() {
  return Math.floor(55 * Math.pow(1.58, state.millLevel));
}

function plotCost() {
  return PLOT_COSTS[state.plots] ?? Infinity;
}

function showToast(message) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
}

function saveFarm() {
  state.lastSaved = Date.now();
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    $("last-saved").textContent = "Saved just now";
  } catch {
    $("last-saved").textContent = "Save unavailable in this browser";
  }
}

function renderFarm() {
  const layout = $("farm-layout");
  const tiles = [];
  for (let index = 0; index < 6; index += 1) {
    if (index < state.plots) {
      tiles.push(`<div class="map-field field-${index + 1}" aria-label="Growing cassava field"><span>🌿</span><span>🌿</span><span>🌿</span><small>CASSAVA</small></div>`);
    } else {
      tiles.push(`<div class="map-plot map-plot-${index + 1}" aria-label="Uncleared field"><span>🌾</span></div>`);
    }
  }
  layout.innerHTML = `${tiles.join("")}
    <div class="map-building grater-building"><span>🏠</span><small>GARRI HOUSE</small><i>⚙️</i></div>
    <div class="map-building market-building"><span>🏪</span><small>MARKET</small><i>🧺</i></div>
    <div class="map-building farmhouse"><span>🏡</span><small>HOME</small></div>
    <span class="map-person person-a">🧑🏾‍🌾</span><span class="map-person person-b">👩🏿‍🌾</span>`;
}

function render() {
  const order = currentOrder();
  const nextXp = xpForNextLevel();
  const orderPercent = Math.min(100, state.garri / order.amount * 100);
  $("coins").textContent = formatNumber(state.coins);
  $("cassava").textContent = formatStock(state.cassava);
  $("garri").textContent = formatStock(state.garri);
  $("plot-count").textContent = `${state.plots} / 6`;
  $("farm-value").textContent = formatNumber(state.totalCoinsEarned + state.plots * 50 + state.fieldLevel * 75 + state.millLevel * 90);
  $("level-badge").textContent = String(state.level);
  $("level-title").textContent = levelName();
  $("xp-progress").style.width = `${Math.min(100, state.xp / nextXp * 100)}%`;
  $("xp-label").textContent = `${formatNumber(state.xp)} / ${formatNumber(nextXp)} XP`;
  $("day-count").textContent = String(Math.max(1, Math.floor((Date.now() - (state.startedAt || state.lastSaved)) / 86400000) + 1));
  $("crop-rate").textContent = `${(cropRate() * 60).toFixed(1)} / min`;
  $("mill-rate").textContent = `${(millRate() * 60).toFixed(1)} / min`;
  $("crop-progress").style.width = `${Math.min(100, (state.cassava % 1) * 100)}%`;
  $("mill-progress").style.width = `${Math.min(100, (state.garri % 1) * 100)}%`;
  $("customer-name").textContent = order.name;
  $("customer-avatar").textContent = order.initial;
  $("order-amount").textContent = `${formatStock(Math.min(state.garri, order.amount))} / ${order.amount} bags`;
  $("order-progress").style.width = `${orderPercent}%`;
  $("order-progress").parentElement.setAttribute("aria-valuenow", String(Math.round(orderPercent)));
  $("order-reward").textContent = formatNumber(order.coins);
  $("order-xp").textContent = String(order.xp);
  $("deliver-order").disabled = state.garri < order.amount;
  $("deliver-order").querySelector("span:first-child").textContent = state.garri >= order.amount ? "Deliver the order" : `Need ${formatStock(Math.max(0, order.amount - state.garri))} more bags`;
  $("order-note").textContent = state.garri >= order.amount
    ? "All packed! Deliver whenever you're ready."
    : `Your workers are packing ${formatStock(Math.max(0, order.amount - state.garri))} more bags for the market.`;

  const fieldCost = fieldUpgradeCost();
  const millCost = millUpgradeCost();
  $("field-upgrade-cost").textContent = `🪙 ${formatNumber(fieldCost)}`;
  $("mill-upgrade-cost").textContent = `🪙 ${formatNumber(millCost)}`;
  $("field-upgrade-level").textContent = `Level ${state.fieldLevel}`;
  $("mill-upgrade-level").textContent = `Level ${state.millLevel}`;
  $("upgrade-fields").disabled = state.coins < fieldCost;
  $("upgrade-mill").disabled = state.coins < millCost;
  $("field-upgrade-detail").textContent = `Grow roots faster · ${(1 + state.fieldLevel * 0.2).toFixed(1)}×`;
  $("mill-upgrade-detail").textContent = `Process garri faster · ${(1 + state.millLevel * 0.25).toFixed(2)}×`;
  $("plot-cost").textContent = Number.isFinite(plotCost()) ? `${formatNumber(plotCost())} coins` : "All fields cleared!";
  $("expand-plot").disabled = !Number.isFinite(plotCost()) || state.coins < plotCost();
  $("expand-plot").querySelector(".expand-arrow").textContent = Number.isFinite(plotCost()) ? "→" : "✓";

  const mood = state.garri >= order.amount
    ? "The market is ready for your delivery!"
    : state.cassava > 1 ? "The workers are making good progress." : "The cassava shoots are just waking up.";
  $("farm-mood").textContent = mood;
  if (renderedPlots !== state.plots) {
    renderFarm();
    renderedPlots = state.plots;
  }
}

function gainExperience(amount) {
  state.xp += amount;
  let levelUps = 0;
  while (state.xp >= xpForNextLevel()) {
    state.xp -= xpForNextLevel();
    state.level += 1;
    levelUps += 1;
  }
  if (levelUps > 0) {
    state.coins += levelUps * 30;
    showToast(`Lovely! Your farm reached level ${state.level} and earned ${levelUps * 30} welcome coins.`);
  }
}

function fulfilOrder() {
  const order = currentOrder();
  if (state.garri < order.amount) return;
  state.garri -= order.amount;
  state.coins += order.coins;
  state.totalCoinsEarned += order.coins;
  state.ordersFilled += 1;
  state.orderIndex += 1;
  gainExperience(order.xp);
  if (state.level < 2) showToast(`Order delivered! +${order.coins} coins and +${order.xp} XP. The town is smiling.`);
  else showToast(`Lovely delivery! +${order.coins} coins and +${order.xp} XP. ${currentOrder().name} is next.`);
  render();
  saveFarm();
}

function buyUpgrade(kind) {
  const cost = kind === "field" ? fieldUpgradeCost() : millUpgradeCost();
  if (state.coins < cost) return;
  state.coins -= cost;
  if (kind === "field") state.fieldLevel += 1;
  else state.millLevel += 1;
  showToast(kind === "field" ? "Better seedlings planted! Your fields are growing faster." : "The grater is humming! Your garri house can process more roots.");
  render();
  saveFarm();
}

function expandFarm() {
  const cost = plotCost();
  if (!Number.isFinite(cost) || state.coins < cost) return;
  state.coins -= cost;
  state.plots += 1;
  showToast(`A new cassava field is ready! Your farm now has ${state.plots} growing plots.`);
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

function applyOfflineProgress() {
  const awaySeconds = Math.min(Math.max(0, (Date.now() - state.lastSaved) / 1000), OFFLINE_LIMIT_SECONDS);
  if (awaySeconds >= 10) {
    const garriBefore = state.garri;
    simulate(awaySeconds);
    const hours = Math.floor(awaySeconds / 3600);
    const minutes = Math.floor((awaySeconds % 3600) / 60);
    const duration = hours > 0 ? `${hours}h ${minutes}m` : `${Math.max(1, minutes)}m`;
    showToast(`While you were away (${duration}), your workers made ${formatStock(state.garri - garriBefore)} garri bags.`);
  }
  state.startedAt = state.startedAt || Date.now();
  render();
  saveFarm();
}

$("deliver-order").addEventListener("click", fulfilOrder);
$("upgrade-fields").addEventListener("click", () => buyUpgrade("field"));
$("upgrade-mill").addEventListener("click", () => buyUpgrade("mill"));
$("expand-plot").addEventListener("click", expandFarm);

applyOfflineProgress();
window.setInterval(tick, 1000);
window.addEventListener("pagehide", saveFarm);
