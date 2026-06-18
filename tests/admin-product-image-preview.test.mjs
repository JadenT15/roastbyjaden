import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adminSource = readFileSync(new URL("../seller-admin-vercel/admin.js", import.meta.url), "utf8");
const adminCss = readFileSync(new URL("../seller-admin-vercel/admin.css", import.meta.url), "utf8");

test("seller product cards show each product image", () => {
  assert.match(adminSource, /function getProductImageSrc\(product\)/);
  assert.match(adminSource, /\.\.\/\$\{image\}/);
  assert.match(adminSource, /class="product-image-preview"/);
  assert.match(adminSource, /src="\$\{escapeHTML\(getProductImageSrc\(product\)\)/);
  assert.match(adminSource, /alt="\$\{escapeHTML\(product\.name/);
  assert.match(adminCss, /\.product-image-preview/);
});
