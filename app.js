import {
  buildWhatsAppUrl,
  createOrder,
  findOrderByCode,
  formatPrice,
  getBusinessDateLabel,
  getCategories,
  getChoiceGroupsForProduct,
  getComboGroupForProduct,
  getFirstAvailableOption,
  getState,
  isProductAvailable,
  fetchOrderByCode,
  loadPublicState,
  subscribe,
} from "./shared/api-store.js?v=20260609-business-open";

const translations = {
  en: {
    categories: {
      All: "All",
      烧味饭: "Roast Rice",
      "双拼 / 三拼 / 拼盘": "Double / Triple / Platters",
      单点加料: "A La Carte",
    },
    items: {
      "roast-duck-rice": {
        name: "HK-Style Dang Gui Roast Duck Rice",
        description:
          "Tender roast duck with crisp skin, served with steamed rice, Hong Kong greens and roast gravy.",
      },
      "char-siu-rice": {
        name: "Honey Char Siu Rice",
        description:
          "Sweet and savoury honey char siu slices served with steamed rice, Hong Kong greens and roast gravy.",
      },
      "siew-yoke-rice": {
        name: "Crispy Roast Pork Rice",
        description:
          "Golden crispy roast pork with balanced fat and lean meat, served with steamed rice, Hong Kong greens and yellow mustard.",
      },
      "white-chicken-rice": {
        name: "Steamed White Chicken Rice",
        description:
          "Silky steamed chicken served with steamed rice, Hong Kong greens and ginger scallion sauce.",
      },
      "hk-roast-chicken-rice": {
        name: "HK-Style Roast Chicken Rice",
        description:
          "HK-style roast chicken with fragrant skin and tender meat, served with steamed rice, Hong Kong greens and roast gravy.",
      },
      "custom-double-rice": {
        name: "Build Your Own Double Roast Rice",
        description:
          "Choose any two roast meats, served with steamed rice, Hong Kong greens and roast gravy.",
      },
      "custom-triple-rice": {
        name: "Build Your Own Triple Roast Rice",
        description:
          "Choose any three roast meats, served with steamed rice, Hong Kong greens and roast gravy.",
      },
      "four-treasure-rice": {
        name: "Four Treasures Rice",
        description:
          "A classic Hong Kong roast platter rice with roast duck, char siu, roast pork and roast chicken.",
      },
      "roast-duck-portion": {
        name: "Roast Duck Portion",
        description: "A shareable roast duck portion, perfect with rice or noodles.",
      },
      "char-siu-portion": {
        name: "Char Siu Portion",
        description: "Honey char siu portion, ideal as an add-on dish or for sharing.",
      },
      "siew-yoke-portion": {
        name: "Crispy Roast Pork Portion",
        description: "Crispy roast pork portion with fragrant crackling and savoury meat.",
      },
    },
    choiceLabels: {
      鸡肉部位: "Chicken Cut",
      白切鸡部位: "White Chicken Cut",
      叉烧肥瘦: "Char Siu Cut",
      重量: "Weight",
      烧鸭规格: "Roast Duck Size",
      选择两款烧味: "Choose 2 Roast Meats",
      选择三款烧味: "Choose 3 Roast Meats",
    },
    choiceValues: {
      全部: "All Parts",
      鸡胸: "Breast",
      鸡二度: "Second Joint",
      鸡翅: "Wing",
      鸡腿: "Leg",
      瘦: "Lean",
      半肥瘦: "Half Lean, Half Fat",
      一例: "Regular Portion",
      一例上庄: "Upper Quarter Portion",
      一例下庄: "Lower Quarter Portion",
      半只: "Half Duck",
      一只: "Whole Duck",
      烧鸭: "Roast Duck",
      叉烧: "Char Siu",
      烧肉: "Roast Pork",
      烧鸡: "Roast Chicken",
      白切鸡: "White Chicken",
    },
    statuses: {
      NEW: "Order received",
      ACCEPTED: "Accepted",
      PREPARING: "Preparing",
      READY: "Ready",
      OUT_FOR_DELIVERY: "Out for delivery",
      DONE: "Done",
      CANCELLED: "Cancelled",
    },
    orderTypes: {
      Pickup: "Pickup",
      Delivery: "Delivery",
    },
    ui: {
      available: "Available",
      soldOut: "Sold Out",
      unavailable: "Unavailable",
      notAvailable: "Not Available",
      each: "each",
      item: "item",
      items: "items",
      dateLegend: "Pickup / delivery date",
      today: "Today",
      tomorrow: "Tomorrow",
      addOne: "Add one",
      removeOne: "Remove one",
      menuQuantity: "menu quantity",
      openForOrders: "Open for orders",
      closedByShop: "Shop is resting",
      closedNotice:
        "The shop is resting right now. You can still browse the menu and track existing orders.",
      pausedBySeller: "Paused by shop",
      pausedNotice:
        "The shop has paused ordering for now. You can still browse the menu and track existing orders.",
      activeOrderNote: "Your order goes directly to the shop and is saved in the order system.",
      pausedOrderNote: "Ordering is currently paused by the shop.",
      loadingMenu:
        "Menu is loading from the kitchen system. If this stays here, please check that the backend is running.",
      noProducts: "No products in this category yet.",
      emptyCartAlert: "Please add at least one item before placing the order.",
      pausedAlert: "Ordering is paused right now.",
      closedAlert: "The shop is resting right now.",
      addressAlert: "Please fill in the delivery address.",
      comboAlert: "Please select exactly {count} roast meats.",
      placingOrder: "Sending order...",
      placeOrder: "Place order",
      orderError: "Could not place the order. Please try again.",
      latestSummary: "{status} • {total} • {type}",
      trackingEmpty: "Enter your order code to view the latest status.",
      trackingChecking: "Checking the cloud order system...",
      trackingMissing: "We could not find that code yet.",
      orderCode: "Order code",
      backendDown:
        "The cloud order system is not reachable. Please start the Go backend or check the API URL.",
      backendDownNote: "Ordering needs the backend to be running.",
      imageReference: "Image for reference only",
      locating: "Locating...",
      useCurrentLocation: "Use current location",
      locationUnsupported: "This browser does not support location sharing.",
      locationFailed: "Could not get your location. Please allow location access or type the address.",
      selected: "Selected",
    },
  },
  zh: {
    categories: {
      All: "全部",
    },
    statuses: {
      NEW: "已收到订单",
      ACCEPTED: "已接单",
      PREPARING: "准备中",
      READY: "可取餐",
      OUT_FOR_DELIVERY: "配送中",
      DONE: "已完成",
      CANCELLED: "已取消",
    },
    orderTypes: {
      Pickup: "自取",
      Delivery: "配送",
    },
    ui: {
      available: "可购买",
      soldOut: "已售完",
      unavailable: "暂不售卖",
      notAvailable: "不可购买",
      each: "每份",
      item: "份",
      items: "份",
      dateLegend: "取餐 / 送餐日期",
      today: "今天",
      tomorrow: "明天",
      addOne: "加一份",
      removeOne: "减少一份",
      menuQuantity: "菜单数量",
      openForOrders: "营业中",
      closedByShop: "休息中",
      closedNotice: "商家现在休息中。你仍然可以浏览菜单，也可以查询已经提交的订单。",
      pausedBySeller: "商家暂停接单",
      pausedNotice: "商家现在暂停接单。你仍然可以浏览菜单，也可以查询已经提交的订单。",
      activeOrderNote: "订单会直接发送给商家，并保存到订单系统。",
      pausedOrderNote: "商家现在暂停接单。",
      loadingMenu: "菜单正在从厨房系统读取。如果一直没有显示，请确认后端已经启动。",
      noProducts: "这个分类暂时没有产品。",
      emptyCartAlert: "请先加入至少一份菜品再下单。",
      pausedAlert: "商家现在暂停接单。",
      closedAlert: "商家现在休息中。",
      addressAlert: "配送订单请填写地址。",
      comboAlert: "请选择刚好 {count} 款烧味。",
      placingOrder: "正在提交...",
      placeOrder: "提交订单",
      orderError: "订单提交失败，请再试一次。",
      latestSummary: "{status} • {total} • {type}",
      trackingEmpty: "输入订单编号查看最新状态。",
      trackingChecking: "正在查询订单系统...",
      trackingMissing: "找不到这个订单编号。",
      orderCode: "订单编号",
      backendDown: "订单系统暂时连接不到。请确认 Go 后端已经启动，或检查 API 地址。",
      backendDownNote: "下单需要后端系统正在运行。",
      imageReference: "图片仅供参考",
      locating: "正在定位...",
      useCurrentLocation: "使用当前位置",
      locationUnsupported: "这个浏览器不支持定位。",
      locationFailed: "拿不到你的位置。请允许定位，或手动填写地址。",
      selected: "已选",
    },
  },
};

const cart = new Map();
let activeCategory = "All";
let latestOrderCode = "";
let trackedOrderCode = "";
let publicRefreshTimer = null;
let currentLanguage = window.localStorage.getItem("roast-by-jaden-language") || "zh";

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
const customerAddressInput = document.querySelector("#customerAddress");
const addressMapLink = document.querySelector("#addressMapLink");
const useLocationButton = document.querySelector("#useLocationButton");
const languageSwitch = document.querySelector(".language-switch");
const languageButtons = document.querySelectorAll("[data-language-option]");
const languageBadge = document.querySelector("[data-language-badge]");

function translateCategory(category) {
  return translations[currentLanguage]?.categories?.[category] || category;
}

function translateProductName(product) {
  return translations[currentLanguage]?.items?.[product.id]?.name || product.name;
}

function translateProductDescription(product) {
  return translations[currentLanguage]?.items?.[product.id]?.description || product.description;
}

function translateChoiceLabel(label) {
  return translations[currentLanguage]?.choiceLabels?.[label] || label;
}

function translateChoiceValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => translateChoiceValue(entry)).join(currentLanguage === "zh" ? "、" : ", ");
  }

  return translations[currentLanguage]?.choiceValues?.[value] || value;
}

function translateStatus(status) {
  return translations[currentLanguage]?.statuses?.[status] || status;
}

function translateOrderType(type) {
  return translations[currentLanguage]?.orderTypes?.[type] || type;
}

function translateUi(key, replacements = {}) {
  const template = translations[currentLanguage]?.ui?.[key] || translations.en.ui[key] || key;
  return Object.entries(replacements).reduce(
    (text, [name, value]) => text.replace(`{${name}}`, value),
    template,
  );
}

function renderLanguage() {
  document.documentElement.lang = currentLanguage;
  document.title =
    currentLanguage === "zh" ? "賢仔港式烧腊 | Online Menu" : "Roast by Jaden | Online Menu";
  if (languageSwitch) {
    languageSwitch.dataset.current = currentLanguage;
  }

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = element.dataset[currentLanguage];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = element.dataset[`${currentLanguage}Placeholder`];
  });

  languageButtons.forEach((button) => {
    const isActive = button.dataset.languageOption === currentLanguage;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (languageBadge) {
    languageBadge.hidden = currentLanguage !== "en";
  }
}

function updateAddressMapLink() {
  if (!customerAddressInput || !addressMapLink) return;

  const address = customerAddressInput.value.trim();
  if (!address) {
    addressMapLink.href = "https://www.google.com/maps";
    addressMapLink.classList.remove("has-address");
    return;
  }

  const mapsUrl = address.match(/https:\/\/www\.google\.com\/maps[^\s]*/)?.[0];
  if (mapsUrl) {
    addressMapLink.href = mapsUrl;
    addressMapLink.classList.add("has-address");
    return;
  }

  addressMapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  addressMapLink.classList.add("has-address");
}

function setCustomerAddress(value) {
  if (!customerAddressInput) return;
  customerAddressInput.value = value;
  updateAddressMapLink();
}

function useCurrentLocation() {
  if (!navigator.geolocation) {
    alert(translateUi("locationUnsupported"));
    return;
  }

  if (useLocationButton) {
    useLocationButton.disabled = true;
    useLocationButton.textContent = translateUi("locating");
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const coordinates = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
      setCustomerAddress(`Google Maps: https://www.google.com/maps?q=${coordinates}`);
      if (useLocationButton) {
        useLocationButton.disabled = false;
        useLocationButton.textContent = translateUi("useCurrentLocation");
      }
    },
    () => {
      alert(translateUi("locationFailed"));
      if (useLocationButton) {
        useLocationButton.disabled = false;
        useLocationButton.textContent = translateUi("useCurrentLocation");
      }
    },
    {
      enableHighAccuracy: true,
      maximumAge: 60000,
      timeout: 12000,
    },
  );
}

function formatChoicesForDisplay(choices) {
  return choices
    .filter((choice) => (Array.isArray(choice.value) ? choice.value.length > 0 : choice.value))
    .map((choice) => `${translateChoiceLabel(choice.label)}: ${translateChoiceValue(choice.value)}`)
    .join(" / ");
}

function formatChoicesForOrder(choices) {
  return choices
    .filter((choice) => (Array.isArray(choice.value) ? choice.value.length > 0 : choice.value))
    .map((choice) => {
      const value = Array.isArray(choice.value) ? choice.value.join(", ") : choice.value;
      return `${choice.label}: ${value}`;
    })
    .join(" / ");
}

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

function formatPickupDate(date, index) {
  if (currentLanguage === "zh") {
    const label = `${date.getMonth() + 1}月${date.getDate()}日 ${date.getFullYear()}`;
    if (index === 0) return `${translateUi("today")}，${label}`;
    if (index === 1) return `${translateUi("tomorrow")}，${label}`;
    const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
    return `${weekday}，${label}`;
  }

  if (index === 0) return `${translateUi("today")}, ${getBusinessDateLabel(date)}`;
  if (index === 1) return `${translateUi("tomorrow")}, ${getBusinessDateLabel(date)}`;
  return getBusinessDateLabel(date);
}

function renderPickupDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const labels = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + index);
    return formatPickupDate(date, index);
  });

  pickupDateOptions.innerHTML = `
    <legend>${translateUi("dateLegend")}</legend>
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
          ${translateCategory(category)}
        </button>
      `,
    )
    .join("");
}

function renderChoiceGroup(product, group) {
  const firstAvailable = getFirstAvailableOption(group);

  return `
    <fieldset class="choice-group">
      <legend>${translateChoiceLabel(group.label)}</legend>
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
                ${translateChoiceValue(option.value)}${option.price ? ` ${formatPrice(option.price)}` : ""}
                ${option.available ? "" : `<span>${translateUi("soldOut")}</span>`}
              </label>
            `;
          })
          .join("")}
      </div>
    </fieldset>
  `;
}

function getComboHint(count, selectedCount = count) {
  return currentLanguage === "zh"
    ? `${translateUi("selected")} ${selectedCount} / ${count}`
    : `${translateUi("selected")} ${selectedCount} / ${count}`;
}

function renderComboGroup(product, group) {
  return `
    <fieldset class="choice-group combo-choice-group" data-combo-group="${product.id}" data-combo-count="${group.count}">
      <legend>${translateChoiceLabel(group.label)}</legend>
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
              ${translateChoiceValue(option.value)}
              ${option.available ? "" : `<span>${translateUi("soldOut")}</span>`}
            </label>
          `)
          .join("")}
      </div>
      <small class="choice-limit" data-combo-hint="${product.id}">${getComboHint(group.count)}</small>
    </fieldset>
  `;
}

function getProductBadge(product, available) {
  if (!product.enabled) return `<span class="product-badge idle">${translateUi("unavailable")}</span>`;
  if (!available || product.soldOut) return `<span class="product-badge sold">${translateUi("soldOut")}</span>`;
  return `<span class="product-badge live">${translateUi("available")}</span>`;
}

function renderMenu(state) {
  const products = getVisibleProducts(state);

  if (!products.length) {
    menuGrid.innerHTML = `<div class="empty-card">${translateUi("loadingMenu")}</div>`;
    return;
  }

  menuGrid.innerHTML = products
    .map((product) => {
      const available = isProductAvailable(product, state);
      const defaultChoices = getDefaultChoices(product, state);
      const choiceGroups = getChoiceGroupsForProduct(product, state);
      const comboGroup = getComboGroupForProduct(product, state);

      return `
        <article class="menu-card" data-item-card="${product.id}">
          <div class="menu-card-image">
            <img src="${product.image}" alt="${translateProductName(product)}" loading="lazy" />
            <span>${translateUi("imageReference")}</span>
          </div>
          <div class="menu-card-body">
            <div class="menu-card-top">
              <div>
                <h3>${translateProductName(product)}</h3>
                <p>${translateProductDescription(product)}</p>
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
                    <div class="menu-quantity" aria-label="${translateProductName(product)} ${translateUi("menuQuantity")}">
                      <button type="button" data-menu-decrease="${product.id}" aria-label="${translateUi("removeOne")} ${translateProductName(product)}">-</button>
                      <output data-menu-count="${product.id}">${getCartQuantity(product, defaultChoices)}</output>
                      <button type="button" data-add="${product.id}" aria-label="${translateUi("addOne")} ${translateProductName(product)}">+</button>
                    </div>
                  `
                  : `<button class="add-button" type="button" disabled>${translateUi("notAvailable")}</button>`
              }
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  if (!products.length) {
    menuGrid.innerHTML = `<div class="empty-card">${translateUi("noProducts")}</div>`;
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
            <strong>${translateProductName(item.product)}</strong>
            ${item.choices.length ? `<small>${formatChoicesForDisplay(item.choices)}</small>` : ""}
            <span>${formatPrice(item.unitPrice)} ${translateUi("each")}</span>
          </div>
          <div class="quantity" aria-label="${translateProductName(item.product)} quantity">
            <button type="button" data-decrease="${item.key}" aria-label="${translateUi("removeOne")}">-</button>
            <output>${item.quantity}</output>
            <button type="button" data-increase="${item.key}" aria-label="${translateUi("addOne")}">+</button>
          </div>
        </div>
      `,
    )
    .join("");

  cartTotal.textContent = formatPrice(getCartTotal(state));
  mobileCartCount.textContent = `${totalQuantity} ${totalQuantity === 1 ? translateUi("item") : translateUi("items")}`;
}

function renderStoreState(state) {
  if (!state.settings.businessOpen) {
    storeStatusHero.textContent = translateUi("closedByShop");
    storeNotice.hidden = false;
    storeNotice.textContent = translateUi("closedNotice");
    placeOrderButton.disabled = true;
    orderFormNote.textContent = translateUi("closedNotice");
  } else if (state.settings.orderingOpen) {
    storeStatusHero.textContent = translateUi("openForOrders");
    storeNotice.hidden = true;
    placeOrderButton.disabled = false;
    orderFormNote.textContent = translateUi("activeOrderNote");
  } else {
    storeStatusHero.textContent = translateUi("pausedBySeller");
    storeNotice.hidden = false;
    storeNotice.textContent = translateUi("pausedNotice");
    placeOrderButton.disabled = true;
    orderFormNote.textContent = translateUi("pausedOrderNote");
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
  latestOrderSummary.textContent = translateUi("latestSummary", {
    status: translateStatus(order.status),
    total: formatPrice(order.total),
    type: translateOrderType(order.orderType),
  });
  latestOrderTrackLink.href = "#track";
  latestOrderWhatsappLink.href = buildWhatsAppUrl(order);
}

function renderTracking(state) {
  if (!trackedOrderCode) {
    trackResult.className = "track-result empty";
    trackResult.textContent = translateUi("trackingEmpty");
    return;
  }

  const order = state.orders.find(
    (entry) => entry.code.toUpperCase() === trackedOrderCode.toUpperCase(),
  );

  if (!order) {
    trackResult.className = "track-result empty";
    trackResult.textContent = translateUi("trackingMissing");
    return;
  }

  trackResult.className = "track-result";
  trackResult.innerHTML = `
    <div class="track-card-head">
      <div>
        <p class="eyebrow">${translateUi("orderCode")}</p>
        <h3>${order.code}</h3>
      </div>
      <span class="status-pill">${translateStatus(order.status)}</span>
    </div>
    <p class="track-meta">${order.customerName} • ${translateOrderType(order.orderType)} • ${formatPrice(order.total)}</p>
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
              <strong>${translateStatus(entry.status)}</strong>
              <span>${new Date(entry.timestamp).toLocaleString(currentLanguage === "zh" ? "zh-MY" : "en-MY")}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderAll(state = getState()) {
  renderLanguage();
  renderStoreState(state);
  renderCategories(state);
  renderMenu(state);
  renderCart(state);
  renderLatestOrder(state);
  renderTracking(state);
}

function startPublicRefresh() {
  if (publicRefreshTimer) return;

  publicRefreshTimer = window.setInterval(async () => {
    try {
      await loadPublicState();
      if (trackedOrderCode) {
        await fetchOrderByCode(trackedOrderCode);
      }
    } catch {
      // Keep the current screen usable if the backend briefly drops.
    }
  }, 5000);
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
      alert(translateUi("comboAlert", { count: comboGroup.count }));
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
    choicesText: formatChoicesForOrder(choices),
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
    hint.textContent = getComboHint(limit, checked.length);
  }
}

function clearCartAndForm() {
  cart.clear();
  orderForm.reset();
  renderPickupDates();
  updateAddressMapLink();
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

customerAddressInput?.addEventListener("input", updateAddressMapLink);

useLocationButton?.addEventListener("click", useCurrentLocation);

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentLanguage = button.dataset.languageOption;
    window.localStorage.setItem("roast-by-jaden-language", currentLanguage);
    renderPickupDates();
    renderAll();
  });
});

languageSwitch?.addEventListener("click", (event) => {
  const rect = languageSwitch.getBoundingClientRect();
  const nextLanguage = event.clientX - rect.left < rect.width / 2 ? "en" : "zh";
  if (nextLanguage === currentLanguage) return;
  currentLanguage = nextLanguage;
  window.localStorage.setItem("roast-by-jaden-language", currentLanguage);
  renderPickupDates();
  renderAll();
});

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const state = getState();
  if (!state.settings.businessOpen) {
    alert(translateUi("closedAlert"));
    return;
  }

  if (!state.settings.orderingOpen) {
    alert(translateUi("pausedAlert"));
    return;
  }

  if (cart.size === 0) {
    alert(translateUi("emptyCartAlert"));
    return;
  }

  const payload = collectOrderPayload(state);
  if (payload.orderType === "Delivery" && !payload.customerAddress) {
    alert(translateUi("addressAlert"));
    return;
  }

  try {
    placeOrderButton.disabled = true;
    placeOrderButton.textContent = translateUi("placingOrder");
    const order = await createOrder(payload);
    latestOrderCode = order.code;
    trackedOrderCode = order.code;
    trackCodeInput.value = order.code;
    clearCartAndForm();
    renderAll();
    latestOrder.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (error) {
    alert(error.message || translateUi("orderError"));
  } finally {
    const nextState = getState();
    placeOrderButton.disabled = !nextState.settings.businessOpen || !nextState.settings.orderingOpen;
    placeOrderButton.textContent = translateUi("placeOrder");
  }
});

trackForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  trackedOrderCode = trackCodeInput.value.trim();
  if (!trackedOrderCode) {
    renderTracking(getState());
    return;
  }
  trackResult.className = "track-result empty";
  trackResult.textContent = translateUi("trackingChecking");
  try {
    await fetchOrderByCode(trackedOrderCode);
    renderTracking(getState());
  } catch {
    trackResult.className = "track-result empty";
    trackResult.textContent = translateUi("trackingMissing");
  }
});

subscribe((state) => {
  renderAll(state);
});

renderLanguage();
renderPickupDates();
updateAddressMapLink();
renderAll();

try {
  await loadPublicState();
  startPublicRefresh();
} catch {
  storeNotice.hidden = false;
  storeNotice.textContent = translateUi("backendDown");
  orderFormNote.textContent = translateUi("backendDownNote");
  placeOrderButton.disabled = true;
}
