import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");

test("successful checkout scrolls buyers to the tracking section", () => {
  const submitHandler = appSource.match(/orderForm\.addEventListener\("submit", async \(event\) => \{[\s\S]*?\n\}\);/)?.[0] || "";

  assert.match(
    submitHandler,
    /trackSection\.scrollIntoView\(\{ behavior: "smooth", block: "start" \}\);/,
    "checkout success should scroll to the order tracking section",
  );
  assert.doesNotMatch(
    submitHandler,
    /latestOrder\.scrollIntoView/,
    "checkout success should not stop at the latest-order confirmation card",
  );
});
