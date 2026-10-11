import Link from "next/link";
import { ColorBar } from "./ColorBar";
import { CrossIcon } from "./Icons";
import type { PlayableMode, Round, RoundResult } from "@/lib/types";

/** Each mode keeps its home-card color as a small chrome marker. */
export const MODE_META: Record<PlayableMode, { label: string; dot: string }> = {
  colors: { label: "Name the palette", dot: "bg-block-orange" },
  shade: { label: "Exact shade", dot: "bg-block-pink" },
  fake: { label: "Real or fake", dot: "bg-block-yellow" },
  draw: { label: "Draw from memory", dot: "bg-block-green" },
  focus: { label: "Focus", dot: "bg-block-olive" },
};

const pad = (n: number) => String(n).padStart(2, "0");

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
  const meta = MODE_META[rounds[index].mode];
  const urgent = timer !== undefined && timer.frac <= 0.32;
  return (
    <div className="round-shell app-sheet mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden px-4 pt-4 pb-4">
      <header className="round-header flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Leave the game"
          className="quit-button pressable border-rule text-ink-muted hover:border-ink/30 hover:text-ink grid h-9 w-9 place-items-center rounded-full border"
        >
          <CrossIcon className="h-3.5 w-3.5" />
        </Link>
        <span className="round-counter text-ink-muted font-mono text-[11px] tracking-[0.14em] uppercase">
          Round <span className="text-ink font-semibold">{pad(index + 1)}</span>
          /{pad(rounds.length)}
        </span>
        <span
          className={`streak-counter font-mono text-[11px] tracking-[0.14em] uppercase ${
            streak >= 2 ? "text-proof" : "text-ink-muted"
          }`}
        >
          Streak{" "}
          <span
            key={streak}
            className={`streak-value inline-block font-semibold tabular-nums ${
              streak >= 2 ? "animate-pop" : "text-ink"
            }`}
          >
            {streak}
          </span>
        </span>
      </header>

      <div className="progress-strip mt-3.5">
        <ColorBar rounds={rounds} results={results} currentIndex={index} />
      </div>

      {/* Round clock: drains left to right, turns red when time runs short. */}
      <div
        className={`timer-row mt-2.5 flex items-center gap-3 ${timer === undefined ? "invisible" : ""}`}
        aria-hidden={timer === undefined}
      >
        <div className="timer-track bg-rule h-1 flex-1 overflow-hidden rounded-full">
          <div
            className={`timer-fill h-full origin-left rounded-full transition-transform duration-100 ease-linear ${
              urgent ? "bg-flag" : "bg-ink"
            }`}
            style={{ transform: `scaleX(${timer?.frac ?? 0})` }}
          />
        </div>
        <span
          key={urgent ? timer?.seconds : "calm"}
          className={`timer-seconds w-6 text-right font-mono text-xs font-semibold tabular-nums ${
            urgent ? "text-flag animate-tick" : "text-ink-muted"
          }`}
        >
          {timer?.seconds ?? 0}s
        </span>
      </div>

      <div className="mode-row mt-4 flex h-7 items-center justify-between">
        <p className="mode-label text-ink-muted flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase">
          <span className={`mode-dot h-2 w-2 rounded-full ${meta.dot}`} />
          {meta.label}
        </p>
        {showSkip && (
          <button
            onClick={onSkip}
            className="skip-button pressable border-rule text-ink-muted hover:border-ink/30 hover:text-ink rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.14em] uppercase"
          >
            Skip
          </button>
        )}
      </div>

      {/* Scrolls when a screen is taller than the viewport, so nothing clips
          on small phones; short content still pins its actions to the bottom. */}
      <main className="round-main -mx-4 mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
        {children}
      </main>
    </div>
  );
}
