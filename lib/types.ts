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
export const PLAYABLE_MODES = ["colors", "shade", "fake", "draw"] as const;
export type PlayableMode = (typeof PLAYABLE_MODES)[number];

export type Pack = "all" | "indian" | "global";

/**
 * A procedurally doctored logo (fake mode). Fakes are rendered from the real
 * asset with a CSS distortion, so every brand plays without hand-made assets;
 * hand-crafted `fakeVariants` in brands.json can override this later.
 */
export type FakeSpec = {
  kind: "squashX" | "squashY" | "hue";
  /** scale factor for squash kinds, degrees for hue. */
  amount: number;
  whatsWrong: string;
};

/** One prepared round of a session. All randomness is resolved up front. */
export type Round = {
  mode: PlayableMode;
  brand: Brand;
  /** 4 brand options (colors mode). Includes the answer, pre-shuffled. */
  options?: Brand[];
  /** 4 hex swatches (shade mode). Includes the true hex, pre-shuffled. */
  swatches?: string[];
  /** Fake mode: the doctoring to show, or null when this round shows the real mark. */
  fake?: FakeSpec | null;
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
  /** Fake mode: what was shown — null means the real mark was shown. */
  shownFake?: FakeSpec | null;
  /** The round clock ran out before an answer. */
  timedOut?: boolean;
};

export type Session = {
  mode: PlayableMode | "mixed";
  pack: Pack;
  rounds: Round[];
};
