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
  const accuracy = results.length ? Math.round((correct / results.length) * 100) : 0;

  return (
    <div className="animate-rise mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-6 pt-10">
      <p className="text-[11px] font-bold tracking-[0.25em] text-ink-muted uppercase">
        Your results
      </p>
      <p className="mt-2 text-sm text-ink-muted">
        {correct === results.length
          ? "A perfect run. Genuinely rare."
          : correct >= results.length * 0.7
            ? "Sharp eye. The gaps below are worth a second look."
            : "Recognizing is easy — remembering is the hard part. Run it again."}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="col-span-2 flex min-h-36 flex-col justify-between rounded-3xl bg-ink p-4 text-paper">
          <span className="text-[10px] font-bold tracking-[0.22em] text-paper/60 uppercase">
            Score
          </span>
          <span className="self-end text-6xl font-extrabold tracking-tight">
            {correct}
            <span className="text-2xl font-semibold text-paper/50">/{results.length}</span>
          </span>
        </div>
        <div className="flex min-h-28 flex-col justify-between rounded-3xl bg-block-orange p-4 text-white">
          <span className="text-[10px] font-bold tracking-[0.22em] text-white/70 uppercase">
            Best streak
          </span>
          <span className="self-end text-4xl font-extrabold">{bestStreak}</span>
        </div>
        <div className="flex min-h-28 flex-col justify-between rounded-3xl bg-block-pink p-4 text-ink">
          <span className="text-[10px] font-bold tracking-[0.22em] text-ink/60 uppercase">
            Accuracy
          </span>
          <span className="self-end text-4xl font-extrabold">{accuracy}%</span>
        </div>
      </div>

      <div className="mt-4">
        <ColorBar rounds={rounds} results={results} tall />
      </div>

      <ul className="mt-4 divide-y divide-rule overflow-hidden rounded-3xl border border-rule bg-card px-4">
        {results.map((r, i) => (
          <li key={i} className="flex items-center gap-3 py-2.5">
            <span
              className="h-4 w-4 shrink-0 rounded-md border border-rule"
              style={{ backgroundColor: r.brand.colors[0].hex }}
            />
            <span className="flex-1 text-sm font-bold">{r.brand.name}</span>
            <span
              className={`text-[11px] font-bold tracking-widest uppercase ${
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

      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={onReplay}
          className="pressable w-full rounded-full bg-ink py-4 text-base font-bold text-paper"
        >
          Play again
        </button>
        <Link
          href="/"
          className="pressable w-full rounded-full border border-ink/20 bg-card py-4 text-center text-base font-bold hover:border-ink"
        >
          Change mode
        </Link>
      </div>
    </div>
  );
}
