"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RoundShell } from "@/components/RoundShell";
import { RevealScreen } from "@/components/RevealScreen";
import { Results } from "@/components/Results";
import { ColorsRound } from "@/components/modes/ColorsRound";
import { ShadeRound } from "@/components/modes/ShadeRound";
import { FakeRound } from "@/components/modes/FakeRound";
import { DrawRound } from "@/components/modes/DrawRound";
import { DRAW_PASS_SCORE } from "@/lib/drawScore";
import { buildSession } from "@/lib/session";
import type { Pack, PlayableMode, RoundResult, Session } from "@/lib/types";

const VALID_MODES = ["colors", "shade", "fake", "draw", "mixed"];
const VALID_PACKS = ["all", "indian", "global"];

/** Round clock per mode. Guess modes are snap decisions; drawing needs longer. */
const TIMER_SECONDS: Record<PlayableMode, number> = {
  colors: 5,
  shade: 5,
  fake: 5,
  draw: 30,
};

export function PlayClient() {
  const params = useSearchParams();
  const mode = (
    VALID_MODES.includes(params.get("mode") ?? "")
      ? params.get("mode")
      : "mixed"
  ) as PlayableMode | "mixed";
  const pack = (
    VALID_PACKS.includes(params.get("pack") ?? "") ? params.get("pack") : "all"
  ) as Pack;

  // Built on the client only, so the seeded randomness never fights hydration.
  const [session, setSession] = useState<Session | null>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"question" | "reveal" | "done">(
    "question",
  );
  const [results, setResults] = useState<RoundResult[]>([]);
  const [timerFrac, setTimerFrac] = useState(1);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    setSession(buildSession(mode, pack));
  }, [mode, pack]);

  const currentMode = session?.rounds[index]?.mode;

  // The round clock: ticks only while a question is on screen.
  useEffect(() => {
    if (!currentMode || phase !== "question") return;
    setTimeUp(false);
    setTimerFrac(1);
    const total = TIMER_SECONDS[currentMode] * 1000;
    const deadline = Date.now() + total;
    const tick = setInterval(() => {
      const frac = (deadline - Date.now()) / total;
      if (frac <= 0) {
        clearInterval(tick);
        setTimerFrac(0);
        setTimeUp(true);
      } else {
        setTimerFrac(frac);
      }
    }, 100);
    return () => clearInterval(tick);
  }, [currentMode, phase, index]);

  // Clock expiry for the tap modes; draw handles its own via the timeUp prop
  // (it scores whatever is on the canvas instead of forfeiting).
  useEffect(() => {
    if (!timeUp || phase !== "question") return;
    const round = session?.rounds[index];
    if (!round || round.mode === "draw") return;
    setResults((prev) => [
      ...prev,
      {
        brand: round.brand,
        mode: round.mode,
        correct: false,
        skipped: false,
        timedOut: true,
        ...(round.mode === "fake" ? { shownFake: round.fake ?? null } : {}),
      },
    ]);
    setPhase("reveal");
  }, [timeUp, phase, session, index]);

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
    if (bestStreak > prev)
      sessionStorage.setItem("brandr:bestStreak", String(bestStreak));
  }, [bestStreak]);

  if (!session) return null;
  const rounds = session.rounds;
  const round = rounds[index];

  if (!round) {
    return (
      <div className="empty-state mx-auto flex h-dvh max-w-md flex-col items-center justify-center overflow-hidden px-4 text-center">
        <p className="empty-state-note text-ink-muted text-sm">
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

  const submitFakeCall = (saidFake: boolean) => {
    const wasFake = round.fake != null;
    setResults((prev) => [
      ...prev,
      {
        brand: round.brand,
        mode: round.mode,
        correct: saidFake === wasFake,
        skipped: false,
        picked: saidFake ? "fake" : "real",
        shownFake: round.fake ?? null,
      },
    ]);
    setPhase("reveal");
  };

  const submitDrawing = (drawing: string, score: number) => {
    setResults((prev) => [
      ...prev,
      {
        brand: round.brand,
        mode: round.mode,
        correct: score >= DRAW_PASS_SCORE,
        skipped: false,
        drawing,
        score,
      },
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
      <Results
        rounds={rounds}
        results={results}
        bestStreak={bestStreak}
        onReplay={replay}
      />
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
      timer={
        phase === "question"
          ? {
              frac: timerFrac,
              seconds: Math.ceil(timerFrac * TIMER_SECONDS[round.mode]),
            }
          : undefined
      }
    >
      {phase === "question" ? (
        round.mode === "colors" ? (
          <ColorsRound
            round={round}
            onPick={(id) => answer(id, id === round.brand.id)}
          />
        ) : round.mode === "shade" ? (
          <ShadeRound
            round={round}
            onPick={(hex) =>
              answer(hex, hex === round.brand.colors[0].hex.toUpperCase())
            }
          />
        ) : round.mode === "draw" ? (
          <DrawRound
            round={round}
            onDone={submitDrawing}
            onSkip={skip}
            timeUp={timeUp}
          />
        ) : (
          <FakeRound round={round} onPick={submitFakeCall} />
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
