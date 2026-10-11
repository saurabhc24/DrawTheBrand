import { colorDistance, shadeSwatches } from "./color";
import { getBrandsForMode, getBrandsForPack } from "./data";
import { paletteShift } from "./delta-e";
import { createRng, pick, shuffle, type Rng } from "./rng";
import {
  PLAYABLE_MODES,
  type Brand,
  type FakeLevel,
  type FakeSpec,
  type Pack,
  type PlayableMode,
  type Round,
  type Session,
} from "./types";

export const DEFAULT_ROUNDS = 10;
export const OPTION_COUNT = 4;

/**
 * Fake difficulty is a measured magnitude, not a fixed angle. Hue fakes target
 * a CIEDE2000 band (area-weighted across the palette, through the exact matrix
 * the browser's hue-rotate() applies), so a "hard" fake is equally subtle on
 * every logo. A raw 30° rotation, by contrast, ranges from ΔE 4 to 18 across
 * the roster. Squash fakes scale one axis within a band.
 */
export const FAKE_LEVELS: Record<
  FakeLevel,
  { deltaE: [number, number]; squash: [number, number] }
> = {
  easy: { deltaE: [20, 30], squash: [0.76, 0.81] },
  medium: { deltaE: [13, 20], squash: [0.81, 0.86] },
  hard: { deltaE: [8, 13], squash: [0.86, 0.9] },
};
const LEVELS: FakeLevel[] = ["easy", "medium", "hard"];

/** Fakes start obvious and get subtler through a session; obscure brands get one step more obvious. */
function fakeLevel(brand: Brand, progress: number): FakeLevel {
  const step =
    Math.floor(progress * LEVELS.length) -
    (brand.difficulty === "hard" ? 1 : 0);
  return LEVELS[Math.min(LEVELS.length - 1, Math.max(0, step))];
}

/** Smallest rotation (4–150°, the given direction first) whose shift reaches `target`. */
function rotationFor(
  brand: Brand,
  target: number,
  sign: number,
): number | null {
  for (const dir of [sign, -sign]) {
    for (let deg = 4; deg <= 150; deg++) {
      if (paletteShift(brand.colors, dir * deg) >= target) return dir * deg;
    }
  }
  return null;
}

const article = (level: FakeLevel) => (level === "easy" ? "an" : "a");

/**
 * Build the doctoring for a fake round at the given level. Logos whose palette
 * can't reach the level's color band under any rotation (Nike black) get a
 * proportion squeeze instead.
 */
function buildFake(brand: Brand, level: FakeLevel, rng: Rng): FakeSpec {
  const band = FAKE_LEVELS[level];
  const target = band.deltaE[0] + rng() * (band.deltaE[1] - band.deltaE[0]);
  const sign = rng() < 0.5 ? -1 : 1;
  const hueOk = rotationFor(brand, band.deltaE[0], sign) !== null;
  const kind = pick<FakeSpec["kind"]>(
    hueOk ? ["hue", "squashX", "squashY"] : ["squashX", "squashY"],
    rng,
  );
  if (kind === "hue") {
    const amount =
      rotationFor(brand, target, sign) ??
      rotationFor(brand, band.deltaE[0], sign)!;
    const deltaE = paletteShift(brand.colors, amount);
    return {
      kind,
      amount,
      level,
      deltaE,
      whatsWrong: `The colors were rotated ${Math.abs(amount)}° off the real shade — ΔE ${Math.round(deltaE)}, ${article(level)} ${level} fake.`,
    };
  }
  const amount = band.squash[0] + rng() * (band.squash[1] - band.squash[0]);
  const pct = Math.round(amount * 100);
  return kind === "squashX"
    ? {
        kind,
        amount,
        level,
        whatsWrong: `It was squeezed to ${pct}% of its real width — ${article(level)} ${level} fake.`,
      }
    : {
        kind,
        amount,
        level,
        whatsWrong: `It was squashed to ${pct}% of its real height — ${article(level)} ${level} fake.`,
      };
}

function playableModesFor(brand: Brand): PlayableMode[] {
  return PLAYABLE_MODES.filter(
    (m) => getBrandsForMode(m, [brand]).length === 1,
  );
}

/**
 * Distractors prefer brands from the same region (an Indian answer hides among
 * Indian options), then fill from the rest of the pool.
 */
function pickOptions(answer: Brand, pool: Brand[], rng: Rng): Brand[] {
  const others = pool.filter((b) => b.id !== answer.id);
  const sameRegion = shuffle(
    others.filter((b) => b.region === answer.region),
    rng,
  );
  const rest = shuffle(
    others.filter((b) => b.region !== answer.region),
    rng,
  );
  const distractors = [...sameRegion, ...rest].slice(0, OPTION_COUNT - 1);
  return shuffle([answer, ...distractors], rng);
}

/**
 * Focus-mode distractors share the answer's dominant color, so a blurred
 * red-and-yellow blob can't give McDonald's away: the call has to come from
 * shape. Three of the eight nearest colors, so lookalike sets still vary.
 */
function pickLookalikes(answer: Brand, pool: Brand[], rng: Rng): Brand[] {
  const hex = answer.colors[0].hex;
  const nearest = pool
    .filter((b) => b.id !== answer.id)
    .sort(
      (a, b) =>
        colorDistance(hex, a.colors[0].hex) -
        colorDistance(hex, b.colors[0].hex),
    )
    .slice(0, 8);
  const distractors = shuffle(nearest, rng).slice(0, OPTION_COUNT - 1);
  return shuffle([answer, ...distractors], rng);
}

function buildRound(
  brand: Brand,
  mode: PlayableMode,
  pool: Brand[],
  rng: Rng,
  /** Position in the session, 0 → 1. */
  progress: number,
): Round {
  const round: Round = { mode, brand };
  if (mode === "colors") {
    round.options = pickOptions(brand, pool, rng);
  }
  if (mode === "focus") {
    round.options = pickLookalikes(brand, pool, rng);
  }
  if (mode === "shade") {
    round.swatches = shadeSwatches(brand.colors[0].hex, rng);
  }
  if (mode === "fake") {
    round.fake =
      rng() < 0.5 ? buildFake(brand, fakeLevel(brand, progress), rng) : null;
  }
  return round;
}

export function buildSession(
  mode: PlayableMode | "mixed",
  pack: Pack,
  seed: number = Date.now(),
  roundCount: number = DEFAULT_ROUNDS,
): Session {
  const rng = createRng(seed);
  const pool = getBrandsForPack(pack);

  let rounds: Round[];
  if (mode === "mixed") {
    const candidates = shuffle(
      pool.filter((b) => playableModesFor(b).length > 0),
      rng,
    );
    rounds = candidates
      .slice(0, roundCount)
      .map((brand, i) =>
        buildRound(
          brand,
          pick(playableModesFor(brand), rng),
          pool,
          rng,
          i / roundCount,
        ),
      );
  } else {
    const candidates = shuffle(getBrandsForMode(mode, pool), rng);
    rounds = candidates
      .slice(0, roundCount)
      .map((brand, i) => buildRound(brand, mode, pool, rng, i / roundCount));
  }
  return { mode, pack, rounds };
}
