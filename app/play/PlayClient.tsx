"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RoundShell } from "@/components/RoundShell";
import { RevealScreen } from "@/components/RevealScreen";
import { Results } from "@/components/Results";
import { ColorsRound } from "@/components/modes/ColorsRound";
import { ShadeRound } from "@/components/modes/ShadeRound";
import { CropRound } from "@/components/modes/CropRound";
import { buildSession } from "@/lib/session";
import type { Pack, PlayableMode, RoundResult, Session } from "@/lib/types";

const VALID_MODES = ["colors", "shade", "crop", "mixed"];
const VALID_PACKS = ["all", "indian", "global"];

export function PlayClient() {
  const params = useSearchParams();
  const mode = (VALID_MODES.includes(params.get("mode") ?? "")
    ? params.get("mode")
    : "mixed") as PlayableMode | "mixed";
  const pack = (VALID_PACKS.includes(params.get("pack") ?? "")
    ? params.get("pack")
    : "all") as Pack;

  // Built on the client only, so the seeded randomness never fights hydration.
  const [session, setSession] = useState<Session | null>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"question" | "reveal" | "done">("question");
  const [results, setResults] = useState<RoundResult[]>([]);

  useEffect(() => {
    setSession(buildSession(mode, pack));
  }, [mode, pack]);

  const streak = useMemo(() => {
    let n = 0;
    for (let i = results.length - 1; i >= 0 && results[i].correct; i--) n++;
    return n;
  }, [results]);

  const bestStreak = useMemo(() => {
    let best = 0;
    let run = 0;
    for (const r of results) {
      run = r.correct ? run + 1 : 0;
      best = Math.max(best, run);
    }
    return best;
  }, [results]);

  // In-session best streak only (PRD v1: sessionStorage, no cross-device state).
  useEffect(() => {
    if (bestStreak === 0) return;
    const prev = Number(sessionStorage.getItem("brandr:bestStreak") ?? 0);
    if (bestStreak > prev) sessionStorage.setItem("brandr:bestStreak", String(bestStreak));
  }, [bestStreak]);

  if (!session) return null;
  const rounds = session.rounds;
  const round = rounds[index];

  if (!round) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-ink-muted">
          This pack doesn't have enough brands for that mode yet.
        </p>
      </div>
    );
  }

  const answer = (picked: string, correct: boolean) => {
    setResults((prev) => [
      ...prev,
      { brand: round.brand, mode: round.mode, correct, skipped: false, picked },
    ]);
    setPhase("reveal");
  };

  const skip = () => {
    setResults((prev) => [
      ...prev,
      { brand: round.brand, mode: round.mode, correct: false, skipped: true },
    ]);
    setPhase("reveal");
  };

  const next = () => {
    if (index + 1 >= rounds.length) {
      setPhase("done");
    } else {
      setIndex(index + 1);
      setPhase("question");
    }
  };

  const replay = () => {
    setSession(buildSession(mode, pack));
    setIndex(0);
    setResults([]);
    setPhase("question");
  };

  if (phase === "done") {
    return (
      <Results rounds={rounds} results={results} bestStreak={bestStreak} onReplay={replay} />
    );
  }

  return (
    <RoundShell
      rounds={rounds}
      results={results}
      index={index}
      streak={streak}
      onSkip={skip}
      showSkip={phase === "question"}
    >
      {phase === "question" ? (
        round.mode === "colors" ? (
          <ColorsRound round={round} onPick={(id) => answer(id, id === round.brand.id)} />
        ) : round.mode === "shade" ? (
          <ShadeRound
            round={round}
            onPick={(hex) => answer(hex, hex === round.brand.colors[0].hex.toUpperCase())}
          />
        ) : (
          <CropRound round={round} onPick={(id) => answer(id, id === round.brand.id)} />
        )
      ) : (
        <RevealScreen
          result={results[results.length - 1]}
          isLast={index + 1 >= rounds.length}
          onNext={next}
        />
      )}
    </RoundShell>
  );
}
