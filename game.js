"use strict";

const SAVE_KEY = "garriTownIdleSave";
const ACCOUNT_SAVE_PREFIX = `${SAVE_KEY}:player:`;
const ACCOUNT_HANDLE_PREFIX = `${ACCOUNT_SAVE_PREFIX}handle:`;
const ACCOUNT_OWNER_KEY = `${SAVE_KEY}:owner`;
const CLOUD_SYNC_INTERVAL_MS = 10000;
const LOCAL_SAVE_INTERVAL_SECONDS = 1;
const OFFLINE_LIMIT_SECONDS = 8 * 60 * 60;
const MAX_VALUE = Number.MAX_SAFE_INTEGER;
const GAME_URL = "https://endearing-taffy-0a96b1.netlify.app/";
const GARRI_VARIETIES = [
  { id: "white", name: "White Garri", detail: "Classic fermented cassava flakes", icon: "🥣" },
  { id: "yellow", name: "Yellow Garri", detail: "Palm-oil toasted golden flakes", icon: "🌕" },
  { id: "ijebu", name: "Ijebu Garri", detail: "Fine, tangy fermented flakes", icon: "✨" },
];
const CHAT_MAX_LENGTH = 240;
const CHAT_POLL_INTERVAL_MS = 5000;
const CHAT_EMOJIS = ["🥣", "🎉", "🔥", "😂", "💛", "🇳🇬"];
const CHAT_STICKERS = {
  "garri-bowl": { label: "Fresh bowl", art: "🥣✨" },
  owambe: { label: "Owambe!", art: "🎉💃🏾" },
  danfo: { label: "Danfo rush", art: "🚌💨" },
  "lagos-love": { label: "Lagos love", art: "💛🇳🇬" },
};
const TAP_LEVEL_NAMES = [
  "",
  "Rookie Tapper",
  "Market Regular",
  "Garri Pro",
  "Gele Queen",
  "Owambe Royalty",
  "Lagos Legend",
  "Island Icon",
  "Eko Atlantic Elite",
  "Ikoyi Society",
];
const LUXURY_BOWLS = [
  { name: "Market Bronze", data: "0" },
  { name: "Eko Silver", data: "1" },
  { name: "Lekki Gold", data: "2" },
  { name: "Victoria Island Emerald", data: "3" },
  { name: "Ikoyi Diamond", data: "4" },
  { name: "Lagos Royale", data: "5" },
];
const UPGRADES = [
  { id: "tap", state: "tapUpgradeLevel", name: "Stronger scoops", description: "More packing power per tap", icon: "👆", baseCost: 15, growth: 1.2 },
  { id: "crew", state: "crewLevel", name: "Team huddle", description: "Boost all helper packing", icon: "📣", baseCost: 80, growth: 1.35 },
  { id: "delivery", state: "deliveryLevel", name: "Express delivery network", description: "Faster dispatch boosts every helper's order power", icon: "🚚", baseCost: 180, growth: 1.42 },
];
const HELPER_NAMES = [
  "Gele Queens", "Danfo Dispatchers", "Garri Guild", "Market Runners", "Owambe Hosts",
  "Suya Street Team", "Island Couriers", "Pepper Soup Pros", "Golden Scoop Squad", "Lagos Loaders",
  "Eko Express Crew", "Celebration Captains", "Lekki Luxury Hosts", "Balogun Bargain Team",
  "Yaba Night Owls", "Victoria Island VIPs", "Ikoyi Tastemakers", "Mainland Movers",
  "Palmwine Partners", "Cassava Champions", "Chop-Life Couriers", "Royal Tray Bearers",
  "Festival Fleet", "Atlantic Ambassadors", "Market Megastars", "Owambe Legends",
];
const HELPER_ROLES = [
  "Crew", "Collective", "Dispatch", "Couriers", "Squad", "Associates", "Society", "Fleet",
  "Partners", "Legends", "Champions", "All-Stars", "Executives", "Royal Circle", "Express",
  "Pacesetters", "Specialists", "Superstars", "Trailblazers", "Empire",
];
const HELPER_ICONS = ["👑", "🚌", "🧺", "🏃🏾", "🎉", "🍲", "🚲", "🛵", "🥣", "✨"];
const STORE_NAMES = [
  "Yaba Garri Stall", "Lagos Island Corner Shop", "Balogun Superstore", "Lekki Luxury Mart",
  "Victoria Island Market Hall", "Ikoyi Owambe Emporium", "Eko Atlantic Garri Gallery",
  "Surulere Scoop Stop", "Ikeja Golden Pantry", "Ajah Market Pavilion", "Badagry Coastal Store",
  "Festac Garri Arcade", "Marina Grand Bazaar", "Onikan Heritage Market", "Apapa Port Pantry",
  "Maryland Garri House", "Lagos Mainland Food Hall", "Banana Island Boutique",
  "Alaba Market Depot", "Yankee Garri Lounge", "Palm Grove Pantry", "Oshodi Express Mart",
  "Anthony Village Market", "Ikorodu Garri Junction", "Ebute Metta Trading House",
  "Epe Lagoon Market", "Ikoyi Crescent Flagship", "Victoria Crown Collection",
  "Lagos Royale Food Gallery", "Eko Grand Exchange",
];
const STORE_STYLES = [
  "Street-market stall", "Neighbourhood garri shop", "Busy market superstore", "Premium garri boutique",
  "Island-wide supermarket", "Grand Owambe collection", "Waterfront flagship", "Mainland food hall",
  "Luxury tasting gallery", "Express order depot", "Heritage market pavilion", "Royal garri emporium",
];
const STORE_ICONS = ["🛒", "🏪", "🏬", "🛍️", "🏢", "👑", "🌊", "🏙️", "✨", "🚚", "🏛️", "💎"];
const FEAST_STYLES = [
  "Owambe", "Royal", "Golden", "Island", "Lagoon", "Lagos Royale", "Designer", "Celebration",
  "Eko Atlantic", "Ikoyi", "Lekki", "Victoria Island", "Palmwine", "Heritage", "Midnight",
  "Diamond", "Sunset", "Grand", "Velvet", "Crown",
];
const FEAST_DISHES = [
  "Ofada & Ayamase Bowl", "Asun and Suya Platter", "Goat Pepper Soup & Zobo",
  "Jollof Tower with Golden Dodo", "Atlantic Seafood Table", "Chef's Tasting Menu",
  "Smoky Party Jollof Spread", "Prawns and Plantain Platter", "Suya Royale Sharing Board",
  "Egusi Celebration Banquet", "Grilled Croaker & Coconut Rice", "Peppered Snail Selection",
  "Abula Sunday Feast", "Palmwine Garden Supper", "Designer Rice Tasting Flight",
  "Spiced Goat and Yam Showcase", "Owambe Small-Chops Collection", "Lagoon Catch Experience",
  "Golden Moi-Moi and Dodo", "Six-Course Eko Banquet",
];
const FEAST_ICONS = ["🍛", "🍢", "🍲", "🍚", "🦐", "🍽️", "🥘", "🐟", "✨", "👑"];
const ORDER_NAMES = [
  "First market order",
  "Yaba market rush",
  "Danfo depot delivery",
  "Lekki weekend market",
  "Balogun mega-order",
  "Lagos Island night market",
];
const MARKET_AREAS = [
  { start: 1, name: "Yaba Market", scene: "yaba", landmark: "🚏" },
  { start: 3, name: "Lagos Island", scene: "island", landmark: "⛵" },
  { start: 6, name: "Balogun Market", scene: "balogun", landmark: "🏬" },
  { start: 10, name: "Lekki Phase 1", scene: "lekki", landmark: "🌴" },
  { start: 15, name: "Victoria Island", scene: "victoria", landmark: "🏙️" },
  { start: 25, name: "Ikoyi", scene: "ikoyi", landmark: "🏡" },
];
const MARKET_CIRCUIT_LENGTH = 30;
const LEGACY_HELPER_KEYS = ["auntyCount", "danfoCount", "guildCount", "creatorCount"];
const STORES = [
  { id: "yabaStall", name: "Yaba Garri Stall", area: "Yaba Market", kind: "Street-market stall", icon: "🛒", unlock: 1, cost: 25, income: 0.8 },
  { id: "islandShop", name: "Lagos Island Corner Shop", area: "Lagos Island", kind: "Neighbourhood garri shop", icon: "🏪", unlock: 3, cost: 130, income: 2.5 },
  { id: "balogunStore", name: "Balogun Superstore", area: "Balogun Market", kind: "Busy market superstore", icon: "🏬", unlock: 6, cost: 650, income: 8 },
  { id: "lekkiMart", name: "Lekki Luxury Mart", area: "Lekki Phase 1", kind: "Premium garri boutique", icon: "🛍️", unlock: 10, cost: 3000, income: 28 },
  { id: "viSupermarket", name: "Victoria Island Supermarket", area: "Victoria Island", kind: "Island-wide supermarket", icon: "🏢", unlock: 15, cost: 14000, income: 105 },
  { id: "owambeEmporium", name: "Ikoyi Owambe Emporium", area: "Ikoyi", kind: "Grand opening · Owambe collection", icon: "👑", unlock: 25, cost: 75000, income: 450 },
];
const FEASTS = [
  { id: "ofadaFeast", name: "Ofada & Ayamase Bowl", description: "Rich designer-pepper sauce, ripe plantain", icon: "🍛", cost: 80, unlock: 1, bonus: 0.05 },
  { id: "asunPlatter", name: "Lagos Asun & Suya Platter", description: "Smoky asun, suya spice, grilled onions", icon: "🍢", cost: 350, unlock: 3, bonus: 0.08 },
  { id: "pepperSoup", name: "Goat Pepper Soup & Zobo", description: "Slow-simmered spice with chilled hibiscus", icon: "🍲", cost: 1200, unlock: 6, bonus: 0.12 },
  { id: "owambeJollof", name: "Owambe Jollof Tower", description: "Party jollof, golden dodo, festive garnish", icon: "🍚", cost: 5500, unlock: 10, bonus: 0.18 },
  { id: "islandSeafood", name: "Eko Atlantic Seafood Feast", description: "Fresh prawns, grilled fish, island pepper", icon: "🦐", cost: 24000, unlock: 15, bonus: 0.25 },
  { id: "ikoyiTasting", name: "Ikoyi Chef's Tasting Table", description: "A lavish six-course Lagos supper", icon: "🍽️", cost: 120000, unlock: 25, bonus: 0.35 },
];
const defaults = {
  coins: 0,
  stage: 1,
  orderHp: 10,
  bestStage: 1,
  congosPacked: 0,
  garriByType: { white: 0, yellow: 0, ijebu: 0 },
  unclaimedGarri: { white: 0, yellow: 0, ijebu: 0 },
  garriType: "white",
  totalTaps: 0,
  level: 1,
  xp: 0,
  tapUpgradeLevel: 0,
  crewLevel: 0,
  deliveryLevel: 0,
  helperCounts: [],
  helperEvolutions: [],
  storesOwned: [],
  storeEvolutions: [],
  feastCount: 0,
  auntyCount: 0,
  danfoCount: 0,
  guildCount: 0,
  creatorCount: 0,
  yabaStall: 0,
  islandShop: 0,
  balogunStore: 0,
  lekkiMart: 0,
  viSupermarket: 0,
  owambeEmporium: 0,
  ofadaFeast: 0,
  asunPlatter: 0,
  pepperSoup: 0,
  owambeJollof: 0,
  islandSeafood: 0,
  ikoyiTasting: 0,
  prestige: 0,
  lastSaved: Date.now(),
  startedAt: Date.now(),
};

function createDefaultState() {
  return {
    ...defaults,
    garriByType: { ...defaults.garriByType },
    unclaimedGarri: { ...defaults.unclaimedGarri },
    helperCounts: [],
    helperEvolutions: [],
    storesOwned: [],
    storeEvolutions: [],
    lastSaved: Date.now(),
    startedAt: Date.now(),
  };
}

let state = createDefaultState();
let lastTick = Date.now();
let saveCounter = 0;
let toastTimeout;
let townRendered = false;
let helperAnimationKey = "";
let supabaseClient = null;
let playerProfile = null;
let accountLoadingId = "";
let garriSyncTimer = 0;
let garriSyncInProgress = false;
let gameSaveSyncTimer = 0;
let gameSaveSyncInProgress = false;
let gameSaveSyncRequested = false;
let gameStateRevision = 0;
let cloudSavedRevision = 0;
let cloudGameSaveReady = false;
let sceneJumpTimeout = 0;
let sceneRushTimeout = 0;
let currentSceneSignature = "";
let chatPollTimer = 0;
let chatPollInProgress = false;
let chatSending = false;
let chatGuestId = "";
let chatLastMessageIds = [];

function $(id) {
  return document.getElementById(id);
}

function clamp(value, max = MAX_VALUE) {
  return Math.min(max, Math.max(0, value));
}

function safeAdd(left, right) {
  return Math.min(MAX_VALUE, left + right);
}

function roundGarri(value) {
  return Math.min(MAX_VALUE, Math.round(value * 100) / 100);
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "∞";
  if (value < 1000) return Number.isInteger(value)
    ? value.toLocaleString()
    : value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const units = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  const [size, suffix] = units.find(([limit]) => value >= limit);
  if (!size) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return `${(value / size).toFixed(value / size >= 100 ? 0 : 1)}${suffix}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function scaledValue(base, growth, level) {
  return Math.min(MAX_VALUE, base * Math.pow(growth, level));
}

function orderMaxHp(stage = state.stage) {
  return Math.max(1, scaledValue(10, 1.32, stage - 1));
}

function orderReward(stage = state.stage) {
  const legacyBonus = FEASTS.reduce((bonus, feast) => bonus + state[feast.id] * feast.bonus, 0);
  const generatedFeasts = Math.max(0, state.feastCount - FEASTS.length);
  const feastBonus = generatedFeasts * 0.05 +
    0.005 * generatedFeasts * (FEASTS.length + (generatedFeasts - 1) / 2);
  const feastMultiplier = 1 + legacyBonus + feastBonus;
  return Math.min(MAX_VALUE, Math.max(1, scaledValue(10, 1.2, stage - 1) * feastMultiplier));
}

function orderExperience(stage = state.stage) {
  return 10 + Math.floor((stage - 1) * 1.5);
}

function xpForNextLevel() {
  return 20 + (state.level - 1) * 15;
}

function tapLevelName() {
  return TAP_LEVEL_NAMES[state.level] || "Lagos Market Mogul";
}

function luxuryBowlTier() {
  return Math.min(LUXURY_BOWLS.length - 1, Math.floor((state.level - 1) / 5));
}

function currentMarketArea(stage = state.stage) {
  const circuit = Math.floor((Math.max(1, Math.floor(stage)) - 1) / MARKET_CIRCUIT_LENGTH);
  const circuitStage = ((Math.max(1, Math.floor(stage)) - 1) % MARKET_CIRCUIT_LENGTH) + 1;
  const area = MARKET_AREAS.filter((entry) => circuitStage >= entry.start).at(-1);
  return {
    ...area,
    circuit,
    displayName: circuit > 0 ? `${area.name} · Circuit ${formatNumber(circuit + 1)}` : area.name,
  };
}

function tapPower() {
  return Math.min(MAX_VALUE, (1 + (state.level - 1) * 0.25) *
    (1 + state.tapUpgradeLevel * 2) * (1 + state.prestige * 0.25));
}

function helperDamagePerSecond() {
  const crewMultiplier = 1 + state.crewLevel * 0.5;
  const deliveryMultiplier = Math.pow(1.25, state.deliveryLevel);
  const prestigeMultiplier = 1 + state.prestige * 0.25;
  return Math.min(MAX_VALUE, state.helperCounts.reduce((total, count, tier) =>
    total + count * helperPower(tier) * Math.pow(2, state.helperEvolutions[tier] || 0) *
      crewMultiplier * deliveryMultiplier * prestigeMultiplier, 0));
}

function storeIncomePerSecond() {
  return Math.min(MAX_VALUE, state.storesOwned.reduce((income, owned, tier) =>
    income + owned * storeForTier(tier).income * Math.pow(2, state.storeEvolutions[tier] || 0), 0));
}

function helperCost(helper) {
  return scaledValue(helper.baseCost, helper.costGrowth, state.helperCounts[helper.tier] || 0);
}

function helperEvolutionCost(helper) {
  return scaledValue(helper.baseCost * 10, 4, state.helperEvolutions[helper.tier] || 0);
}

function storeCost(store) {
  return scaledValue(store.cost, 1.15, state.storesOwned[store.tier] || 0);
}

function storeEvolutionCost(store) {
  return scaledValue(store.cost, 2.5, (state.storeEvolutions[store.tier] || 0) + 1);
}

function helperEvolutionRank(level) {
  if (level === 0) return "Market crew";
  if (level === 1) return "Elite crew";
  if (level === 2) return "Royal crew";
  return level === 3 ? "Legendary crew" : `Legendary · Evo ${formatNumber(level)}`;
}

function storeEvolutionRank(level) {
  if (level === 0) return "Local";
  if (level === 1) return "Signature";
  if (level === 2) return "Flagship";
  return level === 3 ? "Royal" : `Royal · Evo ${formatNumber(level)}`;
}

function upgradeCost(upgrade) {
  return scaledValue(upgrade.baseCost, upgrade.growth, state[upgrade.state]);
}

function helperForTier(tier) {
  const name = HELPER_NAMES[tier % HELPER_NAMES.length];
  const role = HELPER_ROLES[Math.floor(tier / HELPER_NAMES.length) % HELPER_ROLES.length];
  const cycle = Math.floor(tier / (HELPER_NAMES.length * HELPER_ROLES.length));
  return {
    tier,
    name: `${name} ${role}${cycle ? ` ${cycle + 1}` : ""}`,
    description: `Packs ${formatNumber(helperPower(tier))} order power every second`,
    icon: HELPER_ICONS[tier % HELPER_ICONS.length],
    baseCost: tier < 4 ? [10, 120, 650, 3200][tier] : scaledValue(3200, 2.7, tier - 3),
    costGrowth: 1.15,
    unlock: 1 + tier * 5,
  };
}

function helperPower(tier) {
  return tier < 4 ? [1, 6, 32, 150][tier] : scaledValue(150, 2.5, tier - 3);
}

function storeForTier(tier) {
  const legacy = STORES[tier];
  if (legacy) return {
    ...legacy,
    tier,
    unlock: legacy.unlock,
    cost: legacy.cost,
    income: legacy.income,
  };
  const cycle = Math.floor(tier / STORE_NAMES.length);
  return {
    tier,
    name: `${STORE_NAMES[tier % STORE_NAMES.length]}${cycle ? ` · Collection ${cycle + 1}` : ""}`,
    area: currentMarketArea(1 + tier * 8).displayName,
    kind: STORE_STYLES[tier % STORE_STYLES.length],
    icon: STORE_ICONS[tier % STORE_ICONS.length],
    unlock: 25 + (tier - STORES.length + 1) * 8,
    cost: scaledValue(75000, 3.2, tier - STORES.length),
    income: scaledValue(450, 2.4, tier - STORES.length),
  };
}

function feastForTier(tier) {
  const style = FEAST_STYLES[tier % FEAST_STYLES.length];
  const dish = FEAST_DISHES[Math.floor(tier / FEAST_STYLES.length) % FEAST_DISHES.length];
  const cycle = Math.floor(tier / (FEAST_STYLES.length * FEAST_DISHES.length));
  const legacy = FEASTS[tier];
  return {
    tier,
    id: legacy ? legacy.id : `feast-${tier}`,
    name: legacy ? legacy.name : `${style} ${dish}${cycle ? ` · Reserve ${cycle + 1}` : ""}`,
    description: legacy ? legacy.description : `A signature Lagos luxury dining experience · +${Math.round((0.05 + tier * 0.005) * 100)}% order rewards`,
    icon: legacy ? legacy.icon : FEAST_ICONS[tier % FEAST_ICONS.length],
    cost: legacy ? legacy.cost : scaledValue(120000, 2.8, tier - FEASTS.length),
    unlock: legacy ? legacy.unlock : 25 + (tier - FEASTS.length + 1) * 6,
    bonus: legacy ? legacy.bonus : 0.05 + tier * 0.005,
  };
}

function showToast(message) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
}

function loadFarmSnapshot(saved) {
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return false;
  state = createDefaultState();

  for (const key of Object.keys(defaults)) {
    if (key === "garriByType" || key === "unclaimedGarri" || key === "garriType" ||
        key === "helperCounts" || key === "helperEvolutions" ||
        key === "storesOwned" || key === "storeEvolutions") continue;
    if (Number.isFinite(saved[key]) && saved[key] >= 0) state[key] = Math.min(saved[key], MAX_VALUE);
  }
  state.helperCounts = Array.isArray(saved.helperCounts)
    ? saved.helperCounts.slice(0, 10000).map((count) =>
      Number.isFinite(count) && count >= 0 ? Math.min(Math.floor(count), MAX_VALUE) : 0)
    : LEGACY_HELPER_KEYS.map((key) => Math.min(Math.floor(state[key]), MAX_VALUE));
  state.helperEvolutions = Array.isArray(saved.helperEvolutions)
    ? saved.helperEvolutions.slice(0, 10000).map((level) =>
      Number.isFinite(level) && level >= 0 ? Math.min(Math.floor(level), MAX_VALUE) : 0)
    : [];
  state.storesOwned = Array.isArray(saved.storesOwned)
    ? saved.storesOwned.slice(0, 10000).map((owned) =>
      Number.isFinite(owned) && owned >= 0
        ? Math.min(Math.floor(owned), MAX_VALUE)
        : owned === true ? 1 : 0)
    : STORES.map((store) => state[store.id] > 0);
  state.storeEvolutions = Array.isArray(saved.storeEvolutions)
    ? saved.storeEvolutions.slice(0, 10000).map((level) =>
      Number.isFinite(level) && level >= 0 ? Math.min(Math.floor(level), MAX_VALUE) : 0)
    : [];
  if (!Array.isArray(saved.helperCounts)) {
    LEGACY_HELPER_KEYS.forEach((key) => { state[key] = 0; });
  }
  if (!Array.isArray(saved.storesOwned)) {
    STORES.forEach((store) => { state[store.id] = 0; });
  }
  if (!Number.isFinite(saved.feastCount)) {
    state.feastCount = 0;
    while (state.feastCount < FEASTS.length && state[FEASTS[state.feastCount].id] > 0) {
      state.feastCount += 1;
    }
  }
  state.feastCount = Math.min(Math.floor(state.feastCount), 10000);
  for (const variety of GARRI_VARIETIES) {
    const savedBalance = saved.garriByType?.[variety.id];
    const legacyBalance = variety.id === "white" ? saved.simulatedGarri : 0;
    state.garriByType[variety.id] = Number.isFinite(savedBalance) && savedBalance >= 0
      ? Math.min(savedBalance, MAX_VALUE)
      : Number.isFinite(legacyBalance) && legacyBalance >= 0
        ? Math.min(legacyBalance, MAX_VALUE)
        : 0;
    const savedUnclaimed = saved.unclaimedGarri?.[variety.id];
    state.unclaimedGarri[variety.id] = Number.isFinite(savedUnclaimed) && savedUnclaimed >= 0
      ? Math.min(savedUnclaimed, MAX_VALUE)
      : variety.id === "white" && !saved.garriByType
        ? Number.isFinite(legacyBalance) && legacyBalance >= 0
          ? Math.min(legacyBalance, MAX_VALUE)
          : 0
        : 0;
  }
  if (GARRI_VARIETIES.some((variety) => variety.id === saved.garriType)) {
    state.garriType = saved.garriType;
  }
  state.stage = Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(state.stage)));
  state.bestStage = Math.max(state.stage, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(state.bestStage)));
  state.congosPacked = Math.floor(state.congosPacked);
  state.level = Math.max(1, Math.min(1e6, Math.floor(state.level)));
  state.prestige = Math.floor(state.prestige);

  for (const key of ["tapUpgradeLevel", "crewLevel", "deliveryLevel", ...LEGACY_HELPER_KEYS]) {
    state[key] = Math.min(1e6, Math.floor(state[key]));
  }

  if (!Object.prototype.hasOwnProperty.call(saved, "stage")) {
    state.stage = Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, Math.floor((saved.orderIndex || 0) + 1)));
    state.bestStage = state.stage;
    state.congosPacked = Math.max(state.congosPacked, Math.floor(saved.ordersFilled || 0), state.stage - 1);
    showToast("Your old Garri Town coins are ready. Welcome to the market!");
  }

  state.orderHp = Number.isFinite(saved.orderHp) && saved.orderHp > 0
    ? Math.min(saved.orderHp, orderMaxHp())
    : orderMaxHp();
  state.lastSaved = Number.isFinite(saved.lastSaved) ? Math.min(Date.now(), saved.lastSaved) : Date.now();
  state.startedAt = Number.isFinite(saved.startedAt) && saved.startedAt > 0 ? saved.startedAt : Date.now();
  return true;
}

function loadFarm() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) || "null");
    if (saved) loadFarmSnapshot(saved);
  } catch {
    showToast("Your browser couldn't load the saved game, so a fresh market is ready.");
  }
}

function schedulePlayerGameSave() {
  if (!supabaseClient || !playerProfile || !cloudGameSaveReady || !navigator.onLine ||
      gameStateRevision <= cloudSavedRevision || gameSaveSyncTimer) return;
  gameSaveSyncTimer = window.setTimeout(() => {
    gameSaveSyncTimer = 0;
    syncPlayerGameSave().catch((error) => {
      console.error("Could not sync player game progress.", error);
      setAccountStatus(`Cloud save failed. Your game is saved on this device; we'll retry. ${error.message}`, true);
    });
  }, CLOUD_SYNC_INTERVAL_MS);
}

async function syncPlayerGameSave() {
  if (!supabaseClient || !playerProfile || !cloudGameSaveReady || !navigator.onLine) return;
  if (gameSaveSyncInProgress) {
    gameSaveSyncRequested = true;
    return;
  }
  gameSaveSyncInProgress = true;
  const userId = playerProfile.id;
  const revision = gameStateRevision;
  try {
    const saveData = { ...state };
    delete saveData.garriByType;
    delete saveData.unclaimedGarri;
    const { error } = await supabaseClient.from("player_game_saves").upsert({
      user_id: userId,
      save_data: saveData,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) throw error;
    cloudSavedRevision = Math.max(cloudSavedRevision, revision);
    const { error: leaderboardError } = await supabaseClient.rpc("publish_player_leaderboard", {
      p_best_order: saveData.bestStage,
      p_tap_level: saveData.level,
      p_market_legacy: saveData.prestige,
      p_congos_packed: saveData.congosPacked,
    });
    if (leaderboardError) {
      console.error("Could not publish player leaderboard stats.", leaderboardError);
      setAccountStatus(
        `Cloud game save synced, but leaderboard publishing failed: ${leaderboardError.message}. Run the updated leaderboard migration in supabase-schema.sql.`,
        true
      );
    }
  } finally {
    gameSaveSyncInProgress = false;
    if (gameSaveSyncRequested || (playerProfile?.id === userId && gameStateRevision > cloudSavedRevision)) {
      gameSaveSyncRequested = false;
      schedulePlayerGameSave();
    }
  }
}

async function refreshLeaderboard() {
  const status = $("leaderboard-status");
  const refreshButton = $("leaderboard-refresh");
  status.textContent = "Loading player rankings…";
  refreshButton.disabled = true;
  try {
    if (!supabaseClient) {
      status.textContent = "Connect the player account service to load the leaderboard.";
      $("leaderboard-rows").innerHTML = '<tr><td colspan="5">Leaderboard unavailable.</td></tr>';
      return;
    }
    const { data, error } = await supabaseClient
      .from("player_leaderboard")
      .select("handle,best_order,tap_level,market_legacy,congos_packed")
      .order("best_order", { ascending: false })
      .order("congos_packed", { ascending: false })
      .limit(10);
    if (error) throw error;
    if (!data.length) {
      status.textContent = "No ranked players yet. Sign in and pack orders to claim the first spot!";
      $("leaderboard-rows").innerHTML = '<tr><td colspan="5">The leaderboard is ready for its first player.</td></tr>';
      return;
    }
    $("leaderboard-rows").innerHTML = data.map((player, index) => {
      const handle = /^[a-z0-9_]{3,20}$/.test(player.handle) ? player.handle : "Market player";
      const stat = (value) => Number.isFinite(Number(value)) && Number(value) >= 0
        ? formatNumber(Number(value))
        : "0";
      return `<tr><td>${index + 1}</td><td>@${escapeHtml(handle)}</td><td>${stat(player.best_order)}</td><td>${stat(player.tap_level)}</td><td>${stat(player.market_legacy)}</td></tr>`;
    }).join("");
    status.textContent = `Top ${data.length} market players · ranked by highest order`;
  } catch (error) {
    console.error("Could not load the player leaderboard.", error);
    status.textContent = `Leaderboard couldn't load: ${error.message}. Check the leaderboard SQL setup.`;
    $("leaderboard-rows").innerHTML = '<tr><td colspan="5">Rankings could not be loaded.</td></tr>';
  } finally {
    refreshButton.disabled = false;
  }
}

function saveFarm() {
  if (accountLoadingId) return;
  state.lastSaved = Date.now();
  gameStateRevision += 1;
  try {
    const saveKey = playerProfile && cloudGameSaveReady
      ? `${ACCOUNT_SAVE_PREFIX}${playerProfile.id}`
      : SAVE_KEY;
    window.localStorage.setItem(saveKey, JSON.stringify(state));
    if (playerProfile && cloudGameSaveReady) {
      window.localStorage.setItem(ACCOUNT_OWNER_KEY, playerProfile.id);
    }
  } catch {
    showToast("Save unavailable in this browser. Your current progress may not be kept.");
  }
  if (playerProfile && cloudGameSaveReady) schedulePlayerGameSave();
}

function gainExperience(amount) {
  state.xp = safeAdd(state.xp, amount);
  let levelsGained = 0;
  while (state.xp >= xpForNextLevel() && state.level < 1e6) {
    state.xp -= xpForNextLevel();
    state.level += 1;
    levelsGained += 1;
  }
  if (levelsGained > 0) {
    showToast(`Tap Level ${state.level}! Your taps now pack orders ${formatNumber((1 + (state.level - 1) * 0.25) / (1 + (state.level - 2) * 0.25))}× harder.`);
  }
}

function processDamage(damage) {
  let remainingDamage = clamp(damage);
  let completed = 0;
  let earnedXp = 0;

  while (remainingDamage >= state.orderHp) {
    remainingDamage -= state.orderHp;
    state.coins = safeAdd(state.coins, orderReward());
    state.congosPacked += 1;
    earnedXp = safeAdd(earnedXp, orderExperience());
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
  if (earnedXp > 0) gainExperience(earnedXp);
  return completed;
}

function tapMarket() {
  const damage = tapPower();
  const completed = processDamage(damage);
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(completed > 0 ? [18, 28, 24] : 10);
  }
  const currentGarriTotal = GARRI_VARIETIES.reduce((sum, variety) =>
    safeAdd(sum, state.garriByType[variety.id]), 0);
  const garriEarned = Math.min(roundGarri(damage), MAX_VALUE - currentGarriTotal);
  if (garriEarned > 0) {
    state.garriByType[state.garriType] = safeAdd(state.garriByType[state.garriType], garriEarned);
    state.unclaimedGarri[state.garriType] = safeAdd(state.unclaimedGarri[state.garriType], garriEarned);
  }
  state.totalTaps = safeAdd(state.totalTaps, 1);
  animateMarketMascot(completed > 0);
  const target = $("tap-target");
  target.classList.remove("is-tapping");
  void target.offsetWidth;
  target.classList.add("is-tapping");
  window.setTimeout(() => target.classList.remove("is-tapping"), 240);

  for (let index = 0; index < 5; index += 1) {
    const grain = document.createElement("span");
    grain.className = "garri-sprinkle";
    grain.style.left = `${37 + Math.random() * 26}%`;
    grain.style.setProperty("--grain-drift", `${Math.round((Math.random() - 0.5) * 90)}px`);
    target.append(grain);
    window.setTimeout(() => grain.remove(), 650);
  }

  const number = document.createElement("span");
  number.className = "floating-number";
  number.textContent = `+${formatNumber(damage)} ${completed ? "📦" : "🥣"}`;
  $("floating-numbers").append(number);
  window.setTimeout(() => number.remove(), 900);
  render();
  saveFarm();
  if (playerProfile) scheduleGarriSync();
}

function garriAmountText(value) {
  return roundGarri(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function garriContainerLabel(value) {
  return roundGarri(value) === 1 ? "Congo" : "Congos";
}

function animateMarketMascot(celebrate) {
  const mascot = $("market-mascot");
  mascot.classList.remove("is-rushing", "is-jumping");
  window.clearTimeout(sceneJumpTimeout);
  window.clearTimeout(sceneRushTimeout);
  if (celebrate) {
    void mascot.offsetWidth;
    mascot.classList.add("is-jumping");
    sceneJumpTimeout = window.setTimeout(() => mascot.classList.remove("is-jumping"), 850);
  } else {
    mascot.classList.add("is-rushing");
    sceneRushTimeout = window.setTimeout(() => mascot.classList.remove("is-rushing"), 520);
  }
}

function renderGarriWallet() {
  const total = GARRI_VARIETIES.reduce((sum, variety) => safeAdd(sum, state.garriByType[variety.id]), 0);
  $("garri-total").textContent = garriAmountText(total);
  $("garri-varieties").innerHTML = GARRI_VARIETIES.map((variety) => `
    <button class="garri-variety${state.garriType === variety.id ? " is-selected" : ""}" data-variety="${variety.id}" type="button" aria-pressed="${state.garriType === variety.id}">
      <span class="variety-icon" aria-hidden="true">${variety.icon}</span>
      <span class="variety-copy"><strong>${variety.name}</strong><small>${variety.detail}</small></span>
      <span class="variety-stock">${garriAmountText(state.garriByType[variety.id])}<small>${garriContainerLabel(state.garriByType[variety.id])}</small></span>
    </button>`).join("");
}

function setAccountStatus(message, isError = false) {
  const status = $("account-status");
  status.textContent = message;
  status.classList.toggle("is-error", isError);
}

function updateAccountUI() {
  const signedIn = Boolean(playerProfile);
  $("account-icons").hidden = signedIn;
  $("account-transfer").hidden = !signedIn;
  $("account-handle").textContent = signedIn ? `@${playerProfile.handle}` : "Local play";
}

function restoreGuestGame() {
  if (gameSaveSyncTimer) {
    window.clearTimeout(gameSaveSyncTimer);
    gameSaveSyncTimer = 0;
  }
  playerProfile = null;
  cloudGameSaveReady = false;
  accountLoadingId = "";
  state = createDefaultState();
  loadFarm();
  lastTick = Date.now();
  render();
  updateAccountUI();
}

function openAccountDialog(action) {
  const showingAccount = action === "account";
  const choosingAction = action === "menu" || showingAccount;
  const signingUp = action === "sign-up";
  $("account-dialog-title").textContent = choosingAction
    ? showingAccount ? "Your player account" : "Play together"
    : signingUp ? "Create your player account" : "Sign in to your account";
  $("account-icons").hidden = !choosingAction;
  $("account-form").hidden = choosingAction;
  $("account-transfer").hidden = !showingAccount;
  document.querySelector(".account-handle-input").hidden = !signingUp;
  $("account-password").autocomplete = signingUp ? "new-password" : "current-password";
  $("account-dialog").showModal();
  if (!choosingAction) $(signingUp ? "account-player-handle" : "account-email").focus();
}

async function refreshCloudBalances() {
  const { data, error } = await supabaseClient
    .from("player_garri")
    .select("garri_type,balance")
    .eq("user_id", playerProfile.id);
  if (error) throw error;
  for (const variety of GARRI_VARIETIES) {
    const balance = data.find((entry) => entry.garri_type === variety.id);
    state.garriByType[variety.id] = balance ? Number(balance.balance) : 0;
  }
}

async function loadPlayerAccount(user) {
  if (!supabaseClient || (playerProfile && playerProfile.id === user.id && cloudGameSaveReady) ||
      accountLoadingId === user.id) return;
  if (gameSaveSyncTimer) {
    window.clearTimeout(gameSaveSyncTimer);
    gameSaveSyncTimer = 0;
  }
  cloudGameSaveReady = false;
  accountLoadingId = user.id;
  $("tap-target").disabled = true;
  try {
    if (!navigator.onLine) {
      const cachedHandle = window.localStorage.getItem(`${ACCOUNT_HANDLE_PREFIX}${user.id}`);
      const localSave = window.localStorage.getItem(`${ACCOUNT_SAVE_PREFIX}${user.id}`);
      if (!cachedHandle) throw new Error("Reconnect to load this account's profile. Local guest play remains available.");
      if (localSave && !loadFarmSnapshot(JSON.parse(localSave))) {
        throw new Error("Your device save is not a valid game save.");
      }
      if (!localSave) state = createDefaultState();
      playerProfile = { id: user.id, handle: cachedHandle };
      cloudGameSaveReady = true;
      accountLoadingId = "";
      lastTick = Date.now();
      updateAccountUI();
      render();
      saveFarm();
      setAccountStatus("Offline. Progress is saving on this device and will sync when you reconnect.");
      return;
    }
    setAccountStatus("Loading your player profile and cloud save…");
    const { data: profile, error } = await supabaseClient
      .from("player_profiles")
      .select("user_id,handle")
      .eq("user_id", user.id)
      .single();
    if (error) throw error;

    const { data: cloudSave, error: saveError } = await supabaseClient
      .from("player_game_saves")
      .select("save_data")
      .eq("user_id", user.id)
      .maybeSingle();
    if (saveError) throw saveError;

    const localSave = window.localStorage.getItem(`${ACCOUNT_SAVE_PREFIX}${user.id}`);
    const localOwner = window.localStorage.getItem(ACCOUNT_OWNER_KEY);
    let localSnapshot = null;
    if (localSave) {
      try {
        localSnapshot = JSON.parse(localSave);
      } catch (error) {
        console.warn("Ignoring an unreadable local account save and trying the cloud save.", error);
      }
    }
    const cloudSnapshot = cloudSave?.save_data || null;
    const localSavedAt = Number.isFinite(localSnapshot?.lastSaved) ? localSnapshot.lastSaved : 0;
    const cloudSavedAt = Number.isFinite(cloudSnapshot?.lastSaved) ? cloudSnapshot.lastSaved : 0;
    const useLocalSave = localSnapshot && (!cloudSnapshot || localSavedAt > cloudSavedAt);
    if (useLocalSave) {
      if (!loadFarmSnapshot(localSnapshot)) {
        throw new Error("Your device save is not a valid game save.");
      }
    } else if (cloudSnapshot) {
      if (!loadFarmSnapshot(cloudSnapshot)) {
        throw new Error("Your cloud save is not a valid game save.");
      }
      for (const variety of GARRI_VARIETIES) {
        const pending = localSnapshot?.unclaimedGarri?.[variety.id];
        if (Number.isFinite(pending) && pending > 0) {
          state.unclaimedGarri[variety.id] = safeAdd(state.unclaimedGarri[variety.id], pending);
        }
      }
    } else if (localOwner && localOwner !== user.id) {
      state = createDefaultState();
    }

    playerProfile = { id: profile.user_id, handle: profile.handle };
    updateAccountUI();
    window.localStorage.setItem(`${ACCOUNT_HANDLE_PREFIX}${user.id}`, profile.handle);
    for (const variety of GARRI_VARIETIES) {
      const amount = roundGarri(state.unclaimedGarri[variety.id]);
      if (amount <= 0) continue;
      const claim = await supabaseClient.rpc("claim_garri", {
        p_garri_type: variety.id,
        p_amount: amount.toFixed(2),
      });
      if (claim.error) throw claim.error;
      state.unclaimedGarri[variety.id] = 0;
    }
    await refreshCloudBalances();
    render();
    cloudGameSaveReady = true;
    accountLoadingId = "";
    window.localStorage.setItem(ACCOUNT_OWNER_KEY, user.id);
    saveFarm();
    setAccountStatus("Signed in. Your game progress and Garri are synced to this account.");
    if ($("account-dialog").open) $("account-dialog").close();
  } catch (error) {
    console.error("Could not load or sync the player account and game save.", error);
    restoreGuestGame();
    setAccountStatus(`Couldn't load your account: ${error.message}`, true);
  } finally {
    accountLoadingId = "";
    $("tap-target").disabled = false;
  }
}

async function syncPendingGarri() {
  if (!supabaseClient || !playerProfile || !navigator.onLine || garriSyncInProgress) return false;
  garriSyncInProgress = true;
  try {
    for (const variety of GARRI_VARIETIES) {
      const amount = roundGarri(state.unclaimedGarri[variety.id]);
      if (amount <= 0) continue;
      const { error } = await supabaseClient.rpc("claim_garri", {
        p_garri_type: variety.id,
        p_amount: amount.toFixed(2),
      });
      if (error) throw error;
      state.unclaimedGarri[variety.id] = Math.max(
        0,
        roundGarri(state.unclaimedGarri[variety.id] - amount)
      );
    }
    await refreshCloudBalances();
    saveFarm();
    render();
    return true;
  } finally {
    garriSyncInProgress = false;
  }
}

function scheduleGarriSync() {
  if (garriSyncTimer || !navigator.onLine) return;
  garriSyncTimer = window.setTimeout(() => {
    garriSyncTimer = 0;
    syncPendingGarri().catch((error) => {
      console.error("Could not sync earned Garri.", error);
      setAccountStatus(`Garri sync failed. Your local progress is saved; retrying soon. ${error.message}`, true);
    });
  }, CLOUD_SYNC_INTERVAL_MS);
}

async function submitAccount(action) {
  if (!supabaseClient) {
    setAccountStatus("Player accounts are not configured yet. Your local game still works.", true);
    return;
  }
  if (!$("account-form").reportValidity()) return;
  const email = $("account-email").value.trim();
  const password = $("account-password").value;
  document.querySelector(".account-handle-input").hidden = action !== "sign-up";
  $("account-password").autocomplete = action === "sign-up" ? "new-password" : "current-password";
  try {
    let result;
    if (action === "sign-up") {
      const handle = $("account-player-handle").value.trim().toLowerCase();
      if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
        setAccountStatus("Choose a 3–20 character handle using letters, numbers, or underscores.", true);
        return;
      }
      result = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { handle } },
      });
    } else {
      result = await supabaseClient.auth.signInWithPassword({ email, password });
    }
    if (result.error) throw result.error;
    if (result.data.session) {
      await loadPlayerAccount(result.data.user);
    } else {
      setAccountStatus("Check your email to confirm your new account, then sign in.");
    }
  } catch (error) {
    console.error(`Player ${action} failed.`, error);
    const isSignupDatabaseError = action === "sign-up" &&
      /database error saving new user/i.test(error.message || "");
    const message = isSignupDatabaseError
      ? "That player handle may already be taken. Choose a different handle and try again."
      : error.message;
    setAccountStatus(`Couldn't ${action === "sign-up" ? "create your account" : "sign in"}: ${message}`, true);
  }
}

async function sendGarri() {
  if (!playerProfile || !supabaseClient) {
    setAccountStatus("Sign in to send Garri to another player.", true);
    return;
  }
  const handle = $("transfer-recipient").value.trim().replace(/^@/, "").toLowerCase();
  const type = $("transfer-variety").value;
  const amount = Number($("transfer-amount").value);
  if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
    setAccountStatus("Enter the recipient's player handle.", true);
    return;
  }
  if (!GARRI_VARIETIES.some((variety) => variety.id === type) ||
      !Number.isFinite(amount) || amount <= 0 || roundGarri(amount) !== amount) {
    setAccountStatus("Enter an amount greater than zero with no more than two decimal places.", true);
    return;
  }
  try {
    await syncPendingGarri();
    if (amount > state.garriByType[type]) {
      setAccountStatus(`Not enough ${GARRI_VARIETIES.find((variety) => variety.id === type).name} Congos in your account.`, true);
      return;
    }
    const { data, error } = await supabaseClient.rpc("transfer_garri", {
      p_handle: handle,
      p_garri_type: type,
      p_amount: amount.toFixed(2),
    });
    if (error) throw error;
    state.garriByType[type] = Number(data.sender_balance);
    $("transfer-recipient").value = "";
    saveFarm();
    render();
    setAccountStatus(`Sent ${garriAmountText(amount)} ${garriContainerLabel(amount)} of ${GARRI_VARIETIES.find((variety) => variety.id === type).name} to @${data.recipient_handle}.`);
  } catch (error) {
    console.error("Garri transfer failed.", error);
    setAccountStatus(`Transfer failed: ${error.message}`, true);
  }
}

function chatStatus(message, isError = false) {
  const status = $("chat-status");
  status.textContent = message;
  status.classList.toggle("is-error", isError);
}

function createChatGuestId() {
  try {
    const storedId = window.localStorage.getItem("tapGarriChatGuestId");
    if (storedId && /^[0-9a-f-]{36}$/i.test(storedId)) return storedId;
    const id = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
        const random = Math.floor(Math.random() * 16);
        return (character === "x" ? random : (random & 3) | 8).toString(16);
      });
    window.localStorage.setItem("tapGarriChatGuestId", id);
    return id;
  } catch (error) {
    console.error("Could not save the market chat guest identity.", error);
    return typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
        const random = Math.floor(Math.random() * 16);
        return (character === "x" ? random : (random & 3) | 8).toString(16);
      });
  }
}

function formatChatName() {
  return playerProfile ? `@${playerProfile.handle}` : `Guest-${chatGuestId.replaceAll("-", "").slice(0, 6).toUpperCase()}`;
}

function renderChatMessages(messages) {
  const container = $("chat-messages");
  const shouldStickToBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 32;
  const ids = messages.map((message) => String(message.id));
  const hasNewMessage = ids.some((id) => !chatLastMessageIds.includes(id));
  const fragment = document.createDocumentFragment();

  if (messages.length === 0) {
    const empty = document.createElement("p");
    empty.className = "chat-empty";
    empty.textContent = "The market is quiet. Say hello!";
    fragment.append(empty);
  }

  for (const message of messages) {
    const article = document.createElement("article");
    article.className = `chat-message${playerProfile && message.user_id === playerProfile.id ? " is-mine" : ""}`;
    const heading = document.createElement("div");
    heading.className = "chat-message-heading";
    const name = document.createElement("strong");
    name.textContent = message.display_name;
    const time = document.createElement("time");
    const sentAt = new Date(message.created_at);
    time.dateTime = sentAt.toISOString();
    time.textContent = sentAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    heading.append(name, time);
    article.append(heading);

    if (message.sticker_id && CHAT_STICKERS[message.sticker_id]) {
      const sticker = document.createElement("span");
      sticker.className = "chat-message-sticker";
      sticker.setAttribute("role", "img");
      sticker.setAttribute("aria-label", CHAT_STICKERS[message.sticker_id].label);
      sticker.textContent = CHAT_STICKERS[message.sticker_id].art;
      article.append(sticker);
    } else {
      const body = document.createElement("span");
      body.className = "chat-message-body";
      body.textContent = message.content;
      article.append(body);
    }
    fragment.append(article);
  }

  container.replaceChildren(fragment);
  if (shouldStickToBottom || hasNewMessage) container.scrollTop = container.scrollHeight;
  chatLastMessageIds = ids;
}

async function refreshMarketChat() {
  if (!supabaseClient || !navigator.onLine || chatPollInProgress || document.hidden) return;
  chatPollInProgress = true;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);
  try {
    const { data, error } = await supabaseClient
      .from("market_chat_messages")
      .select("id,sender_id,display_name,content,sticker_id,created_at")
      .order("created_at", { ascending: false })
      .limit(50)
      .abortSignal(controller.signal);
    if (error) throw error;
    renderChatMessages((data || []).reverse());
    chatStatus(`Live · chatting as ${formatChatName()} · public room`);
  } catch (error) {
    console.error("Could not load market chat messages.", error);
    const setupMissing = error.code === "42P01" || error.code === "PGRST205";
    chatStatus(setupMissing
      ? "Chat setup needed: run the Market chat migration in supabase-schema.sql."
      : error.name === "AbortError"
        ? "Chat connection timed out. Check your connection and retry."
        : `Chat couldn't load: ${error.message}`, true);
  } finally {
    window.clearTimeout(timeoutId);
    chatPollInProgress = false;
  }
}

async function sendMarketChat(content = "", stickerId = null) {
  if (!supabaseClient) {
    chatStatus("Chat service is unavailable. Try again after the page reconnects.", true);
    return;
  }
  if (chatSending) return;
  const cleanContent = content.trim();
  if (stickerId ? !Object.hasOwn(CHAT_STICKERS, stickerId) || cleanContent : !cleanContent) return;
  if (cleanContent.length > CHAT_MAX_LENGTH) {
    chatStatus(`Messages must be ${CHAT_MAX_LENGTH} characters or fewer.`, true);
    return;
  }
  if (!navigator.onLine) {
    chatStatus("You're offline. Chat messages need an internet connection.", true);
    return;
  }

  chatSending = true;
  $("chat-send").disabled = true;
  try {
    const { error } = await supabaseClient.rpc("send_market_chat", {
      p_content: cleanContent,
      p_sticker_id: stickerId,
      p_guest_id: playerProfile ? null : chatGuestId,
    });
    if (error) throw error;
    if (!stickerId) {
      $("chat-input").value = "";
      $("chat-character-count").textContent = `0/${CHAT_MAX_LENGTH}`;
    }
    await refreshMarketChat();
  } catch (error) {
    console.error("Could not send a market chat message.", error);
    chatStatus(`Message not sent: ${error.message}`, true);
  } finally {
    chatSending = false;
    $("chat-send").disabled = false;
  }
}

function initializeMarketChat() {
  chatGuestId = createChatGuestId();
  $("chat-input").maxLength = CHAT_MAX_LENGTH;
  $("chat-input").addEventListener("input", () => {
    $("chat-character-count").textContent = `${$("chat-input").value.length}/${CHAT_MAX_LENGTH}`;
  });
  $("chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    sendMarketChat($("chat-input").value);
  });
  $("chat-messages").addEventListener("click", () => $("chat-input").focus());
  $("market-chat").addEventListener("click", (event) => {
    const emojiButton = event.target.closest("[data-chat-emoji]");
    if (emojiButton && CHAT_EMOJIS.includes(emojiButton.dataset.chatEmoji)) {
      const input = $("chat-input");
      const start = input.selectionStart;
      input.setRangeText(emojiButton.dataset.chatEmoji, start, input.selectionEnd, "end");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
      return;
    }
    const stickerButton = event.target.closest("[data-chat-sticker]");
    if (stickerButton && Object.hasOwn(CHAT_STICKERS, stickerButton.dataset.chatSticker)) {
      sendMarketChat("", stickerButton.dataset.chatSticker);
    }
  });

  if (!supabaseClient) {
    chatStatus("Chat service is unavailable; game saves still work on this device.", true);
    return;
  }
  chatStatus(`Connecting as ${formatChatName()}…`);
  refreshMarketChat();
  chatPollTimer = window.setInterval(refreshMarketChat, CHAT_POLL_INTERVAL_MS);
}

function initializePlayerAccounts() {
  const config = window.TAP_GARRI_SUPABASE_CONFIG;
  $("leaderboard-refresh").addEventListener("click", refreshLeaderboard);
  refreshLeaderboard();
  $("account-open").addEventListener("click", () => {
    openAccountDialog(playerProfile ? "account" : "menu");
  });
  $("account-sign-in").addEventListener("click", () => openAccountDialog("sign-in"));
  $("account-sign-up").addEventListener("click", () => openAccountDialog("sign-up"));
  $("account-submit-sign-in").addEventListener("click", () => submitAccount("sign-in"));
  $("account-submit-sign-up").addEventListener("click", () => submitAccount("sign-up"));
  $("account-close").addEventListener("click", () => $("account-dialog").close());
  $("send-garri").addEventListener("click", sendGarri);
  $("account-sign-out").addEventListener("click", async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      restoreGuestGame();
      setAccountStatus("Signed out. Your local game progress is saved on this device.");
    } catch (error) {
      console.error("Player sign-out failed.", error);
      setAccountStatus(`Couldn't sign out: ${error.message}`, true);
    }
  });

  if (!config || !config.url || !config.anonKey) {
    $("account-sign-in").disabled = true;
    $("account-sign-up").disabled = true;
    setAccountStatus("Player accounts aren't connected yet. Local play and saving are available.");
    initializeMarketChat();
    return;
  }
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    $("account-sign-in").disabled = true;
    $("account-sign-up").disabled = true;
    setAccountStatus("Account service couldn't load. Local play is still available.", true);
    initializeMarketChat();
    return;
  }

  try {
    supabaseClient = window.supabase.createClient(config.url, config.anonKey);
    refreshLeaderboard();
  } catch (error) {
    console.error("Could not connect the player account service.", error);
    $("account-sign-in").disabled = true;
    $("account-sign-up").disabled = true;
    setAccountStatus(`Account service configuration is invalid: ${error.message}`, true);
    initializeMarketChat();
    return;
  }
  initializeMarketChat();
  supabaseClient.auth.onAuthStateChange((event, session) => {
    window.setTimeout(() => {
      if (session) {
        loadPlayerAccount(session.user);
      } else if (event === "SIGNED_OUT") {
        restoreGuestGame();
        setAccountStatus("Signed out. Your local game progress is saved on this device.");
      }
    }, 0);
  });
  supabaseClient.auth.getSession()
    .then(({ data, error }) => {
      if (error) throw error;
      if (data.session) return loadPlayerAccount(data.session.user);
      setAccountStatus("Sign in to sync your Garri and send it to other players.");
    })
    .catch((error) => {
      console.error("Could not restore the player session.", error);
      setAccountStatus(`Couldn't restore your account session: ${error.message}`, true);
    });
}

function hireHelper(id) {
  const tier = Number(id);
  if (!Number.isInteger(tier) || tier < 0) return;
  const helper = helperForTier(tier);
  if (state.stage < helper.unlock) return;
  const cost = helperCost(helper);
  if (state.coins < cost) return;
  state.coins -= cost;
  state.helperCounts[tier] = Math.min(MAX_VALUE, (state.helperCounts[tier] || 0) + 1);
  showToast(`${helper.name} joined your crew! They pack ${formatNumber(helperPower(tier))} order power every second.`);
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

function bestAffordableMarketMove() {
  const actions = [];
  const currentHelperTier = Math.floor((state.stage - 1) / 5);
  const firstHelperTier = Math.max(0, currentHelperTier - 4);
  for (let tier = firstHelperTier; tier <= currentHelperTier; tier += 1) {
    const helper = helperForTier(tier);
    if (state.stage < helper.unlock) continue;
    const cost = helperCost(helper);
    if (state.coins >= cost) {
      const score = (helperPower(tier) * 1.4 + (tier + 1) * 0.8) / cost;
      actions.push({
        score,
        name: `${helper.name} helper`,
        cost,
        action: () => hireHelper(tier),
      });
    }
    const owned = state.helperCounts[tier] || 0;
    const evolution = state.helperEvolutions[tier] || 0;
    const evolutionCost = helperEvolutionCost(helper);
    if (owned >= 5 && evolution < MAX_VALUE && state.coins >= evolutionCost) {
      const addedPower = owned * helperPower(tier) * Math.pow(2, evolution) *
        (1 + state.crewLevel * 0.5) * Math.pow(1.25, state.deliveryLevel) *
        (1 + state.prestige * 0.25);
      actions.push({
        score: addedPower / evolutionCost,
        name: `${helper.name} evolution`,
        cost: evolutionCost,
        action: () => evolveHelper(tier),
      });
    }
  }
  for (const upgrade of UPGRADES) {
    const cost = upgradeCost(upgrade);
    if (state.coins < cost) continue;
    const score = (state[upgrade.state] + 1) * (upgrade.id === "tap" ? 2.2 : upgrade.id === "crew" ? 1.7 : 1.9) / cost;
    actions.push({
      score,
      name: `${upgrade.name} upgrade`,
      cost,
      action: () => buyUpgrade(upgrade.id),
    });
  }
  const currentStoreTier = availableStoreTier();
  const firstStoreTier = Math.max(0, currentStoreTier - 4);
  for (let tier = firstStoreTier; tier <= currentStoreTier; tier += 1) {
    const store = storeForTier(tier);
    const owned = state.storesOwned[tier] || 0;
    const cost = storeCost(store);
    if (state.stage >= store.unlock && state.coins >= cost) {
      const score = (store.income * Math.pow(2, state.storeEvolutions[tier] || 0) * 4 + tier) / cost;
      actions.push({
        score,
        name: `${store.name} franchise`,
        cost,
        action: () => buyStore(tier),
      });
    }
    const evolution = state.storeEvolutions[tier] || 0;
    const evolutionCost = storeEvolutionCost(store);
    if (owned > 0 && evolution < MAX_VALUE && state.coins >= evolutionCost) {
      actions.push({
        score: owned * store.income * Math.pow(2, evolution) * 4 / evolutionCost,
        name: `${store.name} evolution`,
        cost: evolutionCost,
        action: () => evolveStore(tier),
      });
    }
  }
  const feast = feastForTier(state.feastCount);
  if (state.stage >= feast.unlock && state.coins >= feast.cost) {
    actions.push({
      score: (feast.bonus * orderReward()) / feast.cost,
      name: feast.name,
      cost: feast.cost,
      action: () => buyFeast(feast.tier),
    });
  }
  if (!actions.length) return null;
  actions.sort((left, right) => right.score - left.score);
  return actions[0];
}

function buyBestAffordableAction() {
  const recommendation = bestAffordableMarketMove();
  if (!recommendation) {
    showToast("Earn a few more coins before the next smart buy is ready.");
    return;
  }
  recommendation.action();
}

function resetLocalSave() {
  const confirmed = window.confirm("Reset your local Garri Town save on this device? Your browser save will be cleared.");
  if (!confirmed) return;
  window.localStorage.removeItem(SAVE_KEY);
  window.localStorage.removeItem(ACCOUNT_OWNER_KEY);
  if (playerProfile) {
    window.localStorage.removeItem(`${ACCOUNT_SAVE_PREFIX}${playerProfile.id}`);
    restoreGuestGame();
    setAccountStatus("Local market progress was reset. Your cloud save stayed connected to your account.");
    return;
  }
  state = createDefaultState();
  lastTick = Date.now();
  render();
  saveFarm();
  showToast("Local market save reset. The market is ready for a fresh start.");
}

function potentialPrestige() {
  return Math.max(0, Math.floor((state.bestStage - 1) / 10) - state.prestige);
}

function prestige() {
  const reward = potentialPrestige();
  if (reward <= 0) return;
  const accepted = window.confirm(
    `Start a new market era for ${reward} Market Legacy? Your coins, helpers, stores, feasts, upgrades, and order progress will reset. Your permanent power boost will grow.`
  );
  if (!accepted) return;

  state.prestige += reward;
  state.coins = 0;
  state.stage = 1;
  state.orderHp = orderMaxHp(1);
  state.bestStage = 1;
  state.level = 1;
  state.xp = 0;
  state.tapUpgradeLevel = 0;
  state.crewLevel = 0;
  state.deliveryLevel = 0;
  state.helperCounts = [];
  state.helperEvolutions = [];
  state.storesOwned = [];
  state.storeEvolutions = [];
  state.feastCount = 0;
  for (const key of LEGACY_HELPER_KEYS) state[key] = 0;
  for (const store of STORES) state[store.id] = 0;
  for (const feast of FEASTS) state[feast.id] = 0;
  showToast(`New market era! +${reward} Market Legacy. Your taps and helpers are stronger forever.`);
  render();
  saveFarm();
}

function renderTown() {
  const helpers = state.helperCounts.reduce((total, count) => total + count, 0);
  if (!townRendered) {
    $("farm-layout").innerHTML = `
      <div class="map-field field-1"><span>🌿</span><span>🌿</span><span>🌿</span><small>CASSAVA</small></div>
      <div class="map-field field-2"><span>🌿</span><span>🌿</span><span>🌿</span><small>FARM</small></div>
      <div class="map-field field-5"><span>🌿</span><span>🌿</span><span>🌿</span><small>GARRI</small></div>
      <div class="market-garden"><img src="./assets/market-crops.svg" alt=""><small>MARKET GARDEN</small></div>
      <div class="map-building grater-building"><span>🏠</span><small>GARRI HOUSE</small><i>⚙️</i></div>
      <div class="map-building market-building"><span>🏪</span><small>MARKET</small><i>🧺</i></div>
      <div class="map-building farmhouse"><span>🏡</span><small>HOME</small></div>
      <span class="map-person person-a">🧑🏾‍🌾</span><span class="map-person person-b">👩🏿‍🌾</span>
      <span class="town-helper-count"></span><div class="helper-visitors"></div>`;
    townRendered = true;
  }
  $("farm-layout").querySelector(".town-helper-count").textContent = `${formatNumber(helpers)} helpers`;
  const visualKey = state.helperCounts.map((owned, tier) =>
    `${owned}.${state.helperEvolutions[tier] || 0}`).join(":");
  if (visualKey !== helperAnimationKey) {
    const visitors = [];
    state.helperCounts.forEach((owned, tier) => {
      const icon = helperForTier(tier).icon;
      const count = Math.min(owned, Math.max(0, 8 - visitors.length));
      for (let index = 0; index < count; index += 1) {
        const evolution = state.helperEvolutions[tier] || 0;
        visitors.push(`<span class="helper-sprite helper-tier-${tier % 4}${evolution ? " is-evolved" : ""}" data-evolution="${evolution}" style="--worker-index:${visitors.length};--worker-delay:-${visitors.length * 0.23}s">${icon}${evolution ? `<i aria-hidden="true">${"✦".repeat(Math.min(evolution, 3))}</i>` : ""}</span>`);
      }
    });
    $("farm-layout").querySelector(".helper-visitors").innerHTML = visitors.join("");
    helperAnimationKey = visualKey;
  }
}

function renderHelpers() {
  const currentTier = Math.floor((state.stage - 1) / 5);
  const firstTier = Math.max(0, currentTier - 4);
  const lastTier = currentTier + 1;
  $("helper-list").innerHTML = Array.from({ length: lastTier - firstTier + 1 }, (_, offset) => {
    const helper = helperForTier(firstTier + offset);
    const cost = helperCost(helper);
    const owned = state.helperCounts[helper.tier] || 0;
    const evolution = state.helperEvolutions[helper.tier] || 0;
    const unlocked = state.stage >= helper.unlock;
    const evolutionCost = helperEvolutionCost(helper);
    const rank = helperEvolutionRank(evolution);
    return `<article class="helper-card">
      <span class="helper-icon${evolution ? " is-evolved" : ""}" aria-hidden="true">${helper.icon}${evolution ? `<i>${"✦".repeat(Math.min(evolution, 3))}</i>` : ""}</span>
      <span class="helper-copy"><strong>${helper.name} · ${rank}</strong><small>Packs ${formatNumber(helperPower(helper.tier) * Math.pow(2, evolution))} order power / sec each</small><small>Owned: ${formatNumber(owned)} · unlock order ${formatNumber(helper.unlock)}</small></span>
      <span class="progression-actions">
        <button class="hire-button" data-hire="${helper.tier}" type="button" ${!unlocked || state.coins < cost ? "disabled" : ""} aria-label="Hire ${helper.name} for ${formatNumber(cost)} coins">${unlocked ? `🪙 ${formatNumber(cost)}` : `ORDER ${formatNumber(helper.unlock)}`}<span>${unlocked ? "HIRE" : "LOCKED"}</span></button>
        ${owned > 0 ? `<button class="hire-button evolve-button" data-evolve-helper="${helper.tier}" type="button" ${evolution >= MAX_VALUE || owned < 5 || state.coins < evolutionCost ? "disabled" : ""} aria-label="Evolve ${helper.name}; requires five crew members and ${formatNumber(evolutionCost)} coins">🪙 ${formatNumber(evolutionCost)}<span>${owned < 5 ? `NEED 5 · ${owned}/5` : "EVOLVE ×2"}</span></button>` : ""}
      </span>
    </article>`;
  }).join("");
}

function availableStoreTier() {
  if (state.stage < STORES[5].unlock) {
    let tier = 0;
    while (tier < STORES.length && state.stage >= STORES[tier].unlock) tier += 1;
    return tier - 1;
  }
  return Math.min(10000, STORES.length + Math.floor((state.stage - 33) / 8));
}

function buyStore(tier) {
  const store = storeForTier(tier);
  const cost = storeCost(store);
  if (!Number.isInteger(tier) || tier < 0 ||
      state.stage < store.unlock || state.coins < cost) return;
  state.coins -= cost;
  state.storesOwned[tier] = Math.min(MAX_VALUE, (state.storesOwned[tier] || 0) + 1);
  showToast(`${store.name} franchise opened! Your ${formatNumber(state.storesOwned[tier])} location${state.storesOwned[tier] === 1 ? "" : "s"} earn ${formatNumber(store.income * Math.pow(2, state.storeEvolutions[tier] || 0))} coins per second each.`);
  render();
  saveFarm();
}

function evolveHelper(tier) {
  if (!Number.isInteger(tier) || tier < 0 || (state.helperCounts[tier] || 0) < 5) return;
  const helper = helperForTier(tier);
  const level = state.helperEvolutions[tier] || 0;
  if (level >= MAX_VALUE) return;
  const cost = helperEvolutionCost(helper);
  if (state.coins < cost) return;
  state.coins -= cost;
  state.helperEvolutions[tier] = level + 1;
  showToast(`${helper.name} reached ${helperEvolutionRank(level + 1)}! Their packing power doubled.`);
  render();
  saveFarm();
}

function evolveStore(tier) {
  if (!Number.isInteger(tier) || tier < 0 || !state.storesOwned[tier]) return;
  const store = storeForTier(tier);
  const level = state.storeEvolutions[tier] || 0;
  if (level >= MAX_VALUE) return;
  const cost = storeEvolutionCost(store);
  if (state.coins < cost) return;
  state.coins -= cost;
  state.storeEvolutions[tier] = level + 1;
  showToast(`${store.name} evolved to ${storeEvolutionRank(level + 1)}! Its coin income doubled.`);
  render();
  saveFarm();
}

function renderStores() {
  const currentTier = availableStoreTier();
  const firstTier = Math.max(0, currentTier - 4);
  const lastTier = currentTier + 1;
  $("store-list").innerHTML = Array.from({ length: lastTier - firstTier + 1 }, (_, offset) => {
    const store = storeForTier(firstTier + offset);
    const owned = state.storesOwned[store.tier] || 0;
    const evolution = state.storeEvolutions[store.tier] || 0;
    const unlocked = state.stage >= store.unlock;
    const cost = storeCost(store);
    const evolutionCost = storeEvolutionCost(store);
    const rank = storeEvolutionRank(evolution);
    const icon = ["🛒", "✨", "👑", "💎"][Math.min(evolution, 3)];
    const status = owned
      ? `${rank} · ${formatNumber(owned)} locations · ${formatNumber(owned * store.income * Math.pow(2, evolution))} coins / sec`
      : unlocked
        ? store.kind
        : `Unlocks at market order ${formatNumber(store.unlock)}`;
    return `<article class="store-card${owned ? " is-owned" : ""}${evolution ? " is-evolved" : ""}">
      <span class="store-icon" aria-hidden="true">${owned ? icon : store.icon}</span>
      <span class="helper-copy"><strong>${store.name}</strong><small>${store.area} · ${store.kind}</small><small>${status}</small></span>
      <span class="progression-actions">
        <button class="hire-button store-button" data-store="${store.tier}" type="button" ${!unlocked || state.coins < cost ? "disabled" : ""} aria-label="${unlocked ? `Buy another ${store.name} franchise for ${formatNumber(cost)} coins` : `${store.name} unlocks at order ${formatNumber(store.unlock)}`}">🪙 ${formatNumber(cost)}<span>${owned ? "EXPAND" : unlocked ? "OPEN STORE" : "LOCKED"}</span></button>
        ${owned ? `<button class="hire-button store-button evolve-button" data-evolve-store="${store.tier}" type="button" ${evolution >= MAX_VALUE || state.coins < evolutionCost ? "disabled" : ""} aria-label="Evolve ${store.name} for ${formatNumber(evolutionCost)} coins">🪙 ${formatNumber(evolutionCost)}<span>EVOLVE ×2</span></button>` : ""}
      </span>
    </article>`;
  }).join("");
}

function buyFeast(tier) {
  const feast = feastForTier(tier);
  if (!Number.isInteger(tier) || tier !== state.feastCount ||
      (FEASTS[tier] && state[feast.id] > 0) ||
      state.stage < feast.unlock || state.coins < feast.cost) return;
  state.coins -= feast.cost;
  if (FEASTS[tier]) state[feast.id] = 1;
  state.feastCount += 1;
  while (state.feastCount < FEASTS.length && state[FEASTS[state.feastCount].id] > 0) {
    state.feastCount += 1;
  }
  showToast(`${feast.name} added to your Owambe collection! Market order rewards are now higher.`);
  render();
  saveFarm();
}

function renderFeasts() {
  const firstTier = Math.max(0, state.feastCount - 2);
  const lastTier = state.feastCount + 2;
  $("feast-list").innerHTML = Array.from({ length: lastTier - firstTier + 1 }, (_, offset) => {
    const feast = feastForTier(firstTier + offset);
    const owned = FEASTS[feast.tier]
      ? state[feast.id] > 0
      : feast.tier < state.feastCount;
    const unlocked = state.stage >= feast.unlock;
    const status = owned
      ? `Collection bonus: +${Math.round(feast.bonus * 100)}% order rewards`
      : feast.tier === state.feastCount && unlocked
        ? feast.description
        : `Unlocks at market order ${formatNumber(feast.unlock)}`;
    return `<article class="feast-card${owned ? " is-owned" : ""}">
      <span class="feast-icon" aria-hidden="true">${feast.icon}</span>
      <span class="helper-copy"><strong>${feast.name}</strong><small>${status}</small></span>
      <button class="hire-button feast-button" data-feast="${feast.tier}" type="button" ${owned || feast.tier !== state.feastCount || !unlocked || state.coins < feast.cost ? "disabled" : ""} aria-label="${owned ? `${feast.name} collected` : unlocked ? `Buy ${feast.name} for ${formatNumber(feast.cost)} coins` : `${feast.name} unlocks at market order ${formatNumber(feast.unlock)}`}">${owned ? "COLLECTED" : unlocked ? `🪙 ${formatNumber(feast.cost)}` : `ORDER ${formatNumber(feast.unlock)}`}<span>${owned ? "IN COLLECTION" : unlocked ? "ENJOY" : "LOCKED"}</span></button>
    </article>`;
  }).join("");
}

function renderUpgrades() {
  $("upgrade-list").innerHTML = UPGRADES.map((upgrade) => {
    const cost = upgradeCost(upgrade);
    return `<article class="upgrade-card">
      <span class="helper-icon" aria-hidden="true">${upgrade.icon}</span>
      <span class="helper-copy"><strong>${upgrade.name} · L${state[upgrade.state]}</strong><small>${upgrade.description}</small><small>${upgrade.id === "delivery" ? `${Math.pow(1.25, state.deliveryLevel).toFixed(2)}× crew delivery power · repeatable` : "Repeatable · each level gets more powerful"}</small></span>
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
  const levelXpGoal = xpForNextLevel();
  const orderName = ORDER_NAMES[(state.stage - 1) % ORDER_NAMES.length];
  const marketArea = currentMarketArea();
  const luxuryBowl = LUXURY_BOWLS[luxuryBowlTier()];
  const scene = $("market-scene");
  const sceneSignature = `${marketArea.scene}:${marketArea.circuit}:${state.prestige}`;
  if (currentSceneSignature && currentSceneSignature !== sceneSignature) {
    scene.classList.remove("is-changing");
    void scene.offsetWidth;
    scene.classList.add("is-changing");
    window.setTimeout(() => scene.classList.remove("is-changing"), 650);
  }
  currentSceneSignature = sceneSignature;
  scene.dataset.scene = marketArea.scene;
  scene.dataset.circuit = String((marketArea.circuit + state.prestige) % 3);
  scene.setAttribute("aria-label", `${marketArea.displayName} scene`);

  $("coins").textContent = formatNumber(state.coins);
  $("stage-count").textContent = formatNumber(state.stage);
  $("tap-stat").textContent = formatNumber(tapPower());
  $("dps-stat").textContent = formatNumber(helperDamagePerSecond());
  $("congos-packed").textContent = formatNumber(state.congosPacked);
  renderGarriWallet();
  $("level-badge").textContent = formatNumber(state.level);
  $("level-title").textContent = tapLevelName();
  $("xp-progress").style.width = `${Math.min(100, state.xp / levelXpGoal * 100)}%`;
  $("xp-label").textContent = `${formatNumber(state.xp)} / ${formatNumber(levelXpGoal)} XP`;
  $("tap-target").dataset.luxury = luxuryBowl.data;
  $("tap-target").setAttribute("aria-label", `Tap your ${luxuryBowl.name} garri bowl to pack the market order`);
  $("showcase-bowl").dataset.luxury = luxuryBowl.data;
  $("bowl-luxury-name").textContent = luxuryBowl.name;
  $("bowl-level-label").textContent = `Tap Level ${formatNumber(state.level)}`;
  $("order-number").textContent = formatNumber(state.stage);
  $("scene-order").textContent = formatNumber(state.stage);
  $("boss-name").textContent = orderName;
  $("market-area").textContent = marketArea.displayName.toUpperCase();
  $("scene-location").textContent = marketArea.displayName.toUpperCase();
  $("scene-landmark").textContent = marketArea.landmark;
  $("boss-health").style.width = `${healthPercent}%`;
  $("boss-health").parentElement.setAttribute("aria-valuenow", String(Math.round(healthPercent)));
  $("boss-health-label").textContent = `${formatNumber(state.orderHp)} / ${formatNumber(maxHp)} packing power left`;
  $("order-reward").textContent = `+${formatNumber(nextReward)}`;
  $("idle-note").textContent = helperDamagePerSecond() > 0
    ? `Your crew packs ${formatNumber(helperDamagePerSecond())} power every second.`
    : "Tap the bowl or hire helpers to pack automatically.";

  $("prestige-badge").textContent = formatNumber(state.prestige);
  $("prestige-boost").textContent = `${powerBoost.toFixed(2)}× permanent power`;
  $("prestige-hint").textContent = legacyGain > 0
    ? `Prestige now for +${formatNumber(legacyGain)} Market Legacy.`
    : `Beat order ${formatNumber((state.prestige + 1) * 10)} to earn your next Market Legacy.`;
  $("prestige-button").disabled = legacyGain <= 0;
  $("prestige-button").textContent = legacyGain > 0 ? `+${formatNumber(legacyGain)} LEGACY` : "LOCKED";
  $("market-mood").textContent = helperDamagePerSecond() > 0 ? "⚡  The crew is packing" : "☀  The market is lively";
  $("store-income").textContent = `${formatNumber(storeIncomePerSecond())} / sec`;
  if (helperDamagePerSecond() <= 0 && storeIncomePerSecond() > 0) {
    $("idle-note").textContent = `Your Lagos shops earn ${formatNumber(storeIncomePerSecond())} coins every second.`;
  }
  const bragText = `I packed ${formatNumber(state.congosPacked)} Congos in Tap Garri! I'm a ${luxuryBowl.name} bowl owner at ${marketArea.displayName}. Can you beat my Lagos market score? ${GAME_URL}`;
  $("x-share").href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(bragText)}`;
  $("copy-youtube-caption").dataset.caption = `${bragText} #TapGarri #Lagos #NaijaFood #Owambe`;

  renderHelpers();
  renderStores();
  renderFeasts();
  renderUpgrades();
  renderTown();
  const smartBuy = bestAffordableMarketMove();
  const smartBuyButton = $("smart-buy-button");
  smartBuyButton.title = smartBuy
    ? `Buy ${smartBuy.name} for ${formatNumber(smartBuy.cost)} coins`
    : "Earn more coins to unlock a recommended purchase";
  smartBuyButton.setAttribute("aria-label", smartBuy
    ? `Smart buy recommendation: ${smartBuy.name} for ${formatNumber(smartBuy.cost)} coins`
    : "Smart buy: no affordable purchases yet");
  $("smart-buy-hint").textContent = smartBuy
    ? `Recommended: ${smartBuy.name} · ${formatNumber(smartBuy.cost)} coins. SPACE taps · B buys · P prestige.`
    : "Earn more coins for a recommendation. SPACE taps · B smart buy · P prestige.";
}

function simulate(seconds) {
  const damage = helperDamagePerSecond() * seconds;
  if (damage > 0) processDamage(damage);
  const income = storeIncomePerSecond() * seconds;
  if (income > 0) state.coins = safeAdd(state.coins, income);
}

function applyOfflineProgress() {
  const awaySeconds = Math.min(Math.max(0, (Date.now() - state.lastSaved) / 1000), OFFLINE_LIMIT_SECONDS);
  if (awaySeconds >= 10 && (helperDamagePerSecond() > 0 || storeIncomePerSecond() > 0)) {
    const oldStage = state.stage;
    const oldCoins = state.coins;
    simulate(awaySeconds);
    const orders = state.stage - oldStage;
    const income = state.coins - oldCoins;
    showToast(`While you were away, your shops earned ${formatNumber(income)} coins${orders > 0 ? ` and your crew packed ${formatNumber(orders)} orders` : ""}.`);
  }
  render();
  saveFarm();
}

function flushGameProgress() {
  if (accountLoadingId) return;
  const now = Date.now();
  const elapsed = Math.min(Math.max(0, (now - lastTick) / 1000), OFFLINE_LIMIT_SECONDS);
  lastTick = now;
  if (elapsed > 0) simulate(elapsed);
  render();
  saveFarm();
  saveCounter = 0;
}

function tick() {
  const now = Date.now();
  if (accountLoadingId) {
    lastTick = now;
    return;
  }
  const elapsed = Math.min((now - lastTick) / 1000, OFFLINE_LIMIT_SECONDS);
  lastTick = now;
  simulate(elapsed);
  render();
  saveCounter += elapsed;
  if (saveCounter >= LOCAL_SAVE_INTERVAL_SECONDS) {
    saveFarm();
    saveCounter %= LOCAL_SAVE_INTERVAL_SECONDS;
  }
}

loadFarm();
$("tap-target").addEventListener("click", tapMarket);
$("garri-varieties").addEventListener("click", (event) => {
  const button = event.target.closest("[data-variety]");
  if (!button || !GARRI_VARIETIES.some((variety) => variety.id === button.dataset.variety)) return;
  state.garriType = button.dataset.variety;
  $("transfer-variety").value = state.garriType;
  render();
  saveFarm();
});
$("transfer-variety").innerHTML = GARRI_VARIETIES.map((variety) =>
  `<option value="${variety.id}">${variety.name}</option>`).join("");
$("transfer-variety").value = state.garriType;
$("helper-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-hire]");
  if (button) hireHelper(Number(button.dataset.hire));
  const evolveButton = event.target.closest("[data-evolve-helper]");
  if (evolveButton) evolveHelper(Number(evolveButton.dataset.evolveHelper));
});
$("store-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-store]");
  if (button) buyStore(Number(button.dataset.store));
  const evolveButton = event.target.closest("[data-evolve-store]");
  if (evolveButton) evolveStore(Number(evolveButton.dataset.evolveStore));
});
$("feast-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-feast]");
  if (button) buyFeast(Number(button.dataset.feast));
});
$("upgrade-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-upgrade]");
  if (button) buyUpgrade(button.dataset.upgrade);
});
$("prestige-button").addEventListener("click", prestige);
$("smart-buy-button").addEventListener("click", buyBestAffordableAction);
$("reset-save-button").addEventListener("click", resetLocalSave);
document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (event.altKey || event.ctrlKey || event.metaKey ||
      (target instanceof Element && target.closest("input, textarea, select, button, a, [contenteditable='true']")) ||
      $("account-dialog").open) return;
  if (event.code === "Space" || event.key === " ") {
    event.preventDefault();
    tapMarket();
    return;
  }
  if (event.key.toLowerCase() === "b") {
    event.preventDefault();
    buyBestAffordableAction();
    return;
  }
  if (event.key.toLowerCase() === "p" && potentialPrestige() > 0) {
    event.preventDefault();
    prestige();
  }
});
$("copy-youtube-caption").addEventListener("click", () => {
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
    showToast("Your browser cannot copy automatically here. Copy the game link to add it to your YouTube caption.");
    return;
  }
  navigator.clipboard.writeText($("copy-youtube-caption").dataset.caption)
    .then(() => showToast("YouTube Shorts caption copied! Paste it into your Lagos garri video."))
    .catch(() => showToast("Couldn't copy the YouTube caption. Please copy the game link directly."));
});
initializePlayerAccounts();
applyOfflineProgress();
window.setInterval(tick, 500);
window.setInterval(() => {
  if (!document.hidden && playerProfile) {
    syncPendingGarri().catch((error) => {
      console.error("Could not refresh the shared Garri balance.", error);
      setAccountStatus(`Couldn't refresh shared Garri: ${error.message}`, true);
    });
  }
}, 15000);
window.setInterval(() => {
  if (!document.hidden) refreshLeaderboard();
}, 60000);
window.addEventListener("pagehide", flushGameProgress);
window.addEventListener("offline", () => {
  chatStatus("You're offline. Chat reconnects when your connection returns.", true);
  if (playerProfile) {
    setAccountStatus("Offline. Progress is saved on this device and will sync when you reconnect.", true);
  }
});
window.addEventListener("online", () => {
  refreshMarketChat();
  if (playerProfile) {
    setAccountStatus("Back online. Syncing your saved progress…");
    schedulePlayerGameSave();
    scheduleGarriSync();
    return;
  }
  if (supabaseClient) {
    supabaseClient.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        if (data.session) return loadPlayerAccount(data.session.user);
        return undefined;
      })
      .catch((error) => {
        console.error("Could not restore the player session after reconnecting.", error);
        setAccountStatus(`Couldn't restore your account session: ${error.message}`, true);
      });
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    flushGameProgress();
    return;
  }
  tick();
  refreshMarketChat();
  if (playerProfile) {
    schedulePlayerGameSave();
    scheduleGarriSync();
  }
});
if ("serviceWorker" in navigator && /^https?:$/.test(window.location.protocol)) {
  navigator.serviceWorker.register("./service-worker.js")
    .catch(() => showToast("Offline caching couldn't be enabled. The game still works while you're online."));
}
