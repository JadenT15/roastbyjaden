const business = {
  name: "Roast by Jaden",
  // Replace this with your WhatsApp number in international format.
  // Example for Malaysia: 60123456789
  whatsappNumber: "60123456789",
  currency: "RM",
};

const menuImages = {
  roastDuck:
    "https://images.unsplash.com/photo-1762088200446-f32ff63f8399?auto=format&fit=crop&w=900&q=85",
  roastDisplay:
    "https://images.pexels.com/photos/6645928/pexels-photo-6645928.jpeg?auto=compress&cs=tinysrgb&w=900",
  charSiu:
    "https://images.pexels.com/photos/8969968/pexels-photo-8969968.jpeg?auto=compress&cs=tinysrgb&w=900",
  crispyPork:
    "https://images.pexels.com/photos/8408377/pexels-photo-8408377.jpeg?auto=compress&cs=tinysrgb&w=900",
  roastChicken:
    "https://images.pexels.com/photos/12350418/pexels-photo-12350418.jpeg?auto=compress&cs=tinysrgb&w=900",
};

const choiceGroups = {
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
      { value: "一例", available: true, price: 24.9 },
      { value: "半只", available: true, price: 48 },
      { value: "一只", available: true, price: 88 },
    ],
  },
};

const menuItems = [
  {
    id: "roast-duck-rice",
    name: "港式当归烧鸭",
    category: "烧味饭",
    price: 13.9,
    description: "皮脆肉嫩烧鸭，配白饭、香港芥兰或香港菜心和烧腊汁。",
    image: menuImages.roastDuck,
  },
  {
    id: "char-siu-rice",
    name: "蜜汁叉烧饭",
    category: "烧味饭",
    price: 12.9,
    description: "蜜汁叉烧切片，甜香入味，配白饭和烧腊汁。",
    image: menuImages.charSiu,
    choices: ["charSiuCut"],
  },
  {
    id: "siew-yoke-rice",
    name: "脆皮烧肉饭",
    category: "烧味饭",
    price: 13.9,
    description: "金黄脆皮烧肉，肥瘦相间，搭配白饭和黄芥末。",
    image: menuImages.crispyPork,
  },
  {
    id: "soy-sauce-chicken-rice",
    name: "豉油鸡饭",
    category: "烧味饭",
    price: 12.9,
    description: "港式豉油鸡，肉质嫩滑，酱香浓郁。",
    image: menuImages.roastChicken,
    displayOnly: true,
    choices: ["chickenPart"],
  },
  {
    id: "white-chicken-rice",
    name: "白切鸡饭",
    category: "烧味饭",
    price: 12.9,
    description: "滑嫩白切鸡，搭配姜蓉和清香白饭。",
    image: menuImages.roastChicken,
    choices: ["chickenPart"],
  },
  {
    id: "hk-roast-chicken-rice",
    name: "港式烧鸡",
    category: "烧味饭",
    price: 12.9,
    description: "港式烧鸡，皮香肉嫩，搭配白饭和烧腊汁。",
    image: menuImages.roastChicken,
    choices: ["chickenPart"],
  },
  {
    id: "duck-char-siu-combo",
    name: "烧鸭叉烧双拼饭",
    category: "双拼/拼盘",
    price: 16.9,
    description: "烧鸭加蜜汁叉烧，一次满足两款经典烧味。",
    image: menuImages.roastDisplay,
  },
  {
    id: "duck-siew-yoke-combo",
    name: "烧鸭烧肉双拼饭",
    category: "双拼/拼盘",
    price: 16.9,
    description: "港式烧鸭配脆皮烧肉，皮香肉嫩，烧味十足。",
    image: menuImages.roastDisplay,
  },
  {
    id: "siew-yoke-char-siu-combo",
    name: "烧肉叉烧双拼饭",
    category: "双拼/拼盘",
    price: 16.9,
    description: "脆皮烧肉配蜜汁叉烧，咸甜兼备，经典搭配。",
    image: menuImages.crispyPork,
  },
  {
    id: "char-siu-roast-chicken-combo",
    name: "叉烧烧鸡双拼饭",
    category: "双拼/拼盘",
    price: 16.9,
    description: "蜜汁叉烧配港式烧鸡，甜香嫩滑，份量十足。",
    image: menuImages.charSiu,
  },
  {
    id: "duck-roast-chicken-combo",
    name: "烧鸭烧鸡双拼饭",
    category: "双拼/拼盘",
    price: 16.9,
    description: "港式烧鸭配港式烧鸡，一次享用两款招牌烧味。",
    image: menuImages.roastDisplay,
  },
  {
    id: "siew-yoke-chicken-combo",
    name: "烧肉烧鸡双拼饭",
    category: "双拼/拼盘",
    price: 16.9,
    description: "脆皮烧肉配港式烧鸡，咸香嫩滑，份量十足。",
    image: menuImages.crispyPork,
  },
  {
    id: "four-treasure-rice",
    name: "四宝饭",
    category: "双拼/拼盘",
    price: 19.9,
    description: "烧鸭、叉烧、烧肉、烧鸡，经典港式烧味拼盘饭。",
    image: menuImages.roastDisplay,
    choices: ["charSiuCut"],
  },
  {
    id: "roast-duck-portion",
    name: "烧鸭例牌",
    category: "单点加料",
    price: 24.9,
    description: "适合分享的烧鸭例牌，可搭配饭或面。",
    image: menuImages.roastDuck,
    choices: ["duckPortionSize"],
  },
  {
    id: "char-siu-portion",
    name: "叉烧例牌",
    category: "单点加料",
    price: 22.9,
    description: "蜜汁叉烧例牌，适合加餸或多人分享。",
    image: menuImages.charSiu,
    choices: ["charSiuCut", "portionWeight"],
  },
  {
    id: "siew-yoke-portion",
    name: "烧肉例牌",
    category: "单点加料",
    price: 23.9,
    description: "脆皮烧肉例牌，皮脆肉香。",
    image: menuImages.crispyPork,
    choices: ["portionWeight"],
  },
];

const translations = {
  en: {
    categories: {
      All: "All",
      烧味饭: "Roast Rice",
      "双拼/拼盘": "Combo Platters",
      单点加料: "A La Carte",
    },
    items: {
      "roast-duck-rice": {
        name: "HK-Style Dang Gui Roast Duck Rice",
        description:
          "Tender roast duck with crisp skin, served with steamed rice, Hong Kong kai lan or choy sum, and roast gravy.",
      },
      "char-siu-rice": {
        name: "Honey Char Siu Rice",
        description: "Sweet and savoury honey char siu slices served with steamed rice and roast gravy.",
      },
      "siew-yoke-rice": {
        name: "Crispy Roast Pork Rice",
        description: "Golden crispy roast pork with balanced fat and lean meat, served with steamed rice and yellow mustard.",
      },
      "soy-sauce-chicken-rice": {
        name: "Soy Sauce Chicken Rice",
        description: "HK-style soy sauce chicken with tender meat and rich savoury aroma.",
      },
      "white-chicken-rice": {
        name: "Steamed White Chicken Rice",
        description: "Silky steamed chicken served with ginger scallion sauce and fragrant steamed rice.",
      },
      "hk-roast-chicken-rice": {
        name: "HK-Style Roast Chicken Rice",
        description: "HK-style roast chicken with fragrant skin and tender meat, served with steamed rice and roast gravy.",
      },
      "duck-char-siu-combo": {
        name: "Roast Duck & Char Siu Rice",
        description: "Roast duck paired with honey char siu for two classic Hong Kong roast flavours in one meal.",
      },
      "duck-siew-yoke-combo": {
        name: "Roast Duck & Roast Pork Rice",
        description: "HK-style roast duck served with crispy roast pork for a rich classic combo.",
      },
      "siew-yoke-char-siu-combo": {
        name: "Roast Pork & Char Siu Rice",
        description: "Crispy roast pork served with honey char siu for a savoury and sweet pairing.",
      },
      "char-siu-roast-chicken-combo": {
        name: "Char Siu & Roast Chicken Rice",
        description: "Honey char siu served with HK-style roast chicken for a tender, hearty combo.",
      },
      "duck-roast-chicken-combo": {
        name: "Roast Duck & Roast Chicken Rice",
        description: "HK-style roast duck served with HK-style roast chicken for two signature roast meats in one meal.",
      },
      "siew-yoke-chicken-combo": {
        name: "Roast Pork & Roast Chicken Rice",
        description: "Crispy roast pork served with HK-style roast chicken for a hearty savoury combo.",
      },
      "four-treasure-rice": {
        name: "Four Treasures Rice",
        description: "A classic Hong Kong roast platter rice with roast duck, char siu, roast pork and roast chicken.",
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
      叉烧肥瘦: "Char Siu Cut",
      重量: "Weight",
      烧鸭规格: "Roast Duck Size",
    },
    choiceValues: {
      鸡胸: "Breast",
      鸡二度: "Second Joint",
      鸡翅: "Wing",
      鸡腿: "Leg",
      瘦: "Lean",
      半肥瘦: "Half Lean, Half Fat",
      "100g": "100g",
      "200g": "200g",
      一例: "Regular Portion",
      半只: "Half Duck",
      一只: "Whole Duck",
    },
    ui: {
      soldOut: "Sold Out",
      displayOnly: "Display only",
      each: "each",
      item: "item",
      items: "items",
      dateLegend: "Pickup / delivery date",
      today: "Today",
      tomorrow: "Tomorrow",
      addOne: "Add one",
      removeOne: "Remove one",
      menuQuantity: "menu quantity",
    },
  },
  zh: {
    categories: {
      All: "全部",
    },
    ui: {
      soldOut: "已售完",
      displayOnly: "展示 / 暂不售卖",
      each: "每份",
      item: "份",
      items: "份",
      dateLegend: "取餐 / 送餐日期",
      today: "今天",
      tomorrow: "明天",
      addOne: "加一份",
      removeOne: "减少一份",
      menuQuantity: "菜单数量",
    },
  },
};

const cart = new Map();
let activeCategory = "All";

const categoryTabs = document.querySelector("#categoryTabs");
const menuGrid = document.querySelector("#menuGrid");
const cartList = document.querySelector("#cartList");
const cartEmpty = document.querySelector("#cartEmpty");
const cartTotal = document.querySelector("#cartTotal");
const orderForm = document.querySelector("#orderForm");
const mobileCartCount = document.querySelector("#mobileCartCount");
const pickupDateOptions = document.querySelector("#pickupDateOptions");
const languageButtons = document.querySelectorAll("[data-language-option]");
const languageBadge = document.querySelector("[data-language-badge]");
let currentLanguage = "zh";

function formatPrice(value) {
  return `${business.currency}${value.toFixed(2)}`;
}

function translateCategory(category) {
  return translations[currentLanguage]?.categories?.[category] || category;
}

function translateItemName(item) {
  return translations[currentLanguage]?.items?.[item.id]?.name || item.name;
}

function translateItemDescription(item) {
  return translations[currentLanguage]?.items?.[item.id]?.description || item.description;
}

function translateChoiceLabel(label) {
  return translations[currentLanguage]?.choiceLabels?.[label] || label;
}

function translateChoiceValue(value) {
  return translations[currentLanguage]?.choiceValues?.[value] || value;
}

function translateUi(key) {
  return translations[currentLanguage]?.ui?.[key] || translations.en.ui[key] || key;
}

function getCategories() {
  return ["All", ...new Set(menuItems.map((item) => item.category))];
}

function getItemChoiceGroups(item) {
  return (item.choices || []).map((choiceId) => choiceGroups[choiceId]).filter(Boolean);
}

function getFirstAvailableOption(group) {
  return group.options.find((option) => option.available);
}

function isItemAvailable(item) {
  if (item.displayOnly) return false;
  return getItemChoiceGroups(item).every((group) => getFirstAvailableOption(group));
}

function renderCategories() {
  categoryTabs.innerHTML = getCategories()
    .map(
      (category) => `
        <button class="${category === activeCategory ? "active" : ""}" data-category="${category}">
          ${translateCategory(category)}
        </button>
      `,
    )
    .join("");
}

function renderChoiceGroup(item, group) {
  const firstAvailable = getFirstAvailableOption(group);

  return `
    <fieldset class="choice-group">
      <legend>${translateChoiceLabel(group.label)}</legend>
      <div class="choice-options">
        ${group.options
          .map((option) => {
            const checked = firstAvailable?.value === option.value ? "checked" : "";
            const disabled = option.available ? "" : "disabled";
            const optionLabel = translateChoiceValue(option.value);
            const soldOut = option.available ? "" : `<span>${translateUi("soldOut")}</span>`;

            return `
              <label class="choice-chip ${option.available ? "" : "sold-out"}">
                <input
                  type="radio"
                  name="${item.id}-${group.id}"
                  value="${option.value}"
                  ${option.price ? `data-price="${option.price}"` : ""}
                  ${checked}
                  ${disabled}
                />
                ${optionLabel}${option.price ? ` ${formatPrice(option.price)}` : ""}
                ${soldOut}
              </label>
            `;
          })
          .join("")}
      </div>
    </fieldset>
  `;
}

function renderMenu() {
  const visibleItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  menuGrid.innerHTML = visibleItems
    .map((item) => {
      const available = isItemAvailable(item);

      return `
        <article class="menu-card" data-item-card="${item.id}">
          <img src="${item.image}" alt="${translateItemName(item)}" loading="lazy" />
          <div class="menu-card-body">
            <div>
              <h3>${translateItemName(item)}</h3>
              <p>${translateItemDescription(item)}</p>
            </div>
            ${getItemChoiceGroups(item).map((group) => renderChoiceGroup(item, group)).join("")}
            <div class="menu-card-footer">
              <span class="price" data-menu-price="${item.id}">${formatPrice(
                getMenuDisplayPrice(item, getDefaultChoices(item)),
              )}</span>
              ${item.displayOnly ? renderDisplayOnlyBadge() : renderMenuQuantity(item, available)}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function getDefaultChoices(item) {
  return getItemChoiceGroups(item).map((group) => ({
    label: group.label,
    value: getFirstAvailableOption(group)?.value || "",
    price: getFirstAvailableOption(group)?.price,
  }));
}

function getSelectedChoices(item) {
  return getItemChoiceGroups(item).map((group) => {
    const selected = document.querySelector(`input[name="${item.id}-${group.id}"]:checked`);
    const fallback = getFirstAvailableOption(group);

    return {
      label: group.label,
      value: selected?.value || fallback?.value || "",
      price: selected?.dataset.price ? Number(selected.dataset.price) : fallback?.price,
    };
  });
}

function formatChoices(choices) {
  return choices
    .map((choice) => `${translateChoiceLabel(choice.label)}: ${translateChoiceValue(choice.value)}`)
    .join(" / ");
}

function getCartKey(item, choices) {
  const choiceKey = choices.map((choice) => `${choice.label}:${choice.value}`).join("|");
  return `${item.id}|${choiceKey}`;
}

function getCartQuantity(item, choices) {
  return cart.get(getCartKey(item, choices))?.quantity || 0;
}

function getItemPrice(item, choices = []) {
  const priceChoice = choices.find((choice) => Number.isFinite(choice.price));
  return priceChoice?.price || item.price;
}

function getMenuDisplayPrice(item, choices = []) {
  const quantity = getCartQuantity(item, choices);
  const unitPrice = getItemPrice(item, choices);

  return quantity > 0 ? unitPrice * quantity : unitPrice;
}

function renderMenuQuantity(item, available) {
  if (!available) {
    return `<button class="add-button" type="button" disabled>${translateUi("soldOut")}</button>`;
  }

  const itemName = translateItemName(item);

  return `
    <div class="menu-quantity" aria-label="${itemName} ${translateUi("menuQuantity")}">
      <button type="button" data-menu-decrease="${item.id}" aria-label="${translateUi("removeOne")} ${itemName}">-</button>
      <output data-menu-count="${item.id}">${getCartQuantity(item, getDefaultChoices(item))}</output>
      <button type="button" data-add="${item.id}" aria-label="${translateUi("addOne")} ${itemName}">+</button>
    </div>
  `;
}

function renderDisplayOnlyBadge() {
  return `<span class="display-only-badge">${translateUi("displayOnly")}</span>`;
}

function updateMenuQuantityDisplay(id) {
  const item = menuItems.find((menuItem) => menuItem.id === id);
  const card = menuGrid.querySelector(`[data-item-card="${id}"]`);
  const output = card?.querySelector(`[data-menu-count="${id}"]`);
  const price = card?.querySelector(`[data-menu-price="${id}"]`);
  const choices = item ? getSelectedChoices(item) : [];

  if (!item || !output || !price) return;
  output.textContent = getCartQuantity(item, choices);
  price.textContent = formatPrice(getMenuDisplayPrice(item, choices));
}

function getCartItems() {
  return [...cart.values()].map((entry) => {
    const item = menuItems.find((menuItem) => menuItem.id === entry.itemId);
    return { ...item, ...entry };
  });
}

function getCartTotal() {
  return getCartItems().reduce(
    (total, item) => total + getItemPrice(item, item.choices) * item.quantity,
    0,
  );
}

function renderCart() {
  const items = getCartItems();
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

  cartEmpty.hidden = items.length > 0;
  cartList.innerHTML = items
    .map(
      (item) => `
        <div class="cart-item">
          <div>
            <strong>${translateItemName(item)}</strong>
            ${item.choices.length ? `<small>${formatChoices(item.choices)}</small>` : ""}
            <span>${formatPrice(getItemPrice(item, item.choices))} ${translateUi("each")}</span>
          </div>
          <div class="quantity" aria-label="${translateItemName(item)} quantity">
            <button type="button" data-decrease="${item.key}" aria-label="${translateUi("removeOne")} ${translateItemName(item)}">-</button>
            <output>${item.quantity}</output>
            <button type="button" data-increase="${item.key}" aria-label="${translateUi("addOne")} ${translateItemName(item)}">+</button>
          </div>
        </div>
      `,
    )
    .join("");

  cartTotal.textContent = formatPrice(getCartTotal());
  mobileCartCount.textContent = `${totalQuantity} ${totalQuantity === 1 ? translateUi("item") : translateUi("items")}`;
}

function addToCart(id) {
  const item = menuItems.find((menuItem) => menuItem.id === id);
  if (!item || item.displayOnly || !isItemAvailable(item)) return;

  const choices = getSelectedChoices(item);
  const key = getCartKey(item, choices);
  const existing = cart.get(key);

  cart.set(key, {
    key,
    itemId: id,
    choices,
    price: getItemPrice(item, choices),
    quantity: existing ? existing.quantity + 1 : 1,
  });
  renderCart();
  updateMenuQuantityDisplay(id);
}

function increaseCartItem(key) {
  const entry = cart.get(key);
  if (!entry) return;

  cart.set(key, { ...entry, quantity: entry.quantity + 1 });
  renderCart();
  updateMenuQuantityDisplay(entry.itemId);
}

function decreaseCartItem(key) {
  const entry = cart.get(key);
  if (!entry) return;
  const itemId = entry.itemId;

  if (entry.quantity === 1) {
    cart.delete(key);
  } else {
    cart.set(key, { ...entry, quantity: entry.quantity - 1 });
  }

  renderCart();
  updateMenuQuantityDisplay(itemId);
}

function decreaseMenuItem(id) {
  const item = menuItems.find((menuItem) => menuItem.id === id);
  if (!item) return;

  const key = getCartKey(item, getSelectedChoices(item));
  decreaseCartItem(key);
}

function formatPickupDate(date, index) {
  const day = date.getDate();
  const month = date.toLocaleDateString("en-MY", { month: "short" });
  const year = date.getFullYear();
  const weekday =
    currentLanguage === "zh"
      ? ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()]
      : date.toLocaleDateString("en-MY", { weekday: "short" });

  if (currentLanguage === "zh") {
    const zhDate = `${date.getMonth() + 1}月${day}日 ${year}`;
    if (index === 0) return `${translateUi("today")}，${zhDate}`;
    if (index === 1) return `${translateUi("tomorrow")}，${zhDate}`;
    return `${weekday}，${zhDate}`;
  }

  if (index === 0) return `${translateUi("today")}, ${day} ${month} ${year}`;
  if (index === 1) return `${translateUi("tomorrow")}, ${day} ${month} ${year}`;
  return `${weekday}, ${day} ${month} ${year}`;
}

function renderPickupDates() {
  if (!pickupDateOptions) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateChoices = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return formatPickupDate(date, index);
  });

  pickupDateOptions.innerHTML = `
    <legend>${translateUi("dateLegend")}</legend>
    ${dateChoices
      .map(
        (dateLabel, index) => `
          <label class="time-chip">
            <input
              type="radio"
              name="pickupDate"
              value="${dateLabel}"
              ${index === 0 ? "checked" : ""}
            />
            ${dateLabel}
          </label>
        `,
      )
      .join("")}
  `;
}

function renderLanguage() {
  document.documentElement.lang = currentLanguage;
  document.title =
    currentLanguage === "zh" ? "賢仔港式烧腊 | Online Menu" : "Roast by Jaden | Online Menu";

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

function buildWhatsAppMessage() {
  const name = document.querySelector("#customerName").value.trim();
  const phone = document.querySelector("#customerPhone").value.trim();
  const orderType = document.querySelector("input[name='orderType']:checked").value;
  const pickupDate = document.querySelector("input[name='pickupDate']:checked")?.value || "";
  const pickupTime = document.querySelector("input[name='pickupTime']:checked").value;
  const paymentMethod = document.querySelector("input[name='paymentMethod']:checked").value;
  const timeLabel = orderType === "Delivery" ? "Delivery time" : "Pickup time";
  const address = document.querySelector("#customerAddress").value.trim();
  const notes = document.querySelector("#customerNotes").value.trim();
  const items = getCartItems();

  const orderLines = items.map(
    (item) =>
      `- ${item.quantity} x ${translateItemName(item)}${
        item.choices.length ? ` [${formatChoices(item.choices)}]` : ""
      } (${formatPrice(getItemPrice(item, item.choices) * item.quantity)})`,
  );

  return [
    `Hi ${business.name}, I would like to order:`,
    "",
    ...orderLines,
    "",
    `Total: ${formatPrice(getCartTotal())}`,
    `Order type: ${orderType}`,
    pickupDate ? `Date: ${pickupDate}` : "",
    `${timeLabel}: ${pickupTime}`,
    `Payment method: ${paymentMethod}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    address ? `Delivery address: ${address}` : "",
    notes ? `Notes: ${notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;
  renderCategories();
  renderMenu();
});

menuGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const decreaseButton = event.target.closest("[data-menu-decrease]");

  if (addButton) addToCart(addButton.dataset.add);
  if (decreaseButton) decreaseMenuItem(decreaseButton.dataset.menuDecrease);
});

menuGrid.addEventListener("change", (event) => {
  const card = event.target.closest("[data-item-card]");
  if (!card) return;

  updateMenuQuantityDisplay(card.dataset.itemCard);
});

cartList.addEventListener("click", (event) => {
  const increaseButton = event.target.closest("[data-increase]");
  const decreaseButton = event.target.closest("[data-decrease]");

  if (increaseButton) increaseCartItem(increaseButton.dataset.increase);
  if (decreaseButton) decreaseCartItem(decreaseButton.dataset.decrease);
});

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentLanguage = button.dataset.languageOption;
    renderLanguage();
    renderPickupDates();
    renderCategories();
    renderMenu();
    renderCart();
  });
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (cart.size === 0) {
    alert("Please add at least one item before ordering.");
    return;
  }

  const message = encodeURIComponent(buildWhatsAppMessage());
  const url = `https://wa.me/${business.whatsappNumber}?text=${message}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

renderLanguage();
renderPickupDates();
renderCategories();
renderMenu();
renderCart();
