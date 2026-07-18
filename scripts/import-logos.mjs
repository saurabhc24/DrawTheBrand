/**
 * One-time logo import from the Brandfetch Brand API into public/logos/.
 *
 * Usage:
 *   node scripts/import-logos.mjs <BRANDFETCH_API_KEY>
 *   (or set BRANDFETCH_KEY in the environment)
 *   node scripts/import-logos.mjs hyundai ikea
 *
 * For each brand in data/brands.json this fetches the brand's best
 * light-background logo (SVG preferred, largest PNG as fallback) and wraps it
 * centered on the 512x512 white canvas the game's crop/reveal views expect.
 * Existing files in public/logos/ are overwritten; brands.json is untouched.
 * It also prints Brandfetch's reported brand colors next to ours, as input for
 * the manual hex-verification pass — nothing is auto-updated.
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const keyFromEnv = process.env.BRANDFETCH_KEY;
const API_KEY = keyFromEnv ?? process.argv[2];
if (!API_KEY) {
  console.error("Missing key. Run: node scripts/import-logos.mjs <BRANDFETCH_API_KEY>");
  process.exit(1);
}

/** Brand id -> the domain Brandfetch indexes it under. */
const DOMAINS = {
  nike: "nike.com",
  mcdonalds: "mcdonalds.com",
  pepsi: "pepsi.com",
  spotify: "spotify.com",
  cadbury: "cadbury.co.uk",
  google: "google.com",
  bmw: "bmw.com",
  amul: "amul.com",
  swiggy: "swiggy.com",
  zomato: "zomato.com",
  zepto: "zeptonow.com",
  paytm: "paytm.com",
  tata: "tata.com",
  mrf: "mrftyres.com",
  flipkart: "flipkart.com",
};

// Optional brand ids after the key restrict the run: node ... KEY mcdonalds zomato
// `--missing` restricts to brands that have no asset in public/logos yet.
const args = process.argv.slice(keyFromEnv ? 2 : 3);
const missingOnly = args.includes("--missing");
const only = new Set(args.filter((a) => a !== "--missing"));

const root = path.join(import.meta.dirname, "..");
let brands = JSON.parse(await readFile(path.join(root, "data", "brands.json"), "utf8"));
if (only.size) brands = brands.filter((b) => only.has(b.id));
if (missingOnly) {
  brands = brands.filter((b) => !existsSync(path.join(root, "public", "logos", `${b.id}.svg`)));
}

/**
 * Brands whose wordmark asset is monochrome or a text lockup — their icon
 * (golden arches, red Zomato tile, Flipkart cart) is truer to the palette the
 * game quizzes on.
 */
const PREFER_ICON = new Set([
  "mcdonalds", "zomato", "flipkart", "hyundai",
  // These brands' wordmark asset is monochrome; their symbol carries the color.
  "instagram", "snapchat", "mastercard", "kfc", "myntra", "paypal",
  "rolex", "ferrari", "porsche", "mercedes",
]);

const PREFER_LOGO = new Set(["ikea"]);

/** Prefer the full logo over icon/symbol, for-light-background over dark. */
function pickLogo(logos, brandId) {
  const iconFirst = PREFER_ICON.has(brandId);
  const logoFirst = PREFER_LOGO.has(brandId);
  const score = (l) => {
    const type = logoFirst
      ? { logo: 30, symbol: 10, icon: 0 }
      : iconFirst
      ? { symbol: 20, icon: 15, logo: 5 }
      : { logo: 20, symbol: 10, icon: 0 };
    return (type[l.type] ?? 0) + (l.theme === "dark" ? 5 : 0);
  };
  return [...logos].sort((a, b) => score(b) - score(a))[0];
}

function pickFormat(formats) {
  const svg = formats.find((f) => f.format === "svg");
  if (svg) return svg;
  return [...formats]
    .filter((f) => ["png", "webp"].includes(f.format))
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];
}

const MIME = { svg: "image/svg+xml", png: "image/png", webp: "image/webp" };

function wrapOnCanvas(bytes, format) {
  const dataUri = `data:${MIME[format]};base64,${Buffer.from(bytes).toString("base64")}`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">`,
    `  <rect width="512" height="512" fill="#FFFFFF"/>`,
    `  <image x="56" y="56" width="400" height="400" preserveAspectRatio="xMidYMid meet" href="${dataUri}"/>`,
    `</svg>`,
    ``,
  ].join("\n");
}

const failures = [];
for (const brand of brands) {
  const domain = brand.domain ?? DOMAINS[brand.id];
  if (!domain) {
    failures.push(`${brand.id}: no domain mapping`);
    continue;
  }
  try {
    let res;
    for (let attempt = 0; ; attempt++) {
      res = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      if (res.status !== 429 || attempt >= 3) break;
      const wait = 25000 * (attempt + 1);
      console.log(`      rate limited on ${brand.id}, waiting ${wait / 1000}s`);
      await new Promise((r) => setTimeout(r, wait));
    }
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();

    const logo = pickLogo(data.logos ?? [], brand.id);
    const format = logo && pickFormat(logo.formats ?? []);
    if (!format?.src) throw new Error("no usable logo asset");

    const asset = await fetch(format.src);
    if (!asset.ok) throw new Error(`asset ${asset.status}`);
    const bytes = await asset.arrayBuffer();

    const out = path.join(root, "public", "logos", `${brand.id}.svg`);
    await writeFile(out, wrapOnCanvas(bytes, format.format));

    const theirColors = (data.colors ?? []).map((c) => `${c.hex} (${c.type})`).join(", ");
    const ourColors = brand.colors.map((c) => c.hex).join(", ");
    console.log(`ok  ${brand.id.padEnd(10)} ${logo.type}/${format.format}`);
    console.log(`      ours: ${ourColors}\n      brandfetch: ${theirColors || "none"}`);
  } catch (err) {
    failures.push(`${brand.id}: ${err.message}`);
  }
}

if (failures.length) {
  console.error(`\n${failures.length} brand(s) kept their placeholder:\n  ${failures.join("\n  ")}`);
} else {
  console.log("\nAll logos imported.");
}
