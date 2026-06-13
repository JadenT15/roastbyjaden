import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const apiStores = [
  "../shared/api-store.js",
  "../seller-admin-vercel/shared/api-store.js",
];

test("checkout never creates browser-only orders when the API is unavailable", () => {
  for (const apiStore of apiStores) {
    const source = readFileSync(new URL(apiStore, import.meta.url), "utf8");
    const createOrderSource = source.match(/export async function createOrder\(payload\) \{[\s\S]*?\n\}/)?.[0] || "";

    assert.doesNotMatch(
      createOrderSource,
      /createLocalOrder\(/,
      `${apiStore} should fail checkout instead of creating an order only in local browser storage`,
    );
  }
});
