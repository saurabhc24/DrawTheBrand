import Link from "next/link";
import { ColorBar } from "./ColorBar";
import type { Round, RoundResult } from "@/lib/types";

/** End-of-session proof sheet: score, per-round recap, replay. */
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

  return (
    <div className="animate-rise mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden px-4 pb-4 pt-8">
      <p className="font-mono text-[11px] tracking-[0.25em] text-ink-muted uppercase">
        Your proof sheet
      </p>
      <h1 className="mt-2 text-6xl font-extrabold tracking-tight">
        {correct}
        <span className="text-2xl font-semibold text-ink-muted">/{results.length}</span>
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        {correct === results.length
          ? "A perfect sheet. Genuinely rare."
          : correct >= results.length * 0.7
            ? "Sharp eye. The gaps below are worth a second look."
            : "Recognizing is easy — remembering is the hard part. Run it again."}
        {bestStreak >= 3 && ` Best streak this session: ${bestStreak}.`}
      </p>

      <div className="mt-8">
        <ColorBar rounds={rounds} results={results} tall />
      </div>

      <ul className="mt-6 min-h-0 flex-1 divide-y divide-rule overflow-y-auto border-y border-rule">
        {results.map((r, i) => (
          <li key={i} className="flex items-center gap-3 py-2.5">
            <span
              className="h-4 w-4 shrink-0 rounded-[2px] border border-rule"
              style={{ backgroundColor: r.brand.colors[0].hex }}
            />
            <span className="flex-1 text-sm font-semibold">{r.brand.name}</span>
            <span
              className={`font-mono text-[11px] tracking-widest uppercase ${
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

      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={onReplay}
          className="pressable w-full rounded-md bg-ink py-4 text-base font-bold text-paper"
        >
          Play again
        </button>
        <Link
          href="/"
          className="pressable w-full rounded-md border border-rule bg-card py-4 text-center text-base font-bold"
        >
          Change mode
        </Link>
      </div>
    </div>
  );
}
