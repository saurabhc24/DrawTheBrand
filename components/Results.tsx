import Link from "next/link";
import { ColorBar } from "./ColorBar";
import type { Round, RoundResult } from "@/lib/types";

/** End-of-session recap as a bento of flat stat cards. */
export function Results({
  rounds,
  results,
  bestStreak,
  onReplay,
}: {
  rounds: Round[];
  results: RoundResult[];
  bestStreak: number;
  onReplay: () => void;
}) {
  const correct = results.filter((r) => r.correct).length;
  const accuracy = results.length
    ? Math.round((correct / results.length) * 100)
    : 0;

  return (
    <div className="results-screen animate-rise mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden px-4 pt-8 pb-4">
      <p className="results-eyebrow text-ink-muted shrink-0 text-[11px] font-bold tracking-[0.25em] uppercase">
        Your results
      </p>
      <p className="results-verdict text-ink-muted mt-2 shrink-0 text-sm">
        {correct === results.length
          ? "A perfect run. Genuinely rare."
          : correct >= results.length * 0.7
            ? "Sharp eye. The gaps below are worth a second look."
            : "Recognizing is easy — remembering is the hard part. Run it again."}
      </p>

      <div className="results-bento mt-4 grid shrink-0 grid-cols-2 gap-3">
        <div className="score-card bg-ink text-paper col-span-2 flex min-h-32 flex-col justify-between rounded-3xl p-4">
          <span className="score-card-label text-paper/60 text-[10px] font-bold tracking-[0.22em] uppercase">
            Score
          </span>
          <span className="score-card-value self-end text-6xl font-extrabold tracking-tight">
            {correct}
            <span className="score-card-total text-paper/50 text-2xl font-semibold">
              /{results.length}
            </span>
          </span>
        </div>
        <div className="streak-card bg-block-orange flex min-h-24 flex-col justify-between rounded-3xl p-4 text-white">
          <span className="streak-card-label text-[10px] font-bold tracking-[0.22em] text-white/70 uppercase">
            Best streak
          </span>
          <span className="streak-card-value self-end text-4xl font-extrabold">
            {bestStreak}
          </span>
        </div>
        <div className="accuracy-card bg-block-pink text-ink flex min-h-24 flex-col justify-between rounded-3xl p-4">
          <span className="accuracy-card-label text-ink/60 text-[10px] font-bold tracking-[0.22em] uppercase">
            Accuracy
          </span>
          <span className="accuracy-card-value self-end text-4xl font-extrabold">
            {accuracy}%
          </span>
        </div>
      </div>

      <div className="results-colorbar mt-4 shrink-0">
        <ColorBar rounds={rounds} results={results} tall />
      </div>

      <ul className="recap-list divide-rule border-rule bg-card mt-4 min-h-0 flex-1 divide-y overflow-y-auto rounded-3xl border px-4">
        {results.map((r, i) => (
          <li key={i} className="recap-row flex items-center gap-3 py-2.5">
            <span
              className="recap-swatch border-rule h-4 w-4 shrink-0 rounded-md border"
              style={{ backgroundColor: r.brand.colors[0].hex }}
            />
            <span className="recap-brand flex-1 text-sm font-bold">
              {r.brand.name}
            </span>
            <span
              className={`recap-outcome text-[11px] font-bold tracking-widest uppercase ${
                r.correct ? "text-proof" : "text-flag"
              }`}
            >
              {r.mode === "draw" && r.score != null
                ? `${r.score}/100`
                : r.correct
                  ? "OK"
                  : r.skipped
                    ? "Skip"
                    : "Miss"}
            </span>
          </li>
        ))}
      </ul>

      <div className="results-actions flex shrink-0 flex-col gap-2.5 pt-4">
        <button
          onClick={onReplay}
          className="replay-button pressable bg-ink text-paper w-full rounded-full py-3.5 text-base font-bold"
        >
          Play again
        </button>
        <Link
          href="/"
          className="home-button pressable border-ink/20 bg-card hover:border-ink w-full rounded-full border py-3.5 text-center text-base font-bold"
        >
          Change mode
        </Link>
      </div>
    </div>
  );
}
