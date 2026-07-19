/**
 * Canonical site URL for metadata, sitemap, and the share image. Override with
 * NEXT_PUBLIC_SITE_URL in Vercel if the deployment lives on another domain.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://draw-the-brand.vercel.app";

export const SITE_NAME = "Brandr";

export const SITE_DESCRIPTION =
  "A brand memory game. You recognize every logo instantly — but can you name Cadbury's exact purple, spot a doctored swoosh, or draw the McDonald's arches from memory? 100+ Indian and global brands, four game modes, five seconds a round.";
