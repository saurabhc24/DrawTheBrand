import type { Rng } from "./rng";
import { shuffle } from "./rng";

type Hsl = { h: number; s: number; l: number };

export function hexToHsl(hex: string): Hsl {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

export function hslToHex({ h, s, l }: Hsl): string {
  const hue = ((h % 360) + 360) % 360;
  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

const clamp01 = (v: number, min = 0.03, max = 0.97) => Math.min(max, Math.max(min, v));

/**
 * Build near-identical distractor swatches for shade mode: the true hex nudged
 * slightly in hue/saturation/lightness. Near-neutral colors (Nike black) get
 * lightness/tint nudges instead, since hue shifts there are invisible.
 */
export function shadeSwatches(trueHex: string, rng: Rng): string[] {
  const base = hexToHsl(trueHex);
  const neutral = base.s < 0.14 || base.l < 0.12 || base.l > 0.94;
  const sign = () => (rng() < 0.5 ? -1 : 1);
  const range = (min: number, max: number) => min + rng() * (max - min);

  const candidates: Hsl[] = [];
  const tries = 24;
  for (let i = 0; i < tries && candidates.length < 3; i++) {
    let variant: Hsl;
    if (neutral) {
      const kind = Math.floor(rng() * 3);
      if (kind === 0) variant = { ...base, l: clamp01(base.l + sign() * range(0.05, 0.1)) };
      else if (kind === 1)
        variant = { h: range(0, 360), s: clamp01(base.s + range(0.05, 0.12)), l: base.l };
      else
        variant = {
          h: range(0, 360),
          s: clamp01(base.s + range(0.04, 0.09)),
          l: clamp01(base.l + sign() * range(0.04, 0.08)),
        };
    } else {
      const kind = Math.floor(rng() * 3);
      if (kind === 0) variant = { ...base, h: base.h + sign() * range(6, 13) };
      else if (kind === 1) variant = { ...base, l: clamp01(base.l + sign() * range(0.06, 0.11)) };
      else
        variant = {
          h: base.h + sign() * range(4, 9),
          s: clamp01(base.s + sign() * range(0.06, 0.13)),
          l: clamp01(base.l + sign() * range(0.04, 0.07)),
        };
    }
    const hex = hslToHex(variant);
    if (hex !== trueHex.toUpperCase() && !candidates.some((c) => hslToHex(c) === hex)) {
      candidates.push(variant);
    }
  }
  // Degenerate fallback (should not happen): plain lightness steps.
  while (candidates.length < 3) {
    candidates.push({ ...base, l: clamp01(base.l + (candidates.length + 1) * 0.08) });
  }
  return shuffle([trueHex.toUpperCase(), ...candidates.map(hslToHex)], rng);
}

/** Pick a readable text color (paper ink or white) for a given background. */
export function inkOn(hex: string): string {
  const { l } = hexToHsl(hex);
  return l > 0.6 ? "#141416" : "#FFFFFF";
}

/**
 * Mix a color toward white. Used for the crop-mode backdrop: the brand hue
 * must only wash the empty areas — a dark hex used raw would multiply the
 * whole crop into an unreadable dark square.
 */
export function paperTint(hex: string, whiteAmount = 0.85): string {
  const n = hex.replace("#", "");
  const mix = (i: number) => {
    const channel = parseInt(n.slice(i, i + 2), 16);
    return Math.round(channel + (255 - channel) * whiteAmount)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${mix(0)}${mix(2)}${mix(4)}`.toUpperCase();
}
