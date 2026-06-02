import {
  buildWhatsAppUrl,
  createOrder,
  findOrderByCode,
  formatChoiceSummary,
  formatPrice,
  getBusinessDateLabel,
  getCategories,
  getChoiceGroupsForProduct,
  getComboGroupForProduct,
  getFirstAvailableOption,
  getState,
  isProductAvailable,
  subscribe,
} from "./shared/platform-store.js";

const cart = new Map();
let activeCategory = "All";
let latestOrderCode = "";
let trackedOrderCode = "";

const categoryTabs = document.querySelector("#categoryTabs");
const menuGrid = document.querySelector("#menuGrid");
const cartList = document.querySelector("#cartList");
const cartEmpty = document.querySelector("#cartEmpty");
const cartTotal = document.querySelector("#cartTotal");
const mobileCartCount = document.querySelector("#mobileCartCount");
const pickupDateOptions = document.querySelector("#pickupDateOptions");
const orderForm = document.querySelector("#orderForm");
const placeOrderButton = document.querySelector("#placeOrderButton");
const orderFormNote = document.querySelector("#orderFormNote");
const latestOrder = document.querySelector("#latestOrder");
const latestOrderCodeLabel = document.querySelector("#latestOrderCode");
const latestOrderSummary = document.querySelector("#latestOrderSummary");
const latestOrderTrackLink = document.querySelector("#latestOrderTrackLink");
const latestOrderWhatsappLink = document.querySelector("#latestOrderWhatsappLink");
const storeStatusHero = document.querySelector("#storeStatusHero");
const storeNotice = document.querySelector("#storeNotice");
const trackForm = document.querySelector("#trackForm");
const trackCodeInput = document.querySelector("#trackCodeInput");
const trackResult = document.querySelector("#trackResult");

function getVisibleProducts(state) {
  const products =
    activeCategory === "All"
      ? state.products
      : state.products.filter((product) => product.category === activeCategory);

  return [...products].sort((left, right) => {
    if (left.enabled === right.enabled) return left.name.localeCompare(right.name, "zh");
    return left.enabled ? -1 : 1;
  });
}

function getDefaultChoices(product, state) {
  const choices = getChoiceGroupsForProduct(product, state).map((group) => {
    const firstAvailable = getFirstAvailableOption(group);
    return {
      label: group.label,
      value: firstAvailable?.value || "",
      price: firstAvailable?.price,
    };
  });

  const comboGroup = getComboGroupForProduct(product, state);
  if (comboGroup) {
    choices.push({
      label: comboGroup.label,
      value: comboGroup.options
        .filter((option) => option.available)
        .slice(0, comboGroup.count)
        .map((option) => option.value),
    });
  }

  return choices;
}

function getSelectedChoices(product, state) {
  const choices = getChoiceGroupsForProduct(product, state).map((group) => {
    const selected = document.querySelector(`input[name="${product.id}-${group.id}"]:checked`);
    const fallback = getFirstAvailableOption(group);

    return {
      label: group.label,
      value: selected?.value || fallback?.value || "",
      price: selected?.dataset.price ? Number(selected.dataset.price) : fallback?.price,
    };
  });

  const comboGroup = getComboGroupForProduct(product, state);
  if (comboGroup) {
    const inputs = [...document.querySelectorAll(`input[name="${product.id}-${comboGroup.id}"]`)];
    choices.push({
      label: comboGroup.label,
      value: inputs.filter((input) => input.checked).map((input) => input.value),
    });
  }

  return choices;
}

function getCartKey(product, choices) {
  const choiceKey = choices
    .map((choice) => {
      const value = Array.isArray(choice.value) ? choice.value.join(",") : choice.value;
      return `${choice.label}:${value}`;
    })
    .join("|");

  return `${product.id}|${choiceKey}`;
}

function getItemPrice(product, choices) {
  const override = choices.find((choice) => Number.isFinite(choice.price));
  return override?.price || product.price;
}

function getCartQuantity(product, choices) {
  return cart.get(getCartKey(product, choices))?.quantity || 0;
}

function getCartItems(state) {
  return [...cart.values()]
    .map((entry) => {
      const product = state.products.find((item) => item.id === entry.productId);
      return product ? { ...entry, product } : null;
    })
    .filter(Boolean);
}

function getCartTotal(state) {
  return getCartItems(state).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

function renderPickupDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const labels = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + index);
    if (index === 0) return `Today, ${getBusinessDateLabel(date)}`;
    if (index === 1) return `Tomorrow, ${getBusinessDateLabel(date)}`;
    return getBusinessDateLabel(date);
  });

  pickupDateOptions.innerHTML = `
    <legend>Pickup / delivery date</legend>
    ${labels
      .map(
        (label, index) => `
          <label class="time-chip">
            <input
              type="radio"
              name="pickupDate"
              value="${label}"
              ${index === 0 ? "checked" : ""}
            />
            ${label}
          </label>
        `,
      )
      .join("")}
  `;
}

function renderCategories(state) {
  categoryTabs.innerHTML = getCategories(state)
    .map(
      (category) => `
        <button class="${category === activeCategory ? "active" : ""}" data-category="${category}">
          ${category}
        </button>
      `,
    )
    .join("");
}

function renderChoiceGroup(product, group) {
  const firstAvailable = getFirstAvailableOption(group);

  return `
    <fieldset class="choice-group">
      <legend>${group.label}</legend>
      <div class="choice-options">
        ${group.options
          .map((option) => {
            const checked = firstAvailable?.value === option.value ? "checked" : "";
            const disabled = option.available ? "" : "disabled";

            return `
              <label class="choice-chip ${option.available ? "" : "sold-out"}">
                <input
                  type="radio"
                  name="${product.id}-${group.id}"
                  value="${option.value}"
                  ${option.price ? `data-price="${option.price}"` : ""}
                  ${checked}
                  ${disabled}
                />
                ${option.value}${option.price ? ` ${formatPrice(option.price)}` : ""}
                ${option.available ? "" : "<span>Sold Out</span>"}
              </label>
            `;
          })
          .join("")}
      </div>
    </fieldset>
  `;
}

function renderComboGroup(product, group) {
  return `
    <fieldset class="choice-group combo-choice-group" data-combo-group="${product.id}" data-combo-count="${group.count}">
      <legend>${group.label}</legend>
      <div class="choice-options">
        ${group.options
          .map((option, index) => `
            <label class="choice-chip ${option.available ? "" : "sold-out"}">
              <input
                type="checkbox"
                name="${product.id}-${group.id}"
                value="${option.value}"
                ${option.available ? "" : "disabled"}
                ${option.available && index < group.count ? "checked" : ""}
              />
              ${option.value}
              ${option.available ? "" : "<span>Sold Out</span>"}
            </label>
          `)
          .join("")}
      </div>
      <small class="choice-limit" data-combo-hint="${product.id}">Selected ${group.count} / ${group.count}</small>
    </fieldset>
  `;
}

function getProductBadge(product, available) {
  if (!product.enabled) return '<span class="product-badge idle">Unavailable</span>';
  if (!available || product.soldOut) return '<span class="product-badge sold">Sold Out</span>';
  return '<span class="product-badge live">Available</span>';
}

function renderMenu(state) {
  const products = getVisibleProducts(state);

  menuGrid.innerHTML = products
    .map((product) => {
      const available = isProductAvailable(product, state);
      const defaultChoices = getDefaultChoices(product, state);
      const choiceGroups = getChoiceGroupsForProduct(product, state);
      const comboGroup = getComboGroupForProduct(product, state);

      return `
        <article class="menu-card" data-item-card="${product.id}">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <div class="menu-card-body">
            <div class="menu-card-top">
              <div>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
              </div>
              ${getProductBadge(product, available)}
            </div>
            ${choiceGroups.map((group) => renderChoiceGroup(product, group)).join("")}
            ${comboGroup ? renderComboGroup(product, comboGroup) : ""}
            <div class="menu-card-footer">
              <span class="price" data-menu-price="${product.id}">${formatPrice(getItemPrice(product, defaultChoices))}</span>
              ${
                available
                  ? `
                    <div class="menu-quantity" aria-label="${product.name} quantity">
                      <button type="button" data-menu-decrease="${product.id}">-</button>
                      <output data-menu-count="${product.id}">${getCartQuantity(product, defaultChoices)}</output>
                      <button type="button" data-add="${product.id}">+</button>
                    </div>
                  `
                  : '<button class="add-button" type="button" disabled>Not Available</button>'
              }
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  if (!products.length) {
    menuGrid.innerHTML = '<div class="empty-card">No products in this category yet.</div>';
  }

  refreshAllMenuCards(state);
}

function refreshAllMenuCards(state) {
  getVisibleProducts(state).forEach((product) => updateMenuCard(product.id, state));
}

function updateMenuCard(productId, state) {
  const product = state.products.find((entry) => entry.id === productId);
  const card = document.querySelector(`[data-item-card="${productId}"]`);
  if (!product || !card) return;

  const choices = getSelectedChoices(product, state);
  const output = card.querySelector(`[data-menu-count="${productId}"]`);
  const price = card.querySelector(`[data-menu-price="${productId}"]`);

  if (output) output.textContent = getCartQuantity(product, choices);
  if (price) price.textContent = formatPrice(getItemPrice(product, choices));
}

function renderCart(state) {
  const items = getCartItems(state);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  cartEmpty.hidden = items.length > 0;
  cartList.innerHTML = items
    .map(
      (item) => `
        <div class="cart-item">
          <div>
            <strong>${item.product.name}</strong>
            ${item.choicesText ? `<small>${item.choicesText}</small>` : ""}
            <span>${formatPrice(item.unitPrice)} each</span>
          </div>
          <div class="quantity">
            <button type="button" data-decrease="${item.key}">-</button>
            <output>${item.quantity}</output>
            <button type="button" data-increase="${item.key}">+</button>
          </div>
        </div>
      `,
    )
    .join("");

  cartTotal.textContent = formatPrice(getCartTotal(state));
  mobileCartCount.textContent = `${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`;
}

function renderStoreState(state) {
  if (state.settings.orderingOpen) {
    storeStatusHero.textContent = "Open for orders";
    storeNotice.hidden = true;
    placeOrderButton.disabled = false;
    orderFormNote.textContent =
      "Orders are saved in the browser for this MVP and can be managed from the seller portal.";
  } else {
    storeStatusHero.textContent = "Paused by seller";
    storeNotice.hidden = false;
    storeNotice.textContent =
      "The seller has paused ordering for now. You can still browse the menu and track existing orders.";
    placeOrderButton.disabled = true;
    orderFormNote.textContent = "Ordering is currently paused in the seller portal.";
  }
}

function renderLatestOrder(state) {
  if (!latestOrderCode) {
    latestOrder.hidden = true;
    return;
  }

  const order = findOrderByCode(latestOrderCode) || state.orders.find((entry) => entry.code === latestOrderCode);
  if (!order) {
    latestOrder.hidden = true;
    return;
  }

  latestOrder.hidden = false;
  latestOrderCodeLabel.textContent = order.code;
  latestOrderSummary.textContent = `${order.status} • ${formatPrice(order.total)} • ${order.orderType}`;
  latestOrderTrackLink.href = `#track`;
  latestOrderWhatsappLink.href = buildWhatsAppUrl(order);
}

function renderTracking(state) {
  if (!trackedOrderCode) {
    trackResult.className = "track-result empty";
    trackResult.textContent = "Enter your order code to view the latest status.";
    return;
  }

  const order = state.orders.find(
    (entry) => entry.code.toUpperCase() === trackedOrderCode.toUpperCase(),
  );

  if (!order) {
    trackResult.className = "track-result empty";
    trackResult.textContent = "We could not find that code yet.";
    return;
  }

  trackResult.className = "track-result";
  trackResult.innerHTML = `
    <div class="track-card-head">
      <div>
        <p class="eyebrow">Order code</p>
        <h3>${order.code}</h3>
      </div>
      <span class="status-pill">${order.status}</span>
    </div>
    <p class="track-meta">${order.customerName} • ${order.orderType} • ${formatPrice(order.total)}</p>
    <ul class="track-items">
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
    <div class="track-history">
      ${order.history
        .map(
          (entry) => `
            <div class="track-history-row">
              <strong>${entry.status}</strong>
              <span>${new Date(entry.timestamp).toLocaleString("en-MY")}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderAll(state = getState()) {
  renderStoreState(state);
  renderCategories(state);
  renderMenu(state);
  renderCart(state);
  renderLatestOrder(state);
  renderTracking(state);
}

function addToCart(productId) {
  const state = getState();
  const product = state.products.find((entry) => entry.id === productId);
  if (!product || !isProductAvailable(product, state)) return;

  const choices = getSelectedChoices(product, state);
  const comboGroup = getComboGroupForProduct(product, state);
  if (comboGroup) {
    const comboChoice = choices.find((entry) => entry.label === comboGroup.label);
    if (!comboChoice || comboChoice.value.length !== comboGroup.count) {
      alert(`Please select exactly ${comboGroup.count} roast meats.`);
      return;
    }
  }

  const key = getCartKey(product, choices);
  const existing = cart.get(key);

  cart.set(key, {
    key,
    productId,
    quantity: existing ? existing.quantity + 1 : 1,
    unitPrice: getItemPrice(product, choices),
    choices,
    choicesText: formatChoiceSummary(choices),
  });

  renderCart(state);
  updateMenuCard(productId, state);
}

function increaseCartItem(key) {
  const entry = cart.get(key);
  if (!entry) return;
  entry.quantity += 1;
  const state = getState();
  renderCart(state);
  updateMenuCard(entry.productId, state);
}

function decreaseCartItem(key) {
  const entry = cart.get(key);
  if (!entry) return;

  if (entry.quantity === 1) {
    cart.delete(key);
  } else {
    entry.quantity -= 1;
  }

  const state = getState();
  renderCart(state);
  updateMenuCard(entry.productId, state);
}

function handleComboSelection(event) {
  const input = event.target;
  if (input.type !== "checkbox") return;

  const fieldset = input.closest("[data-combo-group]");
  if (!fieldset) return;

  const limit = Number(fieldset.dataset.comboCount);
  const checked = [...fieldset.querySelectorAll("input:checked")];
  if (checked.length > limit) {
    input.checked = false;
    return;
  }

  const hint = fieldset.querySelector("[data-combo-hint]");
  if (hint) {
    hint.textContent = `Selected ${checked.length} / ${limit}`;
  }
}

function clearCartAndForm() {
  cart.clear();
  orderForm.reset();
  renderPickupDates();
}

function collectOrderPayload(state) {
  const customerName = document.querySelector("#customerName").value.trim();
  const customerPhone = document.querySelector("#customerPhone").value.trim();
  const orderType = document.querySelector("input[name='orderType']:checked").value;
  const pickupDate = document.querySelector("input[name='pickupDate']:checked")?.value || "";
  const pickupTime = document.querySelector("input[name='pickupTime']:checked").value;
  const paymentMethod = document.querySelector("input[name='paymentMethod']:checked").value;
  const customerAddress = document.querySelector("#customerAddress").value.trim();
  const customerNotes = document.querySelector("#customerNotes").value.trim();
  const items = getCartItems(state);

  return {
    customerName,
    customerPhone,
    orderType,
    pickupDate,
    pickupTime,
    paymentMethod,
    customerAddress,
    customerNotes,
    items: items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      choices: item.choices,
      choicesText: item.choicesText,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    })),
    total: getCartTotal(state),
  };
}

categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderAll();
});

menuGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const decreaseButton = event.target.closest("[data-menu-decrease]");

  if (addButton) addToCart(addButton.dataset.add);
  if (decreaseButton) {
    const state = getState();
    const product = state.products.find((entry) => entry.id === decreaseButton.dataset.menuDecrease);
    if (!product) return;
    const key = getCartKey(product, getSelectedChoices(product, state));
    decreaseCartItem(key);
  }
});

menuGrid.addEventListener("change", (event) => {
  handleComboSelection(event);
  const card = event.target.closest("[data-item-card]");
  if (!card) return;
  updateMenuCard(card.dataset.itemCard, getState());
});

cartList.addEventListener("click", (event) => {
  const increaseButton = event.target.closest("[data-increase]");
  const decreaseButton = event.target.closest("[data-decrease]");

  if (increaseButton) increaseCartItem(increaseButton.dataset.increase);
  if (decreaseButton) decreaseCartItem(decreaseButton.dataset.decrease);
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const state = getState();
  if (!state.settings.orderingOpen) {
    alert("Ordering is paused right now.");
    return;
  }

  if (cart.size === 0) {
    alert("Please add at least one item before placing the order.");
    return;
  }

  const payload = collectOrderPayload(state);
  if (payload.orderType === "Delivery" && !payload.customerAddress) {
    alert("Please fill in the delivery address.");
    return;
  }

  const order = createOrder(payload);
  latestOrderCode = order.code;
  trackedOrderCode = order.code;
  trackCodeInput.value = order.code;
  clearCartAndForm();
  renderAll();
  latestOrder.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

trackForm.addEventListener("submit", (event) => {
  event.preventDefault();
  trackedOrderCode = trackCodeInput.value.trim();
  renderTracking(getState());
});

subscribe((state) => {
  renderAll(state);
});

renderPickupDates();
renderAll();
