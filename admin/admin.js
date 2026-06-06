import {
  addProduct,
  formatDateTime,
  formatPrice,
  getCategories,
  getState,
  getTodayOrders,
  getTodayRevenue,
  loginAdmin,
  orderStatuses,
  setAdminSession,
  subscribe,
  toggleOptionAvailability,
  toggleOrderingOpen,
  toggleProductEnabled,
  toggleProductSoldOut,
  updateOrderStatus,
} from "../shared/platform-store.js";

const authSection = document.querySelector("#authSection");
const consoleSection = document.querySelector("#consoleSection");
const loginForm = document.querySelector("#loginForm");
const loginError = document.querySelector("#loginError");
const statsGrid = document.querySelector("#statsGrid");
const adminOrders = document.querySelector("#adminOrders");
const adminProductList = document.querySelector("#adminProductList");
const adminOptionList = document.querySelector("#adminOptionList");
const toggleOrderingButton = document.querySelector("#toggleOrderingButton");
const logoutButton = document.querySelector("#logoutButton");
const addProductForm = document.querySelector("#addProductForm");
const categorySuggestions = document.querySelector("#categorySuggestions");
const productChoiceFieldset = document.querySelector("#productChoiceFieldset");

function renderAuth(state) {
  const loggedIn = Boolean(state.session.loggedIn);
  authSection.hidden = loggedIn;
  consoleSection.hidden = !loggedIn;
}

function renderStats(state) {
  const todayOrders = getTodayOrders(state);
  const activeOrders = todayOrders.filter((order) =>
    ["NEW", "ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(order.status),
  ).length;
  const soldOutProducts = state.products.filter((product) => product.soldOut || !product.enabled).length;
  const completedOrders = todayOrders.filter((order) => order.status === "DONE").length;

  statsGrid.innerHTML = `
    <article class="stat-card">
      <span>Today revenue</span>
      <strong>${formatPrice(getTodayRevenue(state))}</strong>
      <small>Based on active seller-managed orders today</small>
    </article>
    <article class="stat-card">
      <span>Active orders</span>
      <strong>${activeOrders}</strong>
      <small>Still moving through the kitchen or delivery flow</small>
    </article>
    <article class="stat-card">
      <span>Completed today</span>
      <strong>${completedOrders}</strong>
      <small>Orders marked done today</small>
    </article>
    <article class="stat-card">
      <span>Attention items</span>
      <strong>${soldOutProducts}</strong>
      <small>Products disabled or sold out</small>
    </article>
  `;

  toggleOrderingButton.textContent = state.settings.orderingOpen ? "Pause ordering" : "Resume ordering";
}

function renderOrders(state) {
  const todayOrders = getTodayOrders(state);

  if (!todayOrders.length) {
    adminOrders.innerHTML = '<div class="empty-panel">No orders yet today.</div>';
    return;
  }

  adminOrders.innerHTML = todayOrders
    .map(
      (order) => `
        <article class="order-card">
          <div class="order-card-head">
            <div>
              <p class="eyebrow">Order ${order.code}</p>
              <h4>${order.customerName}</h4>
            </div>
            <span class="status-pill">${order.status}</span>
          </div>
          <p class="order-meta">${order.orderType} • ${formatPrice(order.total)} • ${formatDateTime(order.createdAt)}</p>
          <p class="order-meta">${order.customerPhone}${order.customerAddress ? ` • ${order.customerAddress}` : ""}</p>
          <ul class="order-items">
            ${order.items
              .map(
                (item) => `
                  <li>
                    <strong>${item.quantity} x ${item.name}</strong>
                    ${item.choicesText ? `<span>${item.choicesText}</span>` : ""}
                  </li>
                `,
              )
              .join("")}
          </ul>
          <label class="status-control">
            Update status
            <select data-order-status="${order.id}">
              ${orderStatuses
                .map(
                  (status) => `
                    <option value="${status}" ${order.status === status ? "selected" : ""}>
                      ${status}
                    </option>
                  `,
                )
                .join("")}
            </select>
          </label>
        </article>
      `,
    )
    .join("");
}

function renderProducts(state) {
  adminProductList.innerHTML = state.products
    .map(
      (product) => `
        <article class="product-row">
          <div>
            <strong>${product.name}</strong>
            <span>${product.category} • ${formatPrice(product.price)}</span>
          </div>
          <div class="row-actions">
            <button class="mini-button ${product.enabled ? "active" : ""}" type="button" data-toggle-enabled="${product.id}">
              ${product.enabled ? "Enabled" : "Disabled"}
            </button>
            <button class="mini-button ${product.soldOut ? "warn" : ""}" type="button" data-toggle-soldout="${product.id}">
              ${product.soldOut ? "Sold out" : "Mark sold out"}
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
          <h4>${group.label}</h4>
          <div class="option-chip-row">
            ${group.options
              .map(
                (option) => `
                  <button
                    class="option-toggle ${option.available ? "available" : "sold"}"
                    type="button"
                    data-option-group="${group.id}"
                    data-option-value="${option.value}"
                  >
                    ${option.value}
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
    .map((category) => `<option value="${category}"></option>`)
    .join("");

  productChoiceFieldset.innerHTML = `
    <legend>Attach option groups</legend>
    ${Object.values(state.choiceGroups)
      .filter((group) => group.id !== "roastMeatCombo")
      .map(
        (group) => `
          <label class="toggle-row">
            <input type="checkbox" name="productChoiceGroup" value="${group.id}" />
            ${group.label}
          </label>
        `,
      )
      .join("")}
  `;
}

function renderAll(state = getState()) {
  renderAuth(state);
  if (!state.session.loggedIn) return;
  renderStats(state);
  renderOrders(state);
  renderProducts(state);
  renderOptions(state);
  renderAddProductForm(state);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#loginEmail").value.trim().toLowerCase();
  const password = document.querySelector("#loginPassword").value;

  const success = loginAdmin(email, password);
  loginError.hidden = success;
  if (success) renderAll();
});

toggleOrderingButton.addEventListener("click", () => {
  toggleOrderingOpen();
});

logoutButton.addEventListener("click", () => {
  setAdminSession(false);
});

adminOrders.addEventListener("change", (event) => {
  const select = event.target.closest("[data-order-status]");
  if (!select) return;
  updateOrderStatus(select.dataset.orderStatus, select.value);
});

adminProductList.addEventListener("click", (event) => {
  const enabledButton = event.target.closest("[data-toggle-enabled]");
  const soldOutButton = event.target.closest("[data-toggle-soldout]");

  if (enabledButton) toggleProductEnabled(enabledButton.dataset.toggleEnabled);
  if (soldOutButton) toggleProductSoldOut(soldOutButton.dataset.toggleSoldout);
});

adminOptionList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-option-group][data-option-value]");
  if (!button) return;
  toggleOptionAvailability(button.dataset.optionGroup, button.dataset.optionValue);
});

addProductForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const choices = [...document.querySelectorAll("input[name='productChoiceGroup']:checked")].map(
    (input) => input.value,
  );

  addProduct({
    name: document.querySelector("#productName").value,
    category: document.querySelector("#productCategory").value,
    price: document.querySelector("#productPrice").value,
    description: document.querySelector("#productDescription").value,
    image: document.querySelector("#productImage").value,
    enabled: document.querySelector("#productEnabled").checked,
    soldOut: document.querySelector("#productSoldOut").checked,
    choices,
  });

  addProductForm.reset();
  document.querySelector("#productEnabled").checked = true;
});

subscribe((state) => {
  renderAll(state);
});

renderAll();
