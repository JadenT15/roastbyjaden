import {
  addProduct,
  formatDateTime,
  formatPrice,
  getCategories,
  getState,
  getTodayOrders,
  loginAdmin,
  loadAdminState,
  restoreAdminSession,
  setAdminSession,
  subscribe,
  toggleBusinessOpen,
  toggleOptionAvailability,
  toggleOrderingOpen,
  toggleProductEnabled,
  toggleProductSoldOut,
  updateOrderStatus,
} from "./shared/api-store.js?v=20260608-seller-vercel";

const sellerFlow = [
  { status: "NEW", label: "新订单", note: "系统自动接单", icon: "01" },
  { status: "ACCEPTED", label: "已接单", note: "商家确认订单", icon: "02" },
  { status: "PREPARING", label: "制作中", note: "开始制作", icon: "03" },
  { status: "READY", label: "制作完成", note: "准备打包", icon: "04" },
  { status: "PACKING", label: "打包中", note: "准备交付", icon: "05" },
  { status: "OUT_FOR_DELIVERY", label: "配送中", note: "骑手取餐", icon: "06" },
  { status: "DONE", label: "已送达", note: "订单完成", icon: "07" },
];

const statusLabels = sellerFlow.reduce(
  (labels, step) => ({ ...labels, [step.status]: step.label }),
  { CANCELLED: "已取消" },
);

const authSection = document.querySelector("#authSection");
const consoleSection = document.querySelector("#consoleSection");
const loginForm = document.querySelector("#loginForm");
const loginError = document.querySelector("#loginError");
const statsGrid = document.querySelector("#statsGrid");
const flowSteps = document.querySelector("#flowSteps");
const adminOrders = document.querySelector("#adminOrders");
const selectedOrderPanel = document.querySelector("#selectedOrder");
const adminProductList = document.querySelector("#adminProductList");
const adminOptionList = document.querySelector("#adminOptionList");
const openBusinessButton = document.querySelector("#openBusinessButton");
const closeBusinessButton = document.querySelector("#closeBusinessButton");
const openOrderingButton = document.querySelector("#openOrderingButton");
const closeOrderingButton = document.querySelector("#closeOrderingButton");
const refreshButton = document.querySelector("#refreshButton");
const logoutButton = document.querySelector("#logoutButton");
const addProductForm = document.querySelector("#addProductForm");
const categorySuggestions = document.querySelector("#categorySuggestions");
const choiceGroupSuggestions = document.querySelector("#choiceGroupSuggestions");

let selectedOrderId = "";
let refreshTimer = null;

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getStatusLabel(status) {
  return statusLabels[status] || status;
}

function getVisibleStatuses() {
  return sellerFlow.map((step) => step.status);
}

function getStatusIndex(status) {
  return sellerFlow.findIndex((step) => step.status === status);
}

function getNextOrderStep(status) {
  const currentIndex = getStatusIndex(status);
  if (currentIndex < 0 || currentIndex >= sellerFlow.length - 1) return null;
  const nextStep = sellerFlow[currentIndex + 1];
  const actionLabels = {
    ACCEPTED: "接单",
    PREPARING: "开始制作",
    READY: "制作完成",
    PACKING: "开始打包",
    OUT_FOR_DELIVERY: "开始配送",
    DONE: "完成订单",
  };
  return {
    ...nextStep,
    actionLabel: actionLabels[nextStep.status] || `设为${nextStep.label}`,
  };
}

function getSelectedOrder(state) {
  const todayOrders = getTodayOrders(state);
  if (!todayOrders.length) return null;
  return todayOrders.find((order) => order.id === selectedOrderId) || todayOrders[0];
}

function getSellerRevenue(state) {
  const revenueStatuses = new Set(["ACCEPTED", "PREPARING", "READY", "PACKING", "OUT_FOR_DELIVERY", "DONE"]);
  return getTodayOrders(state)
    .filter((order) => revenueStatuses.has(order.status))
    .reduce((sum, order) => sum + order.total, 0);
}

function renderAuth(state) {
  const loggedIn = Boolean(state.session.loggedIn);
  authSection.hidden = loggedIn;
  consoleSection.hidden = !loggedIn;

  if (loggedIn && !refreshTimer) {
    refreshTimer = window.setInterval(() => {
      loadAdminState().catch(() => {});
    }, 15000);
  }

  if (!loggedIn && refreshTimer) {
    window.clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

function renderStats(state) {
  const todayOrders = getTodayOrders(state);
  const activeOrders = todayOrders.filter((order) =>
    ["NEW", "ACCEPTED", "PREPARING", "READY", "PACKING", "OUT_FOR_DELIVERY"].includes(order.status),
  ).length;
  const soldOutProducts = state.products.filter((product) => product.soldOut || !product.enabled).length;
  const completedOrders = todayOrders.filter((order) => order.status === "DONE").length;

  statsGrid.innerHTML = `
    <article class="stat-card">
      <span>今日营业额</span>
      <strong>${formatPrice(getSellerRevenue(state))}</strong>
      <small>已接单、制作、配送、完成订单都会计入</small>
    </article>
    <article class="stat-card">
      <span>进行中订单</span>
      <strong>${activeOrders}</strong>
      <small>厨房或配送还在处理的订单</small>
    </article>
    <article class="stat-card">
      <span>今日完成</span>
      <strong>${completedOrders}</strong>
      <small>已送达 / 已完成</small>
    </article>
    <article class="stat-card">
      <span>需注意商品</span>
      <strong>${soldOutProducts}</strong>
      <small>暂不售卖或已下架</small>
    </article>
  `;

  openOrderingButton.classList.toggle("active", state.settings.orderingOpen);
  closeOrderingButton.classList.toggle("active", !state.settings.orderingOpen);
  openOrderingButton.setAttribute("aria-pressed", String(state.settings.orderingOpen));
  closeOrderingButton.setAttribute("aria-pressed", String(!state.settings.orderingOpen));
  openBusinessButton.classList.toggle("active", state.settings.businessOpen);
  closeBusinessButton.classList.toggle("active", !state.settings.businessOpen);
  openBusinessButton.setAttribute("aria-pressed", String(state.settings.businessOpen));
  closeBusinessButton.setAttribute("aria-pressed", String(!state.settings.businessOpen));
}

function renderFlowSteps(state) {
  const selectedOrder = getSelectedOrder(state);
  const currentIndex = selectedOrder ? getStatusIndex(selectedOrder.status) : -1;

  if (!selectedOrder) {
    flowSteps.innerHTML = '<div class="empty-panel flow-empty">有新订单后，商家可以在这里点击流程卡片更新状态。</div>';
    return;
  }

  flowSteps.innerHTML = sellerFlow
    .map((step, index) => {
      const complete = currentIndex >= index;
      const current = selectedOrder?.status === step.status;
      return `
        <button
          class="flow-step ${complete ? "complete" : ""} ${current ? "current" : ""}"
          type="button"
          data-order-status="${selectedOrder.id}"
          data-next-status="${step.status}"
        >
          <div class="flow-icon" aria-hidden="true">${step.icon}</div>
          <strong>${step.label}</strong>
          <span>${step.note}</span>
          <small>${current ? "当前状态" : "点我设为此状态"}</small>
        </button>
      `;
    })
    .join("");
}

function renderOrders(state) {
  const todayOrders = getTodayOrders(state);

  if (!todayOrders.length) {
    selectedOrderId = "";
    adminOrders.innerHTML = '<div class="empty-panel">今天还没有订单。</div>';
    return;
  }

  const selectedOrder = getSelectedOrder(state);
  selectedOrderId = selectedOrder.id;

  adminOrders.innerHTML = `
    <div class="orders-table-wrap">
      <table class="orders-table">
        <thead>
          <tr>
            <th>订单</th>
            <th>买家</th>
            <th>电话</th>
            <th>金额</th>
            <th>时间</th>
            <th>商品内容</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${todayOrders
            .map((order) => {
              const nextStep = getNextOrderStep(order.status);
              const itemsText = order.items
                .map((item) => {
                  const choices = item.choicesText ? `（${item.choicesText}）` : "";
                  return `${item.quantity} x ${item.name}${choices}`;
                })
                .join("，");
              return `
                <tr class="${order.id === selectedOrderId ? "selected" : ""}" data-select-order="${order.id}">
                  <td data-label="订单"><strong>${escapeHTML(order.code)}</strong></td>
                  <td data-label="买家">${escapeHTML(order.customerName)}</td>
                  <td data-label="电话">${escapeHTML(order.customerPhone)}</td>
                  <td data-label="金额">${formatPrice(order.total)}</td>
                  <td data-label="时间">${formatDateTime(order.createdAt)}</td>
                  <td data-label="商品内容" class="items-cell">${escapeHTML(itemsText)}</td>
                  <td data-label="状态">
                    <span class="status-pill status-${order.status.toLowerCase()}">${getStatusLabel(order.status)}</span>
                  </td>
                  <td data-label="操作">
                    ${
                      nextStep
                        ? `<button class="next-step-button" type="button" data-order-status="${order.id}" data-next-status="${nextStep.status}">${nextStep.actionLabel}</button>`
                        : `<span class="done-label">${order.status === "CANCELLED" ? "已取消" : "已完成"}</span>`
                    }
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSelectedOrder(state) {
  const order = getSelectedOrder(state);

  if (!order) {
    selectedOrderPanel.innerHTML = '<div class="empty-panel">选择订单后，可以在这里更新制作进度。</div>';
    return;
  }

  selectedOrderId = order.id;
  const statusIndex = getStatusIndex(order.status);
  const notifyText = encodeURIComponent(
    `您好，您的订单 ${order.code} 最新状态：${getStatusLabel(order.status)}。`,
  );

  selectedOrderPanel.innerHTML = `
    <div class="selected-order-grid">
      <div>
        <p class="eyebrow">订单号：${escapeHTML(order.code)}</p>
        <h4>${escapeHTML(order.customerName)} (${escapeHTML(order.customerPhone)})</h4>
        <p>商品：${order.items.map((item) => `${item.quantity} x ${escapeHTML(item.name)}`).join("，")}</p>
        <p>总额：${formatPrice(order.total)}</p>
        <p>配送方式：${escapeHTML(order.orderType)} · ${escapeHTML(order.pickupDate)} ${escapeHTML(order.pickupTime)}</p>
        ${order.customerAddress ? `<p>地址：${escapeHTML(order.customerAddress)}</p>` : ""}
        ${order.customerNotes ? `<p>备注：${escapeHTML(order.customerNotes)}</p>` : ""}
      </div>
      <div class="status-action-panel">
        <div class="status-rail">
          ${sellerFlow
            .map(
              (step, index) => `
                <span class="${index <= statusIndex ? "done" : ""} ${order.status === step.status ? "now" : ""}">
                  ${step.label}
                </span>
              `,
            )
            .join("")}
        </div>
        <div class="status-buttons">
          ${getVisibleStatuses()
            .map(
              (status) => `
                <button
                  class="status-button ${status === order.status ? "current" : ""}"
                  type="button"
                  data-order-status="${order.id}"
                  data-next-status="${status}"
                >
                  设为${getStatusLabel(status)}
                </button>
              `,
            )
            .join("")}
          <button
            class="status-button cancel"
            type="button"
            data-order-status="${order.id}"
            data-next-status="CANCELLED"
          >
            取消订单
          </button>
        </div>
        <a class="whatsapp-preview" href="https://wa.me/${escapeHTML(order.customerPhone.replace(/\D/g, ""))}?text=${notifyText}" target="_blank" rel="noreferrer">
          WhatsApp 通知预览
        </a>
      </div>
    </div>
  `;
}

function renderProducts(state) {
  adminProductList.innerHTML = state.products
    .map(
      (product) => `
        <article class="product-row">
          <div>
            <strong>${escapeHTML(product.name)}</strong>
            <span>${escapeHTML(product.category)} · ${formatPrice(product.price)}</span>
          </div>
          <div class="row-actions">
            <button class="mini-button ${product.enabled ? "active" : ""}" type="button" data-toggle-enabled="${product.id}">
              ${product.enabled ? "已上架" : "已下架"}
            </button>
            <button class="mini-button ${product.soldOut ? "warn" : ""}" type="button" data-toggle-soldout="${product.id}">
              ${product.soldOut ? "暂不售卖" : "标记暂不售卖"}
            </button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderOptions(state) {
  adminOptionList.innerHTML = Object.values(state.choiceGroups)
    .map(
      (group) => `
        <article class="option-group-card">
          <h4>${escapeHTML(group.label)}</h4>
          <div class="option-chip-row">
            ${group.options
              .map(
                (option) => `
                  <button
                    class="option-toggle ${option.available ? "available" : "sold"}"
                    type="button"
                    data-option-group="${group.id}"
                    data-option-value="${escapeHTML(option.value)}"
                  >
                    ${escapeHTML(option.value)} · ${option.available ? "供应中" : "暂停"}
                  </button>
                `,
              )
              .join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderAddProductForm(state) {
  categorySuggestions.innerHTML = [...new Set(getCategories(state).filter((category) => category !== "All"))]
    .map((category) => `<option value="${escapeHTML(category)}"></option>`)
    .join("");

  choiceGroupSuggestions.innerHTML = Object.values(state.choiceGroups)
    .filter((group) => group.id !== "roastMeatCombo")
    .map((group) => `<option value="${escapeHTML(group.label)}"></option>`)
    .join("");
}

function getTypedChoiceGroups(state) {
  const input = document.querySelector("#productChoicesText").value.trim();
  if (!input) return [];

  const availableGroups = Object.values(state.choiceGroups).filter((group) => group.id !== "roastMeatCombo");
  const groupLookup = new Map();
  availableGroups.forEach((group) => {
    groupLookup.set(group.id.toLowerCase(), group.id);
    groupLookup.set(group.label.toLowerCase(), group.id);
  });

  const parts = input
    .split(/[\n,，、]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const unknownParts = parts.filter((part) => !groupLookup.has(part.toLowerCase()));
  if (unknownParts.length) {
    throw new Error(`找不到这个规格：${unknownParts.join("、")}。请用后台已有的规格名称。`);
  }

  return [...new Set(parts.map((part) => groupLookup.get(part.toLowerCase())))];
}

function renderAll(state = getState()) {
  renderAuth(state);
  if (!state.session.loggedIn) return;
  renderStats(state);
  renderOrders(state);
  renderFlowSteps(state);
  renderSelectedOrder(state);
  renderProducts(state);
  renderOptions(state);
  renderAddProductForm(state);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.querySelector("#loginEmail").value.trim().toLowerCase();
  const password = document.querySelector("#loginPassword").value;

  try {
    await loginAdmin(email, password);
    loginError.hidden = true;
  } catch {
    loginError.hidden = false;
  }
});

refreshButton.addEventListener("click", async () => {
  refreshButton.disabled = true;
  try {
    await loadAdminState();
  } catch (error) {
    alert(error.message || "订单刷新失败。");
  } finally {
    refreshButton.disabled = false;
  }
});

async function setOrderingOpen(nextOpen) {
  const currentOpen = getState().settings.orderingOpen;
  if (currentOpen === nextOpen) return;
  openOrderingButton.disabled = true;
  closeOrderingButton.disabled = true;
  try {
    await toggleOrderingOpen();
  } catch (error) {
    alert(error.message || "接单状态更新失败。");
  } finally {
    openOrderingButton.disabled = false;
    closeOrderingButton.disabled = false;
  }
}

async function setBusinessOpen(nextOpen) {
  const currentOpen = getState().settings.businessOpen;
  if (currentOpen === nextOpen) return;
  openBusinessButton.disabled = true;
  closeBusinessButton.disabled = true;
  try {
    await toggleBusinessOpen();
  } catch (error) {
    alert(error.message || "营业状态更新失败。");
  } finally {
    openBusinessButton.disabled = false;
    closeBusinessButton.disabled = false;
  }
}

openOrderingButton.addEventListener("click", () => {
  setOrderingOpen(true);
});

closeOrderingButton.addEventListener("click", () => {
  setOrderingOpen(false);
});

openBusinessButton.addEventListener("click", () => {
  setBusinessOpen(true);
});

closeBusinessButton.addEventListener("click", () => {
  setBusinessOpen(false);
});

logoutButton.addEventListener("click", async () => {
  try {
    await setAdminSession(false);
  } catch {
    renderAll({ ...getState(), session: { loggedIn: false } });
  }
});

adminOrders.addEventListener("click", (event) => {
  if (event.target.closest("[data-order-status][data-next-status]")) return;
  const card = event.target.closest("[data-select-order]");
  if (!card) return;
  selectedOrderId = card.dataset.selectOrder;
  renderAll();
});

async function handleOrderStatusClick(event) {
  const button = event.target.closest("[data-order-status][data-next-status]");
  if (!button) return;
  button.disabled = true;
  try {
    await updateOrderStatus(button.dataset.orderStatus, button.dataset.nextStatus);
  } catch (error) {
    alert(error.message || "订单状态更新失败。");
    await loadAdminState();
  } finally {
    button.disabled = false;
  }
}

flowSteps.addEventListener("click", handleOrderStatusClick);
adminOrders.addEventListener("click", handleOrderStatusClick);
selectedOrderPanel.addEventListener("click", handleOrderStatusClick);

adminProductList.addEventListener("click", async (event) => {
  const enabledButton = event.target.closest("[data-toggle-enabled]");
  const soldOutButton = event.target.closest("[data-toggle-soldout]");

  try {
    if (enabledButton) await toggleProductEnabled(enabledButton.dataset.toggleEnabled);
    if (soldOutButton) await toggleProductSoldOut(soldOutButton.dataset.toggleSoldout);
  } catch (error) {
    alert(error.message || "商品更新失败。");
  }
});

adminOptionList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-option-group][data-option-value]");
  if (!button) return;
  button.disabled = true;
  try {
    await toggleOptionAvailability(button.dataset.optionGroup, button.dataset.optionValue);
  } catch (error) {
    alert(error.message || "规格选项更新失败。");
  } finally {
    button.disabled = false;
  }
});

addProductForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const choices = getTypedChoiceGroups(getState());
    await addProduct({
      name: document.querySelector("#productName").value,
      category: document.querySelector("#productCategory").value,
      price: document.querySelector("#productPrice").value,
      description: document.querySelector("#productDescription").value,
      image: "",
      enabled: document.querySelector("#productEnabled").checked,
      soldOut: document.querySelector("#productSoldOut").checked,
      choices,
    });

    addProductForm.reset();
    document.querySelector("#productEnabled").checked = true;
  } catch (error) {
    alert(error.message || "新增商品失败。");
  }
});

subscribe((state) => {
  renderAll(state);
});

renderAll();

try {
  await restoreAdminSession();
} catch {
  loginError.hidden = true;
}
