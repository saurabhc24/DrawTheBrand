import { staticFile } from "remotion";
import brands from "../../data/brands.json";

/** The game's dataset, read straight from the app repo. */
export const BRANDS = brands as {
  id: string;
  name: string;
  colors: { hex: string; name?: string; proportion?: number }[];
}[];

export const brand = (id: string) => BRANDS.find((b) => b.id === id)!;
export const logo = (id: string) => staticFile(`logos/${id}.svg`);

function hsl(hex: string) {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}

/** Same spectrum order as the home page's calibration strip (app/page.tsx). */
const key = (hex: string) => {
  const { h, s, l } = hsl(hex);
  return s < 0.12 ? 1000 - l : (h + 20) % 360;
};
export const SPECTRUM = BRANDS.map((b) => b.colors[0].hex).sort(
  (a, b) => key(a) - key(b),
);

/** The strip: one chip per mosaic column, sampled evenly across the spectrum. */
export const CHIPS = 30;
export const CHIP_COLORS = Array.from(
  { length: CHIPS },
  (_, i) => SPECTRUM[Math.floor(((i + 0.5) * SPECTRUM.length) / CHIPS)],
);

/** Logos that flicker past in the "10,000 times" beat. */
export const FLICKER = [
  "nike", "amul", "google", "swiggy", "netflix", "pepsi", "zomato", "apple",
  "airtel", "lego", "kfc", "tata", "ikea", "cadbury", "spotify", "jio",
  "starbucks", "flipkart", "shell", "bmw", "youtube", "paytm", "visa", "dhl",
  "facebook", "thumsup", "reddit", "britannia",
];
