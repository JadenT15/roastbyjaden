const STORAGE_KEY = "roast-by-jaden-platform-v2";

export const business = {
  name: "Roast by Jaden",
  currency: "RM",
  whatsappNumber: "60123456789",
  timezone: "Asia/Kuala_Lumpur",
  admin: {
    email: "seller@roastbyjaden.local",
    password: "jaden123",
    name: "Roast by Jaden Seller",
  },
};

export const orderStatuses = [
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DONE",
  "CANCELLED",
];

const revenueStatuses = new Set([
  "ACCEPTED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DONE",
]);

const menuImages = {
  roastDuck:
    "https://images.unsplash.com/photo-1762088200446-f32ff63f8399?auto=format&fit=crop&w=900&q=85",
  roastDuckRice: "assets/duck-rice-roast-skin-fresh-greens-steam.jpg",
  roastDisplay:
    "https://images.pexels.com/photos/6645928/pexels-photo-6645928.jpeg?auto=compress&cs=tinysrgb&w=900",
  charSiu:
    "https://images.pexels.com/photos/8969968/pexels-photo-8969968.jpeg?auto=compress&cs=tinysrgb&w=900",
  charSiuRice: "assets/charsiu-rice-closeup-fresh-greens-steam.jpg",
  charSiuPortion: "assets/regular-char-siu-natural.png",
  crispyPork:
    "https://images.pexels.com/photos/8408377/pexels-photo-8408377.jpeg?auto=compress&cs=tinysrgb&w=900",
  crispyPorkRice: "assets/roast-pork-rice-natural-steam.jpg",
  crispyPorkPortion: "assets/regular-roast-pork-natural.jpg",
  roastChicken:
    "https://images.pexels.com/photos/12350418/pexels-photo-12350418.jpeg?auto=compress&cs=tinysrgb&w=900",
};

const defaultChoiceGroups = {
  chickenPart: {
    id: "chickenPart",
    label: "鸡肉部位",
    options: [
      { value: "鸡胸", available: true },
      { value: "鸡二度", available: true },
      { value: "鸡翅", available: false },
      { value: "鸡腿", available: true },
    ],
  },
  charSiuCut: {
    id: "charSiuCut",
    label: "叉烧肥瘦",
    options: [
      { value: "瘦", available: true },
      { value: "半肥瘦", available: true },
    ],
  },
  portionWeight: {
    id: "portionWeight",
    label: "重量",
    options: [
      { value: "100g", available: true, price: 12 },
      { value: "200g", available: true, price: 23 },
    ],
  },
  duckPortionSize: {
    id: "duckPortionSize",
    label: "烧鸭规格",
    options: [
      { value: "一例上庄", available: true, price: 24.9 },
      { value: "一例下庄", available: true, price: 24.9 },
      { value: "半只", available: true, price: 48 },
      { value: "一只", available: true, price: 88 },
    ],
  },
  roastMeatCombo: {
    id: "roastMeatCombo",
    label: "烧味选择",
    options: [
      { value: "烧鸭", available: true },
      { value: "叉烧", available: true },
      { value: "烧肉", available: true },
      { value: "烧鸡", available: true },
      { value: "白切鸡", available: true },
    ],
  },
};

const defaultProducts = [
  {
    id: "roast-duck-rice",
    name: "港式当归烧鸭饭",
    category: "烧味饭",
    price: 13.9,
    description: "皮脆肉嫩烧鸭，配白饭、香港芥兰或香港菜心和烧腊汁。",
    image: menuImages.roastDuckRice,
    enabled: true,
    soldOut: false,
    choices: [],
  },
  {
    id: "char-siu-rice",
    name: "蜜汁叉烧饭",
    category: "烧味饭",
    price: 12.9,
    description: "蜜汁叉烧切片，甜香入味，配白饭、香港芥兰或香港菜心和烧腊汁。",
    image: menuImages.charSiuRice,
    enabled: true,
    soldOut: false,
    choices: ["charSiuCut"],
  },
  {
    id: "siew-yoke-rice",
    name: "脆皮烧肉饭",
    category: "烧味饭",
    price: 13.9,
    description: "金黄脆皮烧肉，肥瘦相间，搭配白饭、香港芥兰或香港菜心和黄芥末。",
    image: menuImages.crispyPorkRice,
    enabled: true,
    soldOut: false,
    choices: [],
  },
  {
    id: "white-chicken-rice",
    name: "白切鸡饭",
    category: "烧味饭",
    price: 12.9,
    description: "滑嫩白切鸡，搭配白饭、香港芥兰或香港菜心和姜蓉。",
    image: menuImages.roastChicken,
    enabled: true,
    soldOut: false,
    choices: ["chickenPart"],
  },
  {
    id: "hk-roast-chicken-rice",
    name: "港式烧鸡饭",
    category: "烧味饭",
    price: 12.9,
    description: "港式烧鸡，皮香肉嫩，搭配白饭、香港芥兰或香港菜心和烧腊汁。",
    image: menuImages.roastChicken,
    enabled: true,
    soldOut: false,
    choices: ["chickenPart"],
  },
  {
    id: "custom-double-rice",
    name: "自选双拼饭",
    category: "双拼 / 三拼 / 拼盘",
    price: 16.9,
    description: "自选两款烧味，搭配白饭、香港芥兰或香港菜心和烧腊汁。",
    image: menuImages.roastDisplay,
    enabled: true,
    soldOut: false,
    choices: [],
    comboChoices: {
      groupId: "roastMeatCombo",
      label: "选择两款烧味",
      count: 2,
    },
  },
  {
    id: "custom-triple-rice",
    name: "自选三拼饭",
    category: "双拼 / 三拼 / 拼盘",
    price: 18.9,
    description: "自选三款烧味，搭配白饭、香港芥兰或香港菜心和烧腊汁。",
    image: menuImages.roastDisplay,
    enabled: true,
    soldOut: false,
    choices: [],
    comboChoices: {
      groupId: "roastMeatCombo",
      label: "选择三款烧味",
      count: 3,
    },
  },
  {
    id: "four-treasure-rice",
    name: "四宝饭",
    category: "双拼 / 三拼 / 拼盘",
    price: 19.9,
    description: "烧鸭、叉烧、烧肉、烧鸡，搭配白饭、香港芥兰或香港菜心和烧腊汁。",
    image: menuImages.roastDisplay,
    enabled: true,
    soldOut: false,
    choices: [],
  },
  {
    id: "roast-duck-portion",
    name: "烧鸭例牌",
    category: "单点加料",
    price: 24.9,
    description: "适合分享的烧鸭例牌，可搭配饭或面。",
    image: menuImages.roastDuck,
    enabled: true,
    soldOut: false,
    choices: ["duckPortionSize"],
  },
  {
    id: "char-siu-portion",
    name: "叉烧例牌",
    category: "单点加料",
    price: 22.9,
    description: "蜜汁叉烧例牌，适合加餸或多人分享。",
    image: menuImages.charSiuPortion,
    enabled: true,
    soldOut: false,
    choices: ["charSiuCut", "portionWeight"],
  },
  {
    id: "siew-yoke-portion",
    name: "烧肉例牌",
    category: "单点加料",
    price: 23.9,
    description: "脆皮烧肉例牌，皮脆肉香。",
    image: menuImages.crispyPorkPortion,
    enabled: true,
    soldOut: false,
    choices: ["portionWeight"],
  },
];

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildInitialState() {
  return {
    version: 2,
    settings: {
      orderingOpen: true,
    },
    session: {
      loggedIn: false,
    },
    choiceGroups: deepClone(defaultChoiceGroups),
    products: deepClone(defaultProducts),
    orders: [],
    lastOrderNumber: 1000,
    lastProductNumber: 0,
  };
}

function normalizeState(rawState) {
  const initial = buildInitialState();
  const state = rawState && typeof rawState === "object" ? rawState : {};

  return {
    version: 2,
    settings: {
      ...initial.settings,
      ...(state.settings || {}),
    },
    session: {
      ...initial.session,
      ...(state.session || {}),
    },
    choiceGroups:
      state.choiceGroups && typeof state.choiceGroups === "object"
        ? state.choiceGroups
        : initial.choiceGroups,
    products: Array.isArray(state.products) && state.products.length ? state.products : initial.products,
    orders: Array.isArray(state.orders) ? state.orders : initial.orders,
    lastOrderNumber:
      typeof state.lastOrderNumber === "number" ? state.lastOrderNumber : initial.lastOrderNumber,
    lastProductNumber:
      typeof state.lastProductNumber === "number"
        ? state.lastProductNumber
        : initial.lastProductNumber,
  };
}

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : buildInitialState();
  } catch {
    return buildInitialState();
  }
}

let currentState = readStorage();
const listeners = new Set();

function emitChange() {
  const snapshot = getState();
  listeners.forEach((listener) => listener(snapshot));
}

function persistState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  emitChange();
}

function mutateState(mutator) {
  const draft = deepClone(currentState);
  mutator(draft);
  currentState = normalizeState(draft);
  persistState();
  return getState();
}

window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY) return;
  currentState = readStorage();
  emitChange();
});

export function getState() {
  return deepClone(currentState);
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function formatPrice(value) {
  return `${business.currency}${Number(value || 0).toFixed(2)}`;
}

export function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("en-MY", {
    timeZone: business.timezone,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getBusinessDayKey(dateLike = new Date()) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  return date.toLocaleDateString("en-CA", {
    timeZone: business.timezone,
  });
}

export function getBusinessDateLabel(dateLike = new Date()) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  return date.toLocaleDateString("en-MY", {
    timeZone: business.timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isToday(dateLike) {
  return getBusinessDayKey(dateLike) === getBusinessDayKey(new Date());
}

export function getCategories(state = currentState) {
  return ["All", ...new Set(state.products.map((product) => product.category))];
}

export function getChoiceGroupsForProduct(product, state = currentState) {
  return (product.choices || [])
    .map((choiceId) => state.choiceGroups[choiceId])
    .filter(Boolean)
    .map((group) => deepClone(group));
}

export function getComboGroupForProduct(product, state = currentState) {
  if (!product.comboChoices?.groupId) return null;
  const group = state.choiceGroups[product.comboChoices.groupId];
  if (!group) return null;

  return {
    ...deepClone(group),
    label: product.comboChoices.label,
    count: product.comboChoices.count,
  };
}

export function getFirstAvailableOption(group) {
  return group.options.find((option) => option.available);
}

export function isProductAvailable(product, state = currentState) {
  if (!product.enabled || product.soldOut) return false;

  const singleChoiceReady = getChoiceGroupsForProduct(product, state).every(
    (group) => Boolean(getFirstAvailableOption(group)),
  );

  const comboGroup = getComboGroupForProduct(product, state);
  const comboReady =
    !comboGroup || comboGroup.options.filter((option) => option.available).length >= comboGroup.count;

  return singleChoiceReady && comboReady;
}

export function formatChoiceSummary(choices) {
  return choices
    .filter((choice) => (Array.isArray(choice.value) ? choice.value.length > 0 : choice.value))
    .map((choice) => {
      const value = Array.isArray(choice.value) ? choice.value.join(", ") : choice.value;
      return `${choice.label}: ${value}`;
    })
    .join(" / ");
}

export function buildWhatsAppUrl(order) {
  const itemLines = order.items.map(
    (item) =>
      `- ${item.quantity} x ${item.name}${item.choicesText ? ` [${item.choicesText}]` : ""} (${formatPrice(item.unitPrice * item.quantity)})`,
  );

  const message = [
    `Hi ${business.name}, I would like to confirm this order:`,
    "",
    `Order code: ${order.code}`,
    ...itemLines,
    "",
    `Total: ${formatPrice(order.total)}`,
    `Order type: ${order.orderType}`,
    `Date: ${order.pickupDate}`,
    `Time: ${order.pickupTime}`,
    `Payment: ${order.paymentMethod}`,
    `Name: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    order.customerAddress ? `Address: ${order.customerAddress}` : "",
    order.customerNotes ? `Notes: ${order.customerNotes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function createOrder(payload) {
  let createdOrder = null;

  mutateState((draft) => {
    draft.lastOrderNumber += 1;
    const code = `RBJ-${String(draft.lastOrderNumber).padStart(4, "0")}`;
    const now = new Date().toISOString();

    createdOrder = {
      id: code,
      code,
      createdAt: now,
      updatedAt: now,
      status: "NEW",
      history: [
        {
          status: "NEW",
          label: "Order placed",
          timestamp: now,
        },
      ],
      ...payload,
    };

    draft.orders.unshift(createdOrder);
  });

  return createdOrder;
}

export function findOrderByCode(code) {
  return currentState.orders.find((order) => order.code.toUpperCase() === code.trim().toUpperCase()) || null;
}

export function setAdminSession(loggedIn) {
  mutateState((draft) => {
    draft.session.loggedIn = loggedIn;
  });
}

export function loginAdmin(email, password) {
  const valid =
    email.trim().toLowerCase() === business.admin.email &&
    password === business.admin.password;

  if (valid) {
    setAdminSession(true);
  }

  return valid;
}

export function toggleOrderingOpen() {
  mutateState((draft) => {
    draft.settings.orderingOpen = !draft.settings.orderingOpen;
  });
}

export function updateOrderStatus(orderId, nextStatus) {
  mutateState((draft) => {
    const order = draft.orders.find((entry) => entry.id === orderId);
    if (!order || order.status === nextStatus) return;

    order.status = nextStatus;
    order.updatedAt = new Date().toISOString();
    order.history.unshift({
      status: nextStatus,
      label: `Seller updated order to ${nextStatus}`,
      timestamp: order.updatedAt,
    });
  });
}

export function toggleProductEnabled(productId) {
  mutateState((draft) => {
    const product = draft.products.find((entry) => entry.id === productId);
    if (!product) return;
    product.enabled = !product.enabled;
  });
}

export function toggleProductSoldOut(productId) {
  mutateState((draft) => {
    const product = draft.products.find((entry) => entry.id === productId);
    if (!product) return;
    product.soldOut = !product.soldOut;
  });
}

export function toggleOptionAvailability(groupId, optionValue) {
  mutateState((draft) => {
    const group = draft.choiceGroups[groupId];
    const option = group?.options.find((entry) => entry.value === optionValue);
    if (!option) return;
    option.available = !option.available;
  });
}

export function addProduct(productInput) {
  mutateState((draft) => {
    draft.lastProductNumber += 1;

    const idBase = slugify(productInput.name) || "custom-product";
    draft.products.push({
      id: `${idBase}-${draft.lastProductNumber}`,
      name: productInput.name.trim(),
      category: productInput.category.trim(),
      price: Number(productInput.price),
      description: productInput.description.trim(),
      image: productInput.image.trim() || menuImages.roastDisplay,
      enabled: Boolean(productInput.enabled),
      soldOut: Boolean(productInput.soldOut),
      choices: productInput.choices,
    });
  });
}

export function getTodayOrders(state = currentState) {
  return state.orders.filter((order) => isToday(order.createdAt));
}

export function getTodayRevenue(state = currentState) {
  return getTodayOrders(state)
    .filter((order) => revenueStatuses.has(order.status))
    .reduce((sum, order) => sum + order.total, 0);
}

export function resetPlatformState() {
  currentState = buildInitialState();
  persistState();
}

export { STORAGE_KEY };
