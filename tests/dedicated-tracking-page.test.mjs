import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const trackHtml = readFileSync(new URL("../track.html", import.meta.url), "utf8");
const trackJs = readFileSync(new URL("../track.js", import.meta.url), "utf8");

test("tracking is available as a dedicated page instead of the menu page footer", () => {
  assert.match(indexHtml, /href="track\.html"/);
  assert.match(indexHtml, /<section class="track-section" id="track" hidden>/);
  assert.match(trackHtml, /id="trackPageResult"/);
  assert.match(trackHtml, /src="track\.js\?v=20260613-track-page"/);
});

test("dedicated tracking page auto-refreshes one current status", () => {
  assert.match(trackJs, /fetchOrderByCode\(trackedCode\)/);
  assert.match(trackJs, /window\.setInterval/);
  assert.doesNotMatch(trackJs, /order\.history\s*\.map/);
});
