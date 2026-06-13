import {
  fetchOrderByCode,
  formatPrice,
} from "./shared/api-store.js?v=20260612-tng-payment-link";

const statusLabels = {
  NEW: "已收到订单",
  ACCEPTED: "已接单",
  PREPARING: "准备中",
  READY: "可取餐",
  PACKING: "打包中",
  OUT_FOR_DELIVERY: "配送中",
  DONE: "已完成",
  CANCELLED: "已取消",
};

const orderTypeLabels = {
  Pickup: "自取",
  Delivery: "配送",
};

const codeInput = document.querySelector("#trackPageCodeInput");
const form = document.querySelector("#trackPageForm");
const result = document.querySelector("#trackPageResult");

let trackedCode = new URLSearchParams(window.location.search).get("code")?.trim() || "";
let refreshTimer = null;

function translateStatus(status) {
  return statusLabels[status] || status;
}

function translateOrderType(type) {
  return orderTypeLabels[type] || type;
}

function renderOrder(order) {
  result.className = "track-result";
  result.innerHTML = `
    <div class="track-card-head">
      <div>
        <p class="eyebrow">订单编号</p>
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
  `;
}

function renderMessage(message) {
  result.className = "track-result empty";
  result.textContent = message;
}

async function loadTrackedOrder({ showLoading = false } = {}) {
  if (!trackedCode) {
    renderMessage("输入订单编号查看最新状态。");
    return;
  }

  if (showLoading) {
    renderMessage("正在查询订单系统...");
  }

  try {
    const order = await fetchOrderByCode(trackedCode);
    codeInput.value = order.code;
    renderOrder(order);
  } catch {
    renderMessage("找不到这个订单编号。");
  }
}

function startRefresh() {
  if (refreshTimer) return;
  refreshTimer = window.setInterval(() => {
    loadTrackedOrder();
  }, 5000);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  trackedCode = codeInput.value.trim();
  const nextUrl = trackedCode ? `track.html?code=${encodeURIComponent(trackedCode)}` : "track.html";
  window.history.replaceState(null, "", nextUrl);
  loadTrackedOrder({ showLoading: true });
  startRefresh();
});

codeInput.value = trackedCode;
loadTrackedOrder({ showLoading: Boolean(trackedCode) });
startRefresh();
