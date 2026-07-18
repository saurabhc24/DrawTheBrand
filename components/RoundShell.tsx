import Link from "next/link";
import { ColorBar } from "./ColorBar";
import type { Round, RoundResult } from "@/lib/types";

const MODE_LABELS: Record<string, string> = {
  colors: "Name the palette",
  shade: "Exact shade",
  fake: "Real or fake",
  draw: "Draw from memory",
};

export function RoundShell({
  rounds,
  results,
  index,
  streak,
  onSkip,
  showSkip,
  timer,
  children,
}: {
  rounds: Round[];
  results: RoundResult[];
  index: number;
  streak: number;
  onSkip: () => void;
  showSkip: boolean;
  /** Round clock; omitted on the reveal, where the bar disappears. */
  timer?: { frac: number; seconds: number };
  children: React.ReactNode;
}) {
  const round = rounds[index];
  const urgent = timer !== undefined && timer.frac <= 0.32;
  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden px-4 pb-4 pt-4">
      <header className="flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Leave the game"
          className="pressable -m-2 p-2 text-ink-muted hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </Link>
        <span className="text-xs font-bold tracking-widest text-ink-muted uppercase">
          Round {index + 1}/{rounds.length}
        </span>
        <span
          className={`text-xs font-bold tracking-widest uppercase ${
            streak >= 2 ? "text-proof" : "text-ink-muted"
          }`}
        >
          Streak {streak}
        </span>
      </header>

      <div className="mt-3">
        <ColorBar rounds={rounds} results={results} currentIndex={index} />
      </div>

      {/* Round clock: drains left to right, turns red when time runs short. */}
      <div
        className={`mt-2 flex items-center gap-2 ${timer === undefined ? "invisible" : ""}`}
        aria-hidden={timer === undefined}
      >
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-rule">
          <div
            className={`h-full rounded-full transition-[width] duration-100 ease-linear ${
              urgent ? "bg-flag" : "bg-ink"
            }`}
            style={{ width: `${(timer?.frac ?? 0) * 100}%` }}
          />
        </div>
        <span
          className={`w-4 text-right text-xs font-bold tabular-nums ${
            urgent ? "text-flag" : "text-ink-muted"
          }`}
        >
          {timer?.seconds ?? 0}
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <p className="text-[11px] font-bold tracking-[0.2em] text-ink-muted uppercase">
          {MODE_LABELS[round.mode]}
        </p>
        {showSkip && (
          <button
            onClick={onSkip}
            className="pressable text-[11px] font-bold tracking-[0.2em] text-ink-muted uppercase underline underline-offset-4 hover:text-ink"
          >
            Skip
          </button>
        )}
      </div>

      {/* Scrolls when a screen is taller than the viewport, so nothing clips
          on small phones; short content still pins its actions to the bottom. */}
      <main className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
