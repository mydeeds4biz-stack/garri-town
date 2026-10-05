"use strict";

const SAVE_KEY = "garriTownIdleSave";
const OFFLINE_LIMIT_SECONDS = 8 * 60 * 60;
const PLOT_COSTS = [0, 80, 180, 400, 850, 1700];
const LEVEL_TITLES = ["", "New Roots", "Market Helper", "Farm Hand", "Town Trader", "Garri Maker", "Market Favourite", "Farm Keeper", "Town Builder"];
const EQUIPMENT_TIERS = ["Starter", "Improved", "Copper", "Powered", "Town Works", "Master"];
const EQUIPMENT = [
  { id: "field", state: "fieldLevel", name: "Cassava fields", shortName: "FIELDS", icon: "🌱", detail: "Grow roots faster", baseCost: 45, growth: 1.55 },
  { id: "washer", state: "washerLevel", name: "Wash house", shortName: "WASH", icon: "🪣", detail: "Clean roots faster", baseCost: 55, growth: 1.56 },
  { id: "mill", state: "millLevel", name: "Garri grater", shortName: "GRATER", icon: "⚙️", detail: "Grate roots faster", baseCost: 65, growth: 1.58 },
  { id: "press", state: "pressLevel", name: "Ferment & press", shortName: "PRESS", icon: "🗜️", detail: "Press mash faster", baseCost: 75, growth: 1.60 },
  { id: "roaster", state: "roasterLevel", name: "Roasting pan", shortName: "ROASTER", icon: "🔥", detail: "Roast garri faster", baseCost: 85, growth: 1.62 },
  { id: "packer", state: "packerLevel", name: "Packing table", shortName: "PACKING", icon: "🧺", detail: "Pack finished bags faster", baseCost: 95, growth: 1.64 },
];
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
  washedCassava: 0,
  gratedMash: 0,
  pressedMash: 0,
  roastedGarri: 0,
  garri: 0,
  xp: 0,
  level: 1,
  plots: 1,
  fieldLevel: 0,
  washerLevel: 0,
  millLevel: 0,
  pressLevel: 0,
  roasterLevel: 0,
  packerLevel: 0,
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
let equipmentRenderKey = "";
const equipmentActiveUntil = {};
const WORKER_ROUTE = [
  { left: "18%", top: "42%" },
  { left: "30%", top: "50%" },
  { left: "46%", top: "41%" },
  { left: "62%", top: "53%" },
  { left: "75%", top: "43%" },
  { left: "84%", top: "62%" },
];

function $(id) {
  return document.getElementById(id);
}

function showToast(message) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
}

try {
  const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) || "null");
  if (saved && typeof saved === "object") {
    for (const key of Object.keys(defaults)) {
      if (Number.isFinite(saved[key]) && saved[key] >= 0) state[key] = saved[key];
    }
    state.level = Math.max(1, Math.floor(state.level));
    state.plots = Math.max(1, Math.min(6, Math.floor(state.plots)));
    for (const equipment of EQUIPMENT) {
      state[equipment.state] = Math.max(0, Math.min(EQUIPMENT_TIERS.length - 1, Math.floor(state[equipment.state])));
    }
    state.orderIndex = Math.floor(state.orderIndex);
    state.ordersFilled = Math.floor(state.ordersFilled);
    state.lastSaved = Math.min(Date.now(), state.lastSaved);
  }
} catch {
  showToast("Your browser couldn't load a saved farm, so we started a fresh one.");
}

function currentOrder() {
  const base = CUSTOMERS[state.orderIndex % CUSTOMERS.length];
  const tier = Math.floor(state.orderIndex / CUSTOMERS.length);
  return { ...base, amount: base.amount + tier * 4, coins: base.coins + tier * 18, xp: base.xp + tier * 5 };
}

function cropRate() {
  return state.plots * (1 + state.fieldLevel * 0.35) / 1.5;
}

function equipmentRate(equipment) {
  return (1 + state[equipment.state] * 0.3) / 0.8;
}

function simulate(seconds) {
  if (seconds <= 0) return;
  const steps = Math.ceil(seconds);
  const stepDuration = seconds / steps;
  const activeUntil = Date.now() + 1800;
  for (let index = 0; index < steps; index += 1) {
    const rootsGrown = cropRate() * stepDuration;
    state.cassava = Math.min(999999, state.cassava + rootsGrown);
    if (rootsGrown > 0) equipmentActiveUntil.field = activeUntil;
    const washed = Math.min(state.cassava, equipmentRate(EQUIPMENT[1]) * stepDuration);
    state.cassava -= washed;
    state.washedCassava = Math.min(999999, state.washedCassava + washed);
    if (washed > 0) equipmentActiveUntil.washer = activeUntil;
    const grated = Math.min(state.washedCassava, equipmentRate(EQUIPMENT[2]) * stepDuration);
    state.washedCassava -= grated;
    state.gratedMash = Math.min(999999, state.gratedMash + grated);
    if (grated > 0) equipmentActiveUntil.mill = activeUntil;
    const pressed = Math.min(state.gratedMash, equipmentRate(EQUIPMENT[3]) * stepDuration);
    state.gratedMash -= pressed;
    state.pressedMash = Math.min(999999, state.pressedMash + pressed);
    if (pressed > 0) equipmentActiveUntil.press = activeUntil;
    const roasted = Math.min(state.pressedMash, equipmentRate(EQUIPMENT[4]) * stepDuration);
    state.pressedMash -= roasted;
    state.roastedGarri = Math.min(999999, state.roastedGarri + roasted);
    if (roasted > 0) equipmentActiveUntil.roaster = activeUntil;
    const packed = Math.min(state.roastedGarri, equipmentRate(EQUIPMENT[5]) * stepDuration);
    state.roastedGarri -= packed;
    state.garri = Math.min(999999, state.garri + packed);
    if (packed > 0) equipmentActiveUntil.packer = activeUntil;
  }
}

function formatNumber(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
  if (value >= 10000) return `${(value / 1000).toFixed(1)}k`;
  return Math.floor(value).toLocaleString();
}

function formatStock(value) {
  return value >= 1000 ? formatNumber(value) : value.toFixed(value < 10 && value % 1 !== 0 ? 1 : 0);
}

function formatLiveStock(value) {
  return value >= 1000 ? formatNumber(value) : value.toFixed(1);
}

function xpForNextLevel() {
  return 60 + (state.level - 1) * 45;
}

function levelName() {
  return LEVEL_TITLES[state.level] || "Town Builder";
}

function equipmentUpgradeCost(equipment) {
  return Math.floor(equipment.baseCost * Math.pow(equipment.growth, state[equipment.state]));
}

function plotCost() {
  return PLOT_COSTS[state.plots] ?? Infinity;
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
    <div class="farm-equipment" aria-label="Your equipment and its current tiers">${EQUIPMENT.map((equipment) => `
      <div class="farm-equipment-item equipment-${equipment.id}" data-tier="${state[equipment.state]}" title="${equipment.name}: ${EQUIPMENT_TIERS[state[equipment.state]]} tier">
        <span>${equipment.icon}</span><small>${equipment.shortName}</small><i>T${state[equipment.state]}</i><em>0</em>
      </div>`).join("")}
    </div>
    <span class="map-person person-a">🧑🏾‍🌾</span><span class="map-person person-b">👩🏿‍🌾</span>`;
}

function renderEquipment() {
  const renderKey = `${state.coins}|${EQUIPMENT.map((equipment) => state[equipment.state]).join(",")}`;
  if (renderKey === equipmentRenderKey) return;
  $("equipment-list").innerHTML = EQUIPMENT.map((equipment) => {
    const tier = state[equipment.state];
    const cost = equipmentUpgradeCost(equipment);
    const capped = tier >= EQUIPMENT_TIERS.length - 1;
    const multiplier = equipment.id === "field"
      ? `${(1 + tier * 0.2).toFixed(1)}×`
      : `${(1 + tier * 0.25).toFixed(2)}×`;
    const progress = Array.from({ length: EQUIPMENT_TIERS.length }, (_, index) =>
      `<span class="${index <= tier ? "is-active" : ""}"></span>`).join("");
    return `<article class="equipment-card">
      <div class="tier-visual tier-${tier}" aria-label="${EQUIPMENT_TIERS[tier]} tier equipment">${progress}<strong>${equipment.icon}</strong></div>
      <div class="equipment-info"><strong>${equipment.name}</strong><span class="tier-name">${EQUIPMENT_TIERS[tier]} tier <span>· T${tier}</span></span><small>${equipment.detail} · ${multiplier}</small></div>
      <button class="equipment-upgrade" data-upgrade="${equipment.id}" type="button" ${capped || state.coins < cost ? "disabled" : ""} aria-label="${capped ? `${equipment.name} at maximum tier` : `Upgrade ${equipment.name} to ${EQUIPMENT_TIERS[tier + 1]} tier for ${formatNumber(cost)} coins`}">${capped ? "MAX" : `🪙 ${formatNumber(cost)}`}<span>${capped ? "MAX TIER" : "UPGRADE"}</span></button>
    </article>`;
  }).join("");
  equipmentRenderKey = renderKey;
}

function render() {
  const order = currentOrder();
  const nextXp = xpForNextLevel();
  const orderPercent = Math.min(100, state.garri / order.amount * 100);
  $("coins").textContent = formatNumber(state.coins);
  $("cassava").textContent = formatStock(state.cassava);
  $("garri").textContent = formatStock(state.garri);
  $("plot-count").textContent = `${state.plots} / 6`;
  const equipmentValue = EQUIPMENT.reduce((value, equipment) => value + state[equipment.state] * (equipment.baseCost + 30), 0);
  $("farm-value").textContent = formatNumber(state.totalCoinsEarned + state.plots * 50 + equipmentValue);
  $("level-badge").textContent = String(state.level);
  $("level-title").textContent = levelName();
  $("xp-progress").style.width = `${Math.min(100, state.xp / nextXp * 100)}%`;
  $("xp-label").textContent = `${formatNumber(state.xp)} / ${formatNumber(nextXp)} XP`;
  $("day-count").textContent = String(Math.max(1, Math.floor((Date.now() - (state.startedAt || state.lastSaved)) / 86400000) + 1));
  $("crop-rate").textContent = `${(cropRate() * 60).toFixed(1)} / min`;
  $("mill-rate").textContent = `${(equipmentRate(EQUIPMENT[2]) * 60).toFixed(1)} / min`;
  $("packing-rate").textContent = `${(equipmentRate(EQUIPMENT[5]) * 60).toFixed(1)} / min`;
  $("crop-progress").style.width = `${Math.min(100, (state.cassava % 1) * 100)}%`;
  $("mill-progress").style.width = `${Math.min(100, (state.gratedMash % 1) * 100)}%`;
  $("packing-progress").style.width = `${Math.min(100, (state.roastedGarri % 1) * 100)}%`;
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
  renderEquipment();

  $("plot-cost").textContent = Number.isFinite(plotCost()) ? `${formatNumber(plotCost())} coins` : "All fields cleared!";
  $("expand-plot").disabled = !Number.isFinite(plotCost()) || state.coins < plotCost();
  $("expand-plot").querySelector(".expand-arrow").textContent = Number.isFinite(plotCost()) ? "→" : "✓";

  const mood = state.garri >= order.amount
    ? "The market is ready for your delivery!"
    : state.roastedGarri >= 0.1 ? "Fresh garri is being packed for town."
      : state.pressedMash >= 0.1 ? "The roasting pan is glowing."
        : state.gratedMash >= 0.1 ? "The press is squeezing out the cassava."
          : state.washedCassava >= 0.1 ? "The grater is turning roots into mash."
            : state.cassava >= 0.1 ? "The wash house is rinsing fresh roots."
              : "New cassava roots are growing in the field.";
  $("farm-mood").textContent = mood;
  updateFarmActivity();
  if (renderedPlots !== state.plots) {
    renderFarm();
    renderedPlots = state.plots;
  } else {
    EQUIPMENT.forEach((equipment) => {
      const item = document.querySelector(`.equipment-${equipment.id}`);
      if (item) {
        item.dataset.tier = String(state[equipment.state]);
        item.title = `${equipment.name}: ${EQUIPMENT_TIERS[state[equipment.state]]} tier`;
        item.querySelector("i").textContent = `T${state[equipment.state]}`;
      }
    });
  }
}

function updateFarmActivity() {
  const stocks = [state.cassava, state.cassava, state.washedCassava, state.gratedMash, state.pressedMash, state.roastedGarri];
  EQUIPMENT.forEach((equipment, index) => {
    const item = document.querySelector(`.equipment-${equipment.id}`);
    if (!item) return;
    const stock = stocks[index];
    const isWorking = equipmentActiveUntil[equipment.id] > Date.now();
    item.classList.toggle("is-working", isWorking);
    item.classList.toggle("is-waiting", !isWorking);
    item.querySelector("em").textContent = stock >= 0.1 ? formatLiveStock(stock) : isWorking ? "ON" : "0";
    item.setAttribute("aria-label", `${equipment.name}, ${EQUIPMENT_TIERS[state[equipment.state]]} tier, ${formatStock(stock)} ${index === 0 ? "roots growing" : "ready for processing"}`);
  });

  const routeIndex = Math.floor(Date.now() / 1800) % WORKER_ROUTE.length;
  const route = WORKER_ROUTE[routeIndex];
  const secondRoute = WORKER_ROUTE[(routeIndex + 3) % WORKER_ROUTE.length];
  const workerA = document.querySelector(".person-a");
  const workerB = document.querySelector(".person-b");
  if (workerA && workerB) {
    workerA.style.left = route.left;
    workerA.style.top = route.top;
    workerB.style.left = secondRoute.left;
    workerB.style.top = secondRoute.top;
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

function upgradeEquipment(id) {
  const equipment = EQUIPMENT.find((item) => item.id === id);
  if (!equipment) return;
  const tier = state[equipment.state];
  if (tier >= EQUIPMENT_TIERS.length - 1) return;
  const cost = equipmentUpgradeCost(equipment);
  if (state.coins < cost) return;
  state.coins -= cost;
  state[equipment.state] += 1;
  showToast(`${equipment.name} upgraded to ${EQUIPMENT_TIERS[tier + 1]} tier! Its new look is ready on your farm.`);
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
$("equipment-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-upgrade]");
  if (button) upgradeEquipment(button.dataset.upgrade);
});
$("expand-plot").addEventListener("click", expandFarm);

applyOfflineProgress();
window.setInterval(tick, 1000);
window.addEventListener("pagehide", saveFarm);
