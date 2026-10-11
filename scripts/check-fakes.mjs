/**
 * Self-check for the fake-measuring color math (lib/delta-e.ts).
 * Run: node scripts/check-fakes.mjs   (Node 23.6+ runs the .ts import directly)
 */
import assert from "node:assert/strict";
import { deltaE2000, hexToRgb, hueRotate, rgbToLab } from "../lib/delta-e.ts";

const near = (actual, expected, tol, label) =>
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `${label}: got ${actual}, want ${expected}`,
  );

// CIEDE2000 reference pairs from Sharma, Wu & Dalal (2005), Table 1.
const SHARMA = [
  [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
  [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
  [[50, 2.8361, -74.02], [50, 0, -82.7485], 3.4412],
  [[50, 0, 0], [50, -1, 2], 2.3669],
  [[50, 2.5, 0], [73, 25, -18], 27.1492],
  [[50, 2.5, 0], [61, -5, 29], 22.8977],
  [[50, 2.5, 0], [56, -27, -3], 31.903],
  [[50, 2.5, 0], [58, 24, 15], 19.4535],
  [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
  [[63.0109, -31.0961, -5.8663], [62.8187, -29.7946, -4.0864], 1.263],
];
for (const [a, b, want] of SHARMA) {
  near(deltaE2000(a, b), want, 1e-4, `ΔE00 ${a} vs ${b}`);
  near(deltaE2000(b, a), want, 1e-4, `ΔE00 symmetric ${b} vs ${a}`);
}

// sRGB → Lab anchors (D65).
const white = rgbToLab(hexToRgb("#FFFFFF"));
near(white[0], 100, 0.01, "white L");
near(Math.hypot(white[1], white[2]), 0, 0.01, "white chroma");
const red = rgbToLab(hexToRgb("#FF0000"));
near(red[0], 53.2408, 0.01, "red L");
near(red[1], 80.0925, 0.01, "red a");
near(red[2], 67.2032, 0.01, "red b");

// hue-rotate(): identity at 0°, greys untouched at any angle.
assert.deepEqual(
  hueRotate([0.2, 0.5, 0.8], 0).map((v) => +v.toFixed(9)),
  [0.2, 0.5, 0.8],
);
for (const deg of [17, 90, 180, -133]) {
  hueRotate([0.4, 0.4, 0.4], deg).forEach((v) =>
    near(v, 0.4, 1e-9, `grey at ${deg}°`),
  );
}

console.log(
  `check-fakes: ${SHARMA.length} CIEDE2000 pairs, Lab anchors and hue-rotate invariants OK`,
);
