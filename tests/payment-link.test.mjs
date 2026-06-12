import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const appJs = readFileSync(new URL("../app.js", import.meta.url), "utf8");

test("buyer checkout links to the TNG business payment page", () => {
  assert.match(indexHtml, /id="tngPaymentLink"/);
  assert.match(appJs, /https:\/\/payment\.tngdigital\.com\.my\/sc\/bDLos9KsJZ/);
});
