/**
 * Perceptual color math for measuring fakes: the CSS `hue-rotate()` filter as
 * browsers apply it, sRGB → CIELAB, and CIEDE2000 (Sharma, Wu & Dalal 2005).
 * Dependency-free so scripts/check-fakes.mjs can run it directly under Node.
 */
export type RGB = [number, number, number]; // sRGB channels, 0–1
export type Lab = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const n = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255) as RGB;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** The `hue-rotate()` filter matrix (Filter Effects spec), on sRGB values. Greys pass through. */
export function hueRotate([r, g, b]: RGB, deg: number): RGB {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [
    clamp01(
      r * (0.213 + c * 0.787 - s * 0.213) +
        g * (0.715 - c * 0.715 - s * 0.715) +
        b * (0.072 - c * 0.072 + s * 0.928),
    ),
    clamp01(
      r * (0.213 - c * 0.213 + s * 0.143) +
        g * (0.715 + c * 0.285 + s * 0.14) +
        b * (0.072 - c * 0.072 - s * 0.283),
    ),
    clamp01(
      r * (0.213 - c * 0.213 - s * 0.787) +
        g * (0.715 - c * 0.715 + s * 0.715) +
        b * (0.072 + c * 0.928 + s * 0.072),
    ),
  ];
}

/** sRGB → CIELAB (D65). */
export function rgbToLab([r, g, b]: RGB): Lab {
  const lin = (v: number) =>
    v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const f = (t: number) =>
    t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116;
  const fx = f((R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047);
  const fy = f(R * 0.2126729 + G * 0.7151522 + B * 0.072175);
  const fz = f((R * 0.0193339 + G * 0.119192 + B * 0.9503041) / 1.08883);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

const rad = (d: number) => (d * Math.PI) / 180;
const hue = (b: number, a: number) => {
  if (a === 0 && b === 0) return 0;
  const d = (Math.atan2(b, a) * 180) / Math.PI;
  return d >= 0 ? d : d + 360;
};

/** CIEDE2000 color difference. ~2.3 is a just-noticeable difference side by side. */
export function deltaE2000([L1, a1, b1]: Lab, [L2, a2, b2]: Lab): number {
  const Cbar = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cbar ** 7 / (Cbar ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const h1p = hue(b1, a1p);
  const h2p = hue(b2, a2p);
  const chroma = C1p * C2p;

  let dhp = 0;
  if (chroma !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  const dHp = 2 * Math.sqrt(chroma) * Math.sin(rad(dhp) / 2);

  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p;
  if (chroma !== 0) {
    if (Math.abs(h1p - h2p) > 180) hbp += hbp < 360 ? 360 : -360;
    hbp /= 2;
  }
  const T =
    1 -
    0.17 * Math.cos(rad(hbp - 30)) +
    0.24 * Math.cos(rad(2 * hbp)) +
    0.32 * Math.cos(rad(3 * hbp + 6)) -
    0.2 * Math.cos(rad(4 * hbp - 63));
  const dTheta = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbp;
  const Sh = 1 + 0.015 * Cbp * T;
  const Rt = -Math.sin(rad(2 * dTheta)) * Rc;
  return Math.sqrt(
    (dLp / Sl) ** 2 +
      (dCp / Sc) ** 2 +
      (dHp / Sh) ** 2 +
      Rt * (dCp / Sc) * (dHp / Sh),
  );
}

/**
 * How different a hue-rotated logo reads: CIEDE2000 between each palette color
 * and its rotated self, weighted by the color's share of the logo. Neutrals
 * don't move under hue-rotate, so mostly-black logos score low — correctly.
 */
export function paletteShift(
  colors: { hex: string; proportion?: number }[],
  deg: number,
): number {
  let sum = 0;
  let weight = 0;
  for (const c of colors) {
    const w = c.proportion ?? 1 / colors.length;
    const rgb = hexToRgb(c.hex);
    sum += w * deltaE2000(rgbToLab(rgb), rgbToLab(hueRotate(rgb, deg)));
    weight += w;
  }
  return weight ? sum / weight : 0;
}
