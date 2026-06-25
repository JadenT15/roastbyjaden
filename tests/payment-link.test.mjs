import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const appJs = readFileSync(new URL("../app.js", import.meta.url), "utf8");

test("buyer checkout hides payment QR until an order is created", () => {
  assert.doesNotMatch(indexHtml, /id="paymentQrPanel"/);
  assert.doesNotMatch(indexHtml, /id="tngPaymentLink"/);
  assert.doesNotMatch(indexHtml, /id="paymentConfirmed"/);
  assert.match(indexHtml, /id="orderPaymentPanel" hidden/);
});

test("buyer checkout creates the order before showing the payment QR", () => {
  assert.doesNotMatch(appJs, /paymentConfirmAlert/);
  assert.match(indexHtml, /id="orderPaymentPanel"/);
  assert.match(appJs, /paymentPendingOrder/);
  assert.match(indexHtml, /assets\/tng-duitnow-qr\.png/);
  assert.match(indexHtml, /id="paymentWhatsappLink"/);
  assert.doesNotMatch(appJs, /api\.qrserver\.com\/v1\/create-qr-code/);
});

test("local payment confirmation is available only for preview testing", () => {
  assert.match(appJs, /simulatePaymentSuccess/);
  assert.match(appJs, /confirmLocalTestPayment/);
  assert.match(appJs, /IS_LOCAL_PREVIEW/);
});

test("paid orders automatically show the tracking section", () => {
  assert.match(appJs, /scrollToOrderStatus/);
  assert.match(appJs, /order\.paymentStatus === "PAID"/);
  assert.match(appJs, /trackSection\.scrollIntoView/);
});
