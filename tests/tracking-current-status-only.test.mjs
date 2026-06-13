import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");

test("tracking result shows only the current seller-selected status", () => {
  const renderTrackingSource = appSource.match(/function renderTracking\(state\) \{[\s\S]*?\n\}/)?.[0] || "";

  assert.doesNotMatch(
    renderTrackingSource,
    /order\.history\s*\.map/,
    "buyer tracking should not render the full status history",
  );
  assert.match(
    renderTrackingSource,
    /translateStatus\(order\.status\)/,
    "buyer tracking should still show the order's current status",
  );
});
