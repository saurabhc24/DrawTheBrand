export type BrandCategory =
  | "global-tech"
  | "global-sportswear"
  | "global-food"
  | "global-auto"
  | "global-fashion"
  | "global-retail"
  | "global-media"
  | "global-finance"
  | "global-travel"
  | "indian-d2c"
  | "indian-legacy"
  | "indian-auto"
  | "indian-food"
  | "indian-tech"
  | "indian-finance"
  | "indian-travel"
  | "indian-media";

export type GameMode = "draw" | "crop" | "wordmark" | "shade" | "colors" | "fake";

export type BrandColor = {
  hex: string;
  name?: string;
  pantone?: string;
  proportion?: number; // 0-1, share of the logo
};

export type FakeVariant = {
  image: string;
  whatsWrong: string;
};

export type Brand = {
  id: string;
  name: string;
  category: BrandCategory;
  region: "indian" | "global";
  difficulty: "easy" | "medium" | "hard";
  /** Domain Brandfetch indexes this brand under; used only by the import script. */
  domain?: string;
  assets: {
    logoFull: string;
    logoSilhouette?: string;
    wordmark?: string;
    drawReference?: string;
  };
  colors: BrandColor[]; // ordered by visual dominance
  fakeVariants?: FakeVariant[];
  funFact: string;
  excludeFromModes?: GameMode[];
};

/** Modes that are actually playable. */
export const PLAYABLE_MODES = ["colors", "shade", "crop", "draw"] as const;
export type PlayableMode = (typeof PLAYABLE_MODES)[number];

export type Pack = "all" | "indian" | "global";

/** One prepared round of a session. All randomness is resolved up front. */
export type Round = {
  mode: PlayableMode;
  brand: Brand;
  /** 4 brand options (colors + crop modes). Includes the answer, pre-shuffled. */
  options?: Brand[];
  /** 4 hex swatches (shade mode). Includes the true hex, pre-shuffled. */
  swatches?: string[];
  /** Crop window (crop mode). */
  crop?: { scale: number; fx: number; fy: number; backdrop: string };
};

export type RoundResult = {
  brand: Brand;
  mode: PlayableMode;
  correct: boolean;
  skipped: boolean;
  /** What the player picked: a brand id or a hex, depending on mode. */
  picked?: string;
  /** Draw mode: the sketch as a PNG data URL, and its 0–100 similarity score. */
  drawing?: string;
  score?: number;
};

export type Session = {
  mode: PlayableMode | "mixed";
  pack: Pack;
  rounds: Round[];
};
