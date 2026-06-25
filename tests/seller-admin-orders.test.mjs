import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adminHtml = readFileSync(new URL("../seller-admin-vercel/index.html", import.meta.url), "utf8");
const adminJs = readFileSync(new URL("../seller-admin-vercel/admin.js", import.meta.url), "utf8");
const apiStoreJs = readFileSync(new URL("../seller-admin-vercel/shared/api-store.js", import.meta.url), "utf8");

test("seller admin shows the orders returned by the admin API", () => {
  assert.match(apiStoreJs, /export function getTodayOrders\(state = currentState\) {\s+return state\.orders;/);
  assert.doesNotMatch(apiStoreJs, /return state\.orders\.filter\(\(order\) => isToday\(order\.createdAt\)\);/);
});

test("seller admin busts cached order scripts", () => {
  assert.match(adminHtml, /admin\.js\?v=20260625-admin-orders/);
  assert.match(adminJs, /shared\/api-store\.js\?v=20260625-admin-orders/);
});
