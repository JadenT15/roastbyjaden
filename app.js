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
  milkTea:
    "https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=900&q=85",
  lemonTea:
    "https://images.pexels.com/photos/792613/pexels-photo-792613.jpeg?auto=compress&cs=tinysrgb&w=900",
};

const menuItems = [
  {
    id: "roast-duck-rice",
    name: "港式烧鸭饭",
    category: "烧味饭",
    price: 13.9,
    description: "皮脆肉嫩烧鸭，配白饭、青瓜和烧腊汁。",
    image: menuImages.roastDuck,
  },
  {
    id: "char-siu-rice",
    name: "蜜汁叉烧饭",
    category: "烧味饭",
    price: 12.9,
    description: "蜜汁叉烧切片，甜香入味，配白饭和烧腊汁。",
    image: menuImages.charSiu,
  },
  {
    id: "siew-yoke-rice",
    name: "脆皮烧肉饭",
    category: "烧味饭",
    price: 13.9,
    description: "金黄脆皮烧肉，肥瘦相间，配白饭和特制酱汁。",
    image: menuImages.crispyPork,
  },
  {
    id: "soy-sauce-chicken-rice",
    name: "豉油鸡饭",
    category: "烧味饭",
    price: 12.9,
    description: "港式豉油鸡，肉质嫩滑，酱香浓郁。",
    image: menuImages.roastChicken,
  },
  {
    id: "white-chicken-rice",
    name: "白切鸡饭",
    category: "烧味饭",
    price: 12.9,
    description: "滑嫩白切鸡，搭配姜蓉和清香白饭。",
    image: menuImages.roastChicken,
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
    id: "siew-yoke-chicken-combo",
    name: "烧肉油鸡双拼饭",
    category: "双拼/拼盘",
    price: 16.9,
    description: "脆皮烧肉配油鸡，咸香嫩滑，份量十足。",
    image: menuImages.crispyPork,
  },
  {
    id: "four-treasure-rice",
    name: "四宝饭",
    category: "双拼/拼盘",
    price: 19.9,
    description: "烧鸭、叉烧、烧肉、油鸡，经典港式烧味拼盘饭。",
    image: menuImages.roastDisplay,
  },
  {
    id: "roast-duck-portion",
    name: "烧鸭例牌",
    category: "单点加料",
    price: 24.9,
    description: "适合分享的烧鸭例牌，可搭配饭或面。",
    image: menuImages.roastDuck,
  },
  {
    id: "char-siu-portion",
    name: "叉烧例牌",
    category: "单点加料",
    price: 22.9,
    description: "蜜汁叉烧例牌，适合加餸或多人分享。",
    image: menuImages.charSiu,
  },
  {
    id: "siew-yoke-portion",
    name: "烧肉例牌",
    category: "单点加料",
    price: 23.9,
    description: "脆皮烧肉例牌，皮脆肉香。",
    image: menuImages.crispyPork,
  },
  {
    id: "hk-milk-tea",
    name: "港式奶茶",
    category: "饮品",
    price: 5.9,
    description: "香滑港式奶茶，可选热或冷。",
    image: menuImages.milkTea,
  },
  {
    id: "lemon-tea",
    name: "冻柠茶",
    category: "饮品",
    price: 5.9,
    description: "清爽港式冻柠茶。",
    image: menuImages.lemonTea,
  },
];

const cart = new Map();
let activeCategory = "All";

const categoryTabs = document.querySelector("#categoryTabs");
const menuGrid = document.querySelector("#menuGrid");
const cartList = document.querySelector("#cartList");
const cartEmpty = document.querySelector("#cartEmpty");
const cartTotal = document.querySelector("#cartTotal");
const orderForm = document.querySelector("#orderForm");
const mobileCartCount = document.querySelector("#mobileCartCount");

function formatPrice(value) {
  return `${business.currency}${value.toFixed(2)}`;
}

function getCategories() {
  return ["All", ...new Set(menuItems.map((item) => item.category))];
}

function renderCategories() {
  categoryTabs.innerHTML = getCategories()
    .map(
      (category) => `
        <button class="${category === activeCategory ? "active" : ""}" data-category="${category}">
          ${category}
        </button>
      `,
    )
    .join("");
}

function renderMenu() {
  const visibleItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  menuGrid.innerHTML = visibleItems
    .map(
      (item) => `
        <article class="menu-card">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
          <div class="menu-card-body">
            <div>
              <h3>${item.name}</h3>
              <p>${item.description}</p>
            </div>
            <div class="menu-card-footer">
              <span class="price">${formatPrice(item.price)}</span>
              <button class="add-button" type="button" data-add="${item.id}" aria-label="Add ${item.name}">
                +
              </button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function getCartItems() {
  return [...cart.entries()].map(([id, quantity]) => {
    const item = menuItems.find((menuItem) => menuItem.id === id);
    return { ...item, quantity };
  });
}

function getCartTotal() {
  return getCartItems().reduce((total, item) => total + item.price * item.quantity, 0);
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
            <strong>${item.name}</strong>
            <span>${formatPrice(item.price)} each</span>
          </div>
          <div class="quantity" aria-label="${item.name} quantity">
            <button type="button" data-decrease="${item.id}" aria-label="Remove one ${item.name}">-</button>
            <output>${item.quantity}</output>
            <button type="button" data-increase="${item.id}" aria-label="Add one ${item.name}">+</button>
          </div>
        </div>
      `,
    )
    .join("");

  cartTotal.textContent = formatPrice(getCartTotal());
  mobileCartCount.textContent = `${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`;
}

function addToCart(id) {
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
}

function decreaseCartItem(id) {
  const quantity = cart.get(id);
  if (!quantity) return;

  if (quantity === 1) {
    cart.delete(id);
  } else {
    cart.set(id, quantity - 1);
  }

  renderCart();
}

function buildWhatsAppMessage() {
  const name = document.querySelector("#customerName").value.trim();
  const phone = document.querySelector("#customerPhone").value.trim();
  const orderType = document.querySelector("input[name='orderType']:checked").value;
  const address = document.querySelector("#customerAddress").value.trim();
  const notes = document.querySelector("#customerNotes").value.trim();
  const items = getCartItems();

  const orderLines = items.map(
    (item) =>
      `- ${item.quantity} x ${item.name} (${formatPrice(item.price * item.quantity)})`,
  );

  return [
    `Hi ${business.name}, I would like to order:`,
    "",
    ...orderLines,
    "",
    `Total: ${formatPrice(getCartTotal())}`,
    `Order type: ${orderType}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    address ? `Address / time: ${address}` : "",
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
  const button = event.target.closest("[data-add]");
  if (!button) return;

  addToCart(button.dataset.add);
});

cartList.addEventListener("click", (event) => {
  const increaseButton = event.target.closest("[data-increase]");
  const decreaseButton = event.target.closest("[data-decrease]");

  if (increaseButton) addToCart(increaseButton.dataset.increase);
  if (decreaseButton) decreaseCartItem(decreaseButton.dataset.decrease);
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

renderCategories();
renderMenu();
renderCart();
