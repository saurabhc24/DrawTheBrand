import Link from "next/link";
import { ColorBar } from "./ColorBar";
import type { Round, RoundResult } from "@/lib/types";

const MODE_LABELS: Record<string, string> = {
  colors: "Name the palette",
  shade: "Exact shade",
  crop: "Close-up",
};

export function RoundShell({
  rounds,
  results,
  index,
  streak,
  onSkip,
  showSkip,
  children,
}: {
  rounds: Round[];
  results: RoundResult[];
  index: number;
  streak: number;
  onSkip: () => void;
  showSkip: boolean;
  children: React.ReactNode;
}) {
  const round = rounds[index];
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
        <span className="font-mono text-xs tracking-widest text-ink-muted uppercase">
          Round {index + 1}/{rounds.length}
        </span>
        <span
          className={`font-mono text-xs tracking-widest uppercase ${
            streak >= 2 ? "text-proof" : "text-ink-muted"
          }`}
        >
          Streak {streak}
        </span>
      </header>

      <div className="mt-3">
        <ColorBar rounds={rounds} results={results} currentIndex={index} />
      </div>

      <div className="mt-6 flex items-baseline justify-between">
        <p className="font-mono text-[11px] tracking-[0.2em] text-ink-muted uppercase">
          {MODE_LABELS[round.mode]}
        </p>
        {showSkip && (
          <button
            onClick={onSkip}
            className="pressable font-mono text-[11px] tracking-[0.2em] text-ink-muted uppercase underline underline-offset-4 hover:text-ink"
          >
            Skip
          </button>
        )}
      </div>

      <main className="mt-3 flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
