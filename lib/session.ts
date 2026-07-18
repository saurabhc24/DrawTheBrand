import { hexToHsl, shadeSwatches } from "./color";
import { getBrandsForMode, getBrandsForPack } from "./data";
import { createRng, pick, shuffle, type Rng } from "./rng";
import {
  PLAYABLE_MODES,
  type Brand,
  type FakeSpec,
  type Pack,
  type PlayableMode,
  type Round,
  type Session,
} from "./types";

export const DEFAULT_ROUNDS = 10;
export const OPTION_COUNT = 4;

/**
 * Build the doctoring for a fake round. Colored logos can get a hue shift;
 * monochrome ones (where a hue shift is invisible) get a proportion squeeze.
 */
function buildFake(brand: Brand, rng: Rng): FakeSpec {
  const saturated = brand.colors.some((c) => hexToHsl(c.hex).s >= 0.18);
  const kinds: FakeSpec["kind"][] = saturated
    ? ["hue", "squashX", "squashY"]
    : ["squashX", "squashY"];
  const kind = pick(kinds, rng);
  if (kind === "hue") {
    const amount = (24 + Math.round(rng() * 14)) * (rng() < 0.5 ? -1 : 1);
    return { kind, amount, whatsWrong: "The colors were shifted off the real shade." };
  }
  const amount = 0.8 + rng() * 0.06;
  return kind === "squashX"
    ? { kind, amount, whatsWrong: "It was squeezed narrower — the real mark is wider." }
    : { kind, amount, whatsWrong: "It was squashed flatter — the real mark is taller." };
}

function playableModesFor(brand: Brand): PlayableMode[] {
  return PLAYABLE_MODES.filter((m) => getBrandsForMode(m, [brand]).length === 1);
}

/**
 * Distractors prefer brands from the same region (an Indian answer hides among
 * Indian options), then fill from the rest of the pool.
 */
function pickOptions(answer: Brand, pool: Brand[], rng: Rng): Brand[] {
  const others = pool.filter((b) => b.id !== answer.id);
  const sameRegion = shuffle(others.filter((b) => b.region === answer.region), rng);
  const rest = shuffle(others.filter((b) => b.region !== answer.region), rng);
  const distractors = [...sameRegion, ...rest].slice(0, OPTION_COUNT - 1);
  return shuffle([answer, ...distractors], rng);
}

function buildRound(brand: Brand, mode: PlayableMode, pool: Brand[], rng: Rng): Round {
  const round: Round = { mode, brand };
  if (mode === "colors") {
    round.options = pickOptions(brand, pool, rng);
  }
  if (mode === "shade") {
    round.swatches = shadeSwatches(brand.colors[0].hex, rng);
  }
  if (mode === "fake") {
    round.fake = rng() < 0.5 ? buildFake(brand, rng) : null;
  }
  return round;
}

export function buildSession(
  mode: PlayableMode | "mixed",
  pack: Pack,
  seed: number = Date.now(),
  roundCount: number = DEFAULT_ROUNDS
): Session {
  const rng = createRng(seed);
  const pool = getBrandsForPack(pack);

  let rounds: Round[];
  if (mode === "mixed") {
    const candidates = shuffle(pool.filter((b) => playableModesFor(b).length > 0), rng);
    rounds = candidates
      .slice(0, roundCount)
      .map((brand) => buildRound(brand, pick(playableModesFor(brand), rng), pool, rng));
  } else {
    const candidates = shuffle(getBrandsForMode(mode, pool), rng);
    rounds = candidates.slice(0, roundCount).map((brand) => buildRound(brand, mode, pool, rng));
  }
  return { mode, pack, rounds };
}
