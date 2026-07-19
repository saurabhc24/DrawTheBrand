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
    <div className="round-shell mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden px-4 pt-4 pb-4">
      <header className="round-header flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Leave the game"
          className="quit-button pressable text-ink-muted hover:text-ink -m-2 p-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M2 2l12 12M14 2L2 14"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </Link>
        <span className="round-counter text-ink-muted text-xs font-bold tracking-widest uppercase">
          Round {index + 1}/{rounds.length}
        </span>
        <span
          className={`streak-counter text-xs font-bold tracking-widest uppercase ${
            streak >= 2 ? "text-proof" : "text-ink-muted"
          }`}
        >
          Streak {streak}
        </span>
      </header>

      <div className="progress-strip mt-3">
        <ColorBar rounds={rounds} results={results} currentIndex={index} />
      </div>

      {/* Round clock: drains left to right, turns red when time runs short. */}
      <div
        className={`timer-row mt-2 flex items-center gap-2 ${timer === undefined ? "invisible" : ""}`}
        aria-hidden={timer === undefined}
      >
        <div className="timer-track bg-rule h-1.5 flex-1 overflow-hidden rounded-full">
          <div
            className={`timer-fill h-full rounded-full transition-[width] duration-100 ease-linear ${
              urgent ? "bg-flag" : "bg-ink"
            }`}
            style={{ width: `${(timer?.frac ?? 0) * 100}%` }}
          />
        </div>
        <span
          className={`timer-seconds w-4 text-right text-xs font-bold tabular-nums ${
            urgent ? "text-flag" : "text-ink-muted"
          }`}
        >
          {timer?.seconds ?? 0}
        </span>
      </div>

      <div className="mode-row mt-4 flex items-baseline justify-between">
        <p className="mode-label text-ink-muted text-[11px] font-bold tracking-[0.2em] uppercase">
          {MODE_LABELS[round.mode]}
        </p>
        {showSkip && (
          <button
            onClick={onSkip}
            className="skip-button pressable text-ink-muted hover:text-ink text-[11px] font-bold tracking-[0.2em] uppercase underline underline-offset-4"
          >
            Skip
          </button>
        )}
      </div>

      {/* Scrolls when a screen is taller than the viewport, so nothing clips
          on small phones; short content still pins its actions to the bottom. */}
      <main className="round-main mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
