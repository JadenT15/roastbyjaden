import {
  business,
  buildWhatsAppUrl,
  formatChoiceSummary,
  formatDateTime,
  formatPrice,
  getBusinessDateLabel,
  getBusinessDayKey,
  getCategories,
  getChoiceGroupsForProduct,
  getComboGroupForProduct,
  getFirstAvailableOption,
  getState as getLocalState,
  isProductAvailable,
  isToday,
  createOrder as createLocalOrder,
  findOrderByCode as findLocalOrderByCode,
  orderStatuses,
} from "./platform-store.js";

const REMOTE_API_BASE_URL = "https://roastbyjaden-seller-admin.vercel.app";
const LOCAL_API_BASE_URL = "http://127.0.0.1:8080";
const IS_LOCAL_PREVIEW =
  window.location.protocol === "file:" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost";

const API_BASE_URL =
  window.ROAST_API_BASE_URL ||
  (IS_LOCAL_PREVIEW
    ? LOCAL_API_BASE_URL
    : window.localStorage.getItem("ROAST_API_BASE_URL") || REMOTE_API_BASE_URL);

let currentState = {
  settings: { orderingOpen: true, businessOpen: true },
  session: { loggedIn: false },
  choiceGroups: {},
  products: [],
  orders: [],
};

const listeners = new Set();
let usingLocalFallback = false;

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function emitChange() {
  const snapshot = getState();
  listeners.forEach((listener) => listener(snapshot));
}

async function apiFetch(path, options = {}) {
  if (typeof window.fetch !== "function") {
    return apiXHR(path, options);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(payload?.error || "The server could not complete that action.", response.status);
  }

  return payload;
}

function apiXHR(path, options = {}) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(options.method || "GET", `${API_BASE_URL}${path}`);
    request.withCredentials = true;
    request.setRequestHeader("Content-Type", "application/json");
    Object.entries(options.headers || {}).forEach(([key, value]) => {
      request.setRequestHeader(key, value);
    });

    request.onload = () => {
      const contentType = request.getResponseHeader("content-type") || "";
      const payload = contentType.includes("application/json") && request.responseText
        ? JSON.parse(request.responseText)
        : null;

      if (request.status < 200 || request.status >= 300) {
        reject(new ApiError(payload?.error || "The server could not complete that action.", request.status));
        return;
      }

      resolve(payload);
    };

    request.onerror = () => {
      reject(new ApiError("The cloud order system is not reachable.", 0));
    };

    request.send(options.body || null);
  });
}

function normalizeState(state) {
  return {
    settings: {
      orderingOpen: Boolean(state?.settings?.orderingOpen),
      businessOpen: state?.settings?.businessOpen !== false,
    },
    session: { loggedIn: Boolean(state?.session?.loggedIn) },
    choiceGroups: state?.choiceGroups || {},
    products: Array.isArray(state?.products) ? state.products : [],
    orders: Array.isArray(state?.orders) ? state.orders : [],
  };
}

function replaceState(nextState) {
  currentState = normalizeState({ ...currentState, ...nextState });
  emitChange();
}

function replaceWithLocalState() {
  usingLocalFallback = true;
  replaceState(getLocalState());
}

export async function loadPublicState() {
  try {
    const state = await apiFetch("/api/menu");
    usingLocalFallback = false;
    replaceState({ ...state, orders: currentState.orders });
  } catch (error) {
    replaceWithLocalState();
  }
  return getState();
}

export async function loadAdminState() {
  const [state, orders] = await Promise.all([apiFetch("/api/menu"), apiFetch("/api/admin/orders")]);
  replaceState({
    ...state,
    orders,
    session: { loggedIn: true },
  });
  return getState();
}

export function getState() {
  return deepClone(currentState);
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function createOrder(payload) {
  if (usingLocalFallback) {
    throw new ApiError("云端订单系统未连接，订单没有发送到商家后台。请刷新页面后再试。", 0);
  }

  const order = await apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  replaceState({ orders: [order, ...currentState.orders] });
  return order;
}

export async function fetchOrderByCode(code) {
  if (usingLocalFallback) {
    const localOrder = findLocalOrderByCode(code);
    if (!localOrder) throw new ApiError("We could not find that code yet.", 404);
    replaceWithLocalState();
    return localOrder;
  }

  let order;
  try {
    order = await apiFetch(`/api/orders/${encodeURIComponent(code.trim())}`);
  } catch (error) {
    const localOrder = findLocalOrderByCode(code);
    if (!localOrder) throw error;
    replaceWithLocalState();
    return localOrder;
  }
  const others = currentState.orders.filter((entry) => entry.code !== order.code);
  replaceState({ orders: [order, ...others] });
  return order;
}

export function findOrderByCode(code) {
  return (
    currentState.orders.find((order) => order.code.toUpperCase() === code.trim().toUpperCase()) || null
  );
}

export async function loginAdmin(email, password) {
  await apiFetch("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  replaceState({ session: { loggedIn: true } });
  await loadAdminState();
  return true;
}

export async function setAdminSession(loggedIn) {
  if (!loggedIn) {
    try {
      await apiFetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Expired sessions should still return the browser to the login screen.
    }
  }
  replaceState({ session: { loggedIn } });
}

export async function restoreAdminSession() {
  try {
    await apiFetch("/api/admin/me");
    replaceState({ session: { loggedIn: true } });
    await loadAdminState();
    return true;
  } catch {
    replaceState({ session: { loggedIn: false } });
    return false;
  }
}

export async function toggleOrderingOpen() {
  const nextValue = !currentState.settings.orderingOpen;
  const settings = await apiFetch("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify({ orderingOpen: nextValue }),
  });
  replaceState({ settings });
}

export async function updateOrderStatus(orderId, nextStatus) {
  const order = await apiFetch(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: nextStatus }),
  });
  const orders = currentState.orders.map((entry) => (entry.id === order.id ? order : entry));
  replaceState({ orders });
}

export async function updateOrderPaymentStatus(orderId, paymentStatus, paymentReference = "") {
  const order = await apiFetch(`/api/admin/orders/${encodeURIComponent(orderId)}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ paymentStatus, paymentReference }),
  });
  const orders = currentState.orders.map((entry) => (entry.id === order.id ? order : entry));
  replaceState({ orders });
}

export async function toggleProductEnabled(productId) {
  const product = currentState.products.find((entry) => entry.id === productId);
  if (!product) return;
  await apiFetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    body: JSON.stringify({ enabled: !product.enabled }),
  });
  await loadAdminState();
}

export async function toggleProductSoldOut(productId) {
  const product = currentState.products.find((entry) => entry.id === productId);
  if (!product) return;
  await apiFetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    body: JSON.stringify({ soldOut: !product.soldOut }),
  });
  await loadAdminState();
}

export async function toggleOptionAvailability(groupId, optionValue) {
  const option = currentState.choiceGroups[groupId]?.options.find((entry) => entry.value === optionValue);
  if (!option?.id) return;
  await apiFetch(`/api/admin/options/${encodeURIComponent(option.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ available: !option.available }),
  });
  await loadAdminState();
}

export async function addProduct(productInput) {
  await apiFetch("/api/admin/products", {
    method: "POST",
    body: JSON.stringify({
      name: productInput.name.trim(),
      category: productInput.category.trim(),
      price: Number(productInput.price),
      description: productInput.description.trim(),
      image: productInput.image.trim(),
      enabled: Boolean(productInput.enabled),
      soldOut: Boolean(productInput.soldOut),
      choices: productInput.choices,
    }),
  });
  await loadAdminState();
}

export function getTodayOrders(state = currentState) {
  return state.orders.filter((order) => isToday(order.createdAt));
}

export function getTodayRevenue(state = currentState) {
  const revenueStatuses = new Set(["ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DONE"]);
  return getTodayOrders(state)
    .filter((order) => revenueStatuses.has(order.status))
    .reduce((sum, order) => sum + order.total, 0);
}

export {
  API_BASE_URL,
  business,
  buildWhatsAppUrl,
  formatChoiceSummary,
  formatDateTime,
  formatPrice,
  getBusinessDateLabel,
  getBusinessDayKey,
  getCategories,
  getChoiceGroupsForProduct,
  getComboGroupForProduct,
  getFirstAvailableOption,
  isProductAvailable,
  orderStatuses,
};
