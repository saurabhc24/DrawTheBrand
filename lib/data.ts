import rawBrands from "@/data/brands.json";
import type { Brand, GameMode, Pack } from "./types";

export const brands = rawBrands as Brand[];

/**
 * Mode eligibility is derived from which data fields exist (PRD §5), with
 * `excludeFromModes` as an explicit override. No special-case code per brand.
 */
export function isEligible(brand: Brand, mode: GameMode): boolean {
  if (brand.excludeFromModes?.includes(mode)) return false;
  switch (mode) {
    case "draw":
      return !!brand.assets.drawReference || !!brand.assets.logoFull;
    case "crop":
      return !!brand.assets.logoFull;
    case "wordmark":
      return !!brand.assets.wordmark;
    case "shade":
      return brand.colors.length >= 1;
    case "colors":
      return brand.colors.length >= 2;
    case "fake":
      return (brand.fakeVariants?.length ?? 0) >= 1;
  }
}

export function getBrandsForMode(mode: GameMode, pool: Brand[] = brands): Brand[] {
  return pool.filter((b) => isEligible(b, mode));
}

export function getBrandsForPack(pack: Pack): Brand[] {
  if (pack === "all") return brands;
  return brands.filter((b) => b.region === pack);
}
