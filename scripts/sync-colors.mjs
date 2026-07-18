/**
 * Sync brands.json colors with the imported SVG assets in public/logos/.
 *
 * Usage: node scripts/sync-colors.mjs [--write]
 *
 * Shade mode quizzes the player on colors[0], so it must match the logo the
 * player is looking at. For every brand whose asset embeds an SVG, this
 * extracts the explicit fill/stroke/stop colors and:
 *   - if the asset has exactly ONE saturated color and it differs from
 *     colors[0], updates colors[0].hex (with --write) or reports it;
 *   - if the asset is monochrome black and colors[0] claims a near-black,
 *     snaps colors[0] to the actual value;
 *   - otherwise prints asset colors next to data colors for manual review.
 * PNG-based assets can't be inspected this way and are listed at the end.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const write = process.argv.includes("--write");
const root = path.join(import.meta.dirname, "..");
const dataPath = path.join(root, "data", "brands.json");
const brands = JSON.parse(await readFile(dataPath, "utf8"));

function normalizeHex(raw) {
  let h = raw.toUpperCase();
  if (h.length === 4) h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  return h.slice(0, 7);
}

function isNeutral(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min < 26; // grays incl. white and black
}

const manual = [];
const pngs = [];
let changed = 0;

for (const brand of brands) {
  let svgText;
  try {
    svgText = await readFile(path.join(root, "public", "logos", `${brand.id}.svg`), "utf8");
  } catch {
    manual.push(`${brand.id}: MISSING ASSET`);
    continue;
  }
  const m = svgText.match(/base64,([^"]+)/);
  const inner = m ? Buffer.from(m[1], "base64").toString("utf8") : svgText;
  if (!inner.trimStart().startsWith("<")) {
    pngs.push(brand.id);
    continue;
  }

  const raw = [
    ...inner.matchAll(/(?:fill|stroke|stop-color)[=:]\s*"?'?(#[0-9a-fA-F]{3}\b|#[0-9a-fA-F]{6})/g),
  ].map((x) => normalizeHex(x[1]));
  const fills = [...new Set(raw)];
  const saturated = fills.filter((h) => !isNeutral(h));
  const current = brand.colors[0].hex.toUpperCase();

  if (saturated.length === 1) {
    if (!isNeutral(current)) {
      // Data claims a saturated primary: snap it to the asset's actual color.
      if (saturated[0] !== current) {
        console.log(`${brand.id.padEnd(14)} colors[0] ${current} -> ${saturated[0]}`);
        if (write) {
          brand.colors[0].hex = saturated[0];
          changed++;
        }
      }
    } else {
      // Neutral-dominant logo (black wordmark + colored accent): the saturated
      // fill corrects the accent, not the primary.
      const accent = brand.colors[1];
      if (accent && !isNeutral(accent.hex.toUpperCase()) && accent.hex.toUpperCase() !== saturated[0]) {
        console.log(`${brand.id.padEnd(14)} colors[1] ${accent.hex.toUpperCase()} -> ${saturated[0]}`);
        if (write) {
          accent.hex = saturated[0];
          changed++;
        }
      }
    }
  } else if (saturated.length === 0) {
    // Monochrome logo (possibly via default black fill).
    const black = fills.find((h) => parseInt(h.slice(1, 3), 16) < 40) ?? "#000000";
    if (isNeutralClaim(current) && current !== black) {
      console.log(`${brand.id.padEnd(14)} ${current} -> ${black} (monochrome)`);
      if (write) {
        brand.colors[0].hex = black;
        changed++;
      }
    } else if (!isNeutralClaim(current)) {
      manual.push(`${brand.id}: asset is monochrome (${fills.join(" ") || "default black"}) but data claims ${current}`);
    }
  } else {
    const dataColors = brand.colors.map((c) => c.hex.toUpperCase());
    const covered = dataColors.every((c) => fills.includes(c));
    if (!covered) {
      manual.push(`${brand.id}: asset [${saturated.join(" ")}] vs data [${dataColors.join(" ")}]`);
    }
  }
}

function isNeutralClaim(hex) {
  return isNeutral(hex);
}

if (write) {
  await writeFile(dataPath, JSON.stringify(brands, null, 2) + "\n");
  console.log(`\n${changed} colors[0] value(s) updated.`);
}
if (manual.length) console.log(`\nManual review:\n  ${manual.join("\n  ")}`);
if (pngs.length) console.log(`\nPNG assets (verify by eye): ${pngs.join(", ")}`);
