import { shadeSwatches } from "./color";
import { getBrandsForMode, getBrandsForPack } from "./data";
import { createRng, pick, shuffle, type Rng } from "./rng";
import {
  PLAYABLE_MODES,
  type Brand,
  type Pack,
  type PlayableMode,
  type Round,
  type Session,
} from "./types";

export const DEFAULT_ROUNDS = 10;
export const OPTION_COUNT = 4;

const CROP_FOCUS_POINTS = [
  { fx: 0.32, fy: 0.42 },
  { fx: 0.5, fy: 0.42 },
  { fx: 0.68, fy: 0.42 },
  { fx: 0.32, fy: 0.58 },
  { fx: 0.5, fy: 0.58 },
  { fx: 0.68, fy: 0.58 },
];

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
  if (mode === "colors" || mode === "crop") {
    round.options = pickOptions(brand, pool, rng);
  }
  if (mode === "shade") {
    round.swatches = shadeSwatches(brand.colors[0].hex, rng);
  }
  if (mode === "crop") {
    const focus = pick(CROP_FOCUS_POINTS, rng);
    round.crop = {
      scale: 3.2 + rng() * 1.2,
      fx: focus.fx + (rng() - 0.5) * 0.05,
      fy: focus.fy + (rng() - 0.5) * 0.05,
      backdrop: brand.colors[0].hex,
    };
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
