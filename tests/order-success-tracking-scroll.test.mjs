import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");

test("successful checkout opens the dedicated tracking page", () => {
  const submitHandler = appSource.match(/orderForm\.addEventListener\("submit", async \(event\) => \{[\s\S]*?\n\}\);/)?.[0] || "";

  assert.match(
    submitHandler,
    /window\.location\.href = `track\.html\?code=\$\{encodeURIComponent\(order\.code\)\}`;/,
    "checkout success should navigate to the dedicated tracking page",
  );
  assert.doesNotMatch(
    submitHandler,
    /scrollIntoView/,
    "checkout success should not scroll within the menu page",
  );
});
